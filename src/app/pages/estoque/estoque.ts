import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../shared/api';
import { AuthService } from '../../shared/services/auth';
import {
  EstoqueService,
  ItemEstoque,
  MovimentacaoEstoque,
  TipoMovimentacaoEstoque
} from '../../shared/services/estoque';

interface FormularioMovimentacao {
  epiId: number | null;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  responsavel: string;
}

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './estoque.html',
  styleUrl: './estoque.css'
})
export class Estoque {

  movimentacao: FormularioMovimentacao;

  // Dados vindos do back end (GET /api/estoque e /api/estoque/movimentacoes)
  equipamentos: ItemEstoque[] = [];
  historico: MovimentacaoEstoque[] = [];

  // Mensagens devolvidas pelo back end
  erroLista = '';
  mensagemErro = '';
  mensagemSucesso = '';
  salvando = false;

  constructor(
    private estoqueService: EstoqueService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {
    // preenchido aqui (e não na declaração) porque usa o authService injetado
    this.movimentacao = this.formularioVazio();
    this.carregar();
  }

  private formularioVazio(): FormularioMovimentacao {
    return {
      epiId: null,
      tipo: 'Entrada',
      quantidade: 0,
      // sugere o usuário logado como responsável
      responsavel: this.authService.obterUsuarioAtual()?.nome ?? ''
    };
  }

  private carregar(): void {
    this.estoqueService.listar().subscribe({
      next: (equipamentos) => {
        this.equipamentos = equipamentos;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });

    this.estoqueService.historico().subscribe({
      next: (historico) => {
        this.historico = historico;
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  salvarMovimentacao(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const quantidade = Number(this.movimentacao.quantidade);

    if (
      this.movimentacao.epiId === null ||
      !quantidade ||
      quantidade <= 0 ||
      !this.movimentacao.responsavel.trim()
    ) {
      this.mensagemErro = 'Preencha o EPI, a quantidade (maior que zero) e o responsável.';
      return;
    }

    if (this.salvando) {
      return;
    }

    this.salvando = true;

    // O back end atualiza o saldo e aplica as regras (estoque não fica negativo, EPI vencido não entra)
    this.estoqueService
      .registrar({
        epiId: this.movimentacao.epiId,
        tipo: this.movimentacao.tipo,
        quantidade,
        responsavel: this.movimentacao.responsavel.trim()
      })
      .subscribe({
        next: () => {
          this.salvando = false;
          this.mensagemSucesso = 'Movimentação registrada com sucesso.';
          this.movimentacao = this.formularioVazio();
          this.changeDetector.markForCheck();
          this.carregar();
        },
        error: (erro) => {
          this.salvando = false;
          this.mensagemErro = mensagemDeErro(erro);
          this.changeDetector.markForCheck();
        }
      });
  }

}
