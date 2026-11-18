import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../../shared/api';
import { Funcao } from '../../../shared/models/funcao.model';
import { FuncaoService } from '../../../shared/services/funcao';

interface FormularioFuncao {
  nome: string;
  descricao: string;
  setor: string;
  episObrigatoriosTexto: string;
  status: 'Ativo' | 'Inativo';
}

@Component({
  selector: 'app-funcoes',
  imports: [CommonModule, FormsModule],
  templateUrl: './funcoes.html',
  styleUrl: './funcoes.css'
})
export class Funcoes {
  funcoes: Funcao[] = [];
  termoBusca = '';

  modalAberto = false;
  modoEdicao = false;
  funcaoEmEdicaoId: number | null = null;

  formulario: FormularioFuncao = this.formularioVazio();

  funcaoParaExcluir: Funcao | null = null;

  tentouSalvar = false;
  salvando = false;

  // Mensagens devolvidas pelo back end (regras de negócio, campos obrigatórios, falta de permissão...)
  erroLista = '';
  mensagemErro = '';
  erroExclusao = '';

  constructor(
    private funcaoService: FuncaoService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.funcaoService.listar().subscribe({
      next: (funcoes) => {
        this.funcoes = funcoes;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  private formularioVazio(): FormularioFuncao {
    return {
      nome: '',
      descricao: '',
      setor: '',
      episObrigatoriosTexto: '',
      status: 'Ativo'
    };
  }

  get funcoesFiltradas(): Funcao[] {
    const termo = this.termoBusca.trim().toLowerCase();

    if (!termo) {
      return this.funcoes;
    }

    return this.funcoes.filter((f) =>
      f.nome.toLowerCase().includes(termo) ||
      f.setor.toLowerCase().includes(termo)
    );
  }

  abrirNovo(): void {
    this.modoEdicao = false;
    this.funcaoEmEdicaoId = null;
    this.formulario = this.formularioVazio();
    this.tentouSalvar = false;
    this.mensagemErro = '';
    this.modalAberto = true;
  }

  abrirEdicao(funcao: Funcao): void {
    this.modoEdicao = true;
    this.funcaoEmEdicaoId = funcao.id;
    this.formulario = {
      nome: funcao.nome,
      descricao: funcao.descricao ?? '',
      setor: funcao.setor,
      episObrigatoriosTexto: (funcao.episObrigatorios ?? []).join(', '),
      status: funcao.status
    };
    this.tentouSalvar = false;
    this.mensagemErro = '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  formularioValido(): boolean {
    return !!(this.formulario.nome.trim() && this.formulario.setor.trim());
  }

  salvar(): void {
    this.tentouSalvar = true;
    this.mensagemErro = '';

    if (!this.formularioValido()) {
      this.mensagemErro = 'Preencha todos os campos obrigatórios (*).';
      return;
    }

    if (this.salvando) {
      return;
    }

    const dados: Omit<Funcao, 'id'> = {
      nome: this.formulario.nome,
      descricao: this.formulario.descricao,
      setor: this.formulario.setor,
      episObrigatorios: this.formulario.episObrigatoriosTexto
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      status: this.formulario.status
    };

    const requisicao =
      this.modoEdicao && this.funcaoEmEdicaoId !== null
        ? this.funcaoService.atualizar(this.funcaoEmEdicaoId, dados)
        : this.funcaoService.criar(dados);

    this.salvando = true;

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.changeDetector.markForCheck();
        this.carregar();
      },
      error: (erro) => {
        // Ex.: "Já existe uma função cadastrada com o nome Técnico de Enfermagem."
        this.salvando = false;
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  confirmarExclusao(funcao: Funcao): void {
    this.erroExclusao = '';
    this.funcaoParaExcluir = funcao;
  }

  cancelarExclusao(): void {
    this.funcaoParaExcluir = null;
  }

  excluir(): void {
    if (!this.funcaoParaExcluir) {
      return;
    }

    this.funcaoService.excluir(this.funcaoParaExcluir.id).subscribe({
      next: () => {
        this.funcaoParaExcluir = null;
        this.changeDetector.markForCheck();
        this.carregar();
      },
      error: (erro) => {
        this.erroExclusao = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }
}
