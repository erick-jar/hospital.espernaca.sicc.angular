import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../../shared/api';
import { Colaborador } from '../../../shared/models/colaborador.model';
import { Funcao } from '../../../shared/models/funcao.model';
import { ColaboradorService } from '../../../shared/services/colaborador';
import { FuncaoService } from '../../../shared/services/funcao';

@Component({
  selector: 'app-colaboradores',
  imports: [CommonModule, FormsModule],
  templateUrl: './colaboradores.html',
  styleUrl: './colaboradores.css'
})
export class Colaboradores {
  colaboradores: Colaborador[] = [];

  // Funções vindas do back end (GET /api/funcoes) para o select do formulário
  funcoes: Funcao[] = [];
  erroFuncoes = '';
  termoBusca = '';

  modalAberto = false;
  modoEdicao = false;
  colaboradorEmEdicaoId: number | null = null;

  formulario: Omit<Colaborador, 'id'> = this.formularioVazio();

  colaboradorParaExcluir: Colaborador | null = null;

  tentouSalvar = false;
  salvando = false;

  // Mensagens devolvidas pelo back end (regras de negócio, campos obrigatórios, falta de permissão...)
  erroLista = '';
  mensagemErro = '';
  erroExclusao = '';

  constructor(
    private colaboradorService: ColaboradorService,
    private funcaoService: FuncaoService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregar();
    this.carregarFuncoes();
  }

  private carregarFuncoes(): void {
    this.funcaoService.listar().subscribe({
      next: (funcoes) => {
        this.funcoes = funcoes;
        this.erroFuncoes = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroFuncoes = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  /** Opções do select: funções ativas (e a função atual do colaborador, mesmo se inativa). */
  get funcoesDoSelect(): Funcao[] {
    return this.funcoes.filter(
      (funcao) => funcao.status === 'Ativo' || funcao.id === this.formulario.funcaoId
    );
  }

  /** Ao escolher a função no select, guarda o id e puxa o setor correspondente. */
  aoSelecionarFuncao(funcaoId: number | null): void {
    const funcao = this.funcoes.find((f) => f.id === funcaoId);

    this.formulario.funcaoId = funcaoId;
    this.formulario.funcao = funcao?.nome ?? '';
    this.formulario.setor = funcao?.setor ?? '';
  }

  private carregar(): void {
    this.colaboradorService.listar().subscribe({
      next: (colaboradores) => {
        this.colaboradores = colaboradores;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  private formularioVazio(): Omit<Colaborador, 'id'> {
    return {
      matricula: '',
      nome: '',
      cpf: '',
      funcaoId: null,
      setor: '',
      funcao: '',
      admissao: '',
      contato: '',
      status: 'Ativo'
    };
  }

  get colaboradoresFiltrados(): Colaborador[] {
    const termo = this.termoBusca.trim().toLowerCase();

    if (!termo) {
      return this.colaboradores;
    }

    return this.colaboradores.filter((c) =>
      c.nome.toLowerCase().includes(termo) ||
      c.matricula.toLowerCase().includes(termo) ||
      c.setor.toLowerCase().includes(termo)
    );
  }

  abrirNovo(): void {
    this.modoEdicao = false;
    this.colaboradorEmEdicaoId = null;
    this.formulario = this.formularioVazio();
    this.tentouSalvar = false;
    this.mensagemErro = '';
    this.modalAberto = true;
  }

  abrirEdicao(colaborador: Colaborador): void {
    this.modoEdicao = true;
    this.colaboradorEmEdicaoId = colaborador.id;
    this.formulario = {
      matricula: colaborador.matricula,
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      funcaoId: colaborador.funcaoId,
      setor: colaborador.setor,
      funcao: colaborador.funcao,
      admissao: colaborador.admissao,
      contato: colaborador.contato ?? '',
      status: colaborador.status
    };
    this.tentouSalvar = false;
    this.mensagemErro = '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  formularioValido(): boolean {
    return !!(
      this.formulario.matricula.trim() &&
      this.formulario.nome.trim() &&
      this.formulario.cpf.trim() &&
      this.formulario.funcaoId !== null &&
      this.formulario.admissao.trim()
    );
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

    const requisicao =
      this.modoEdicao && this.colaboradorEmEdicaoId !== null
        ? this.colaboradorService.atualizar(this.colaboradorEmEdicaoId, this.formulario)
        : this.colaboradorService.criar(this.formulario);

    this.salvando = true;

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.changeDetector.markForCheck();
        this.carregar();
      },
      error: (erro) => {
        // Ex.: "Já existe um colaborador cadastrado com a matrícula 2001."
        this.salvando = false;
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  confirmarExclusao(colaborador: Colaborador): void {
    this.erroExclusao = '';
    this.colaboradorParaExcluir = colaborador;
  }

  cancelarExclusao(): void {
    this.colaboradorParaExcluir = null;
  }

  excluir(): void {
    if (!this.colaboradorParaExcluir) {
      return;
    }

    this.colaboradorService.excluir(this.colaboradorParaExcluir.id).subscribe({
      next: () => {
        this.colaboradorParaExcluir = null;
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
