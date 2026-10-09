import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../shared/api';
import { Epi } from '../../shared/models/epi.model';
import { EpiService } from '../../shared/services/epi';
import {
  MovimentacaoEpi,
  MovimentacaoEpiService,
  StatusMovimentacaoEpi,
  TipoMovimentacaoEpi
} from '../../shared/services/movimentacao-epi';

interface FormularioMovimentacao {
  tipo: TipoMovimentacaoEpi;
  funcionario: string;
  matricula: string;
  epiId: number | null;
  quantidade: number;
  data: string;
  status: StatusMovimentacaoEpi;
  observacoes: string;
}

@Component({
  selector: 'app-gestao-de-epis',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './gestao-de-epis.html',
  styleUrls: ['./gestao-de-epis.css']
})
export class GestaoDeEpis {
  readonly tipos: TipoMovimentacaoEpi[] = ['Entrega', 'Devolução', 'Troca'];

  formulario: FormularioMovimentacao = this.formularioVazio('Entrega');

  // Dados vindos do back end
  epis: Epi[] = [];
  movimentacoes: MovimentacaoEpi[] = [];

  // Mensagens devolvidas pelo back end
  erroLista = '';
  mensagemErro = '';
  mensagemSucesso = '';
  salvando = false;

  constructor(
    private movimentacaoEpiService: MovimentacaoEpiService,
    private epiService: EpiService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregar();
  }

  /** Só as mais recentes aparecem na tabela "Últimas Movimentações". */
  get ultimasMovimentacoes(): MovimentacaoEpi[] {
    return this.movimentacoes.slice(0, 10);
  }

  private formularioVazio(tipo: TipoMovimentacaoEpi): FormularioMovimentacao {
    return {
      tipo,
      funcionario: '',
      matricula: '',
      epiId: null,
      quantidade: 1,
      data: this.hoje(),
      status: 'Concluído',
      observacoes: ''
    };
  }

  /** Data de hoje no formato AAAA-MM-DD, no horário local (toISOString usaria UTC e poderia virar "amanhã"). */
  private hoje(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${agora.getFullYear()}-${mes}-${dia}`;
  }

  private carregar(): void {
    this.epiService.listar().subscribe({
      next: (epis) => {
        this.epis = epis.filter((epi) => epi.status === 'Ativo');
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });

    this.movimentacaoEpiService.listar().subscribe({
      next: (movimentacoes) => {
        this.movimentacoes = movimentacoes;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  selecionarTipo(tipo: TipoMovimentacaoEpi): void {
    this.formulario.tipo = tipo;
  }

  limpar(): void {
    this.formulario = this.formularioVazio(this.formulario.tipo);
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  salvar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const quantidade = Number(this.formulario.quantidade);

    if (
      !this.formulario.matricula.trim() ||
      this.formulario.epiId === null ||
      !quantidade ||
      quantidade < 1 ||
      !this.formulario.data
    ) {
      this.mensagemErro = 'Preencha a matrícula, o EPI, a quantidade (mínimo 1) e a data.';
      return;
    }

    if (this.salvando) {
      return;
    }

    const tipo = this.formulario.tipo;
    this.salvando = true;

    // O back end aplica as regras: EPI dentro da validade, colaborador ativo, estoque suficiente...
    this.movimentacaoEpiService
      .registrar({
        tipo,
        matricula: this.formulario.matricula.trim(),
        epiId: this.formulario.epiId,
        quantidade,
        data: this.formulario.data,
        status: this.formulario.status,
        observacoes: this.formulario.observacoes
      })
      .subscribe({
        next: (movimentacao) => {
          this.salvando = false;
          this.mensagemSucesso = `${tipo} registrada com sucesso para ${movimentacao.funcionario}.`;
          this.formulario = this.formularioVazio(tipo);
          this.changeDetector.markForCheck();
          this.carregar();
        },
        error: (erro) => {
          // Ex.: "O EPI "Óculos de Proteção" está vencido desde 31/12/2025 e não pode ser entregue."
          this.salvando = false;
          this.mensagemErro = mensagemDeErro(erro);
          this.changeDetector.markForCheck();
        }
      });
  }
}
