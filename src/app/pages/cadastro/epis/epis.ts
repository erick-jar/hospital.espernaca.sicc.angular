import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../../shared/api';
import { Epi } from '../../../shared/models/epi.model';
import { EpiService } from '../../../shared/services/epi';

@Component({
  selector: 'app-epis',
  imports: [CommonModule, FormsModule],
  templateUrl: './epis.html',
  styleUrl: './epis.css'
})
export class Epis {
  epis: Epi[] = [];
  termoBusca = '';

  modalAberto = false;
  modoEdicao = false;
  epiEmEdicaoId: number | null = null;

  formulario: Omit<Epi, 'id'> = this.formularioVazio();

  epiParaExcluir: Epi | null = null;

  tentouSalvar = false;
  salvando = false;

  // Mensagens devolvidas pelo back end (regras de negócio, campos obrigatórios, falta de permissão...)
  erroLista = '';
  mensagemErro = '';
  erroExclusao = '';

  constructor(
    private epiService: EpiService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.epiService.listar().subscribe({
      next: (epis) => {
        this.epis = epis;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  private formularioVazio(): Omit<Epi, 'id'> {
    return {
      codigo: '',
      nome: '',
      descricao: '',
      ca: '',
      validade: '',
      fabricante: '',
      categoria: '',
      estoqueMinimo: 0,
      status: 'Ativo'
    };
  }

  get episFiltrados(): Epi[] {
    const termo = this.termoBusca.trim().toLowerCase();

    if (!termo) {
      return this.epis;
    }

    return this.epis.filter((e) =>
      e.nome.toLowerCase().includes(termo) ||
      e.codigo.toLowerCase().includes(termo) ||
      e.categoria.toLowerCase().includes(termo)
    );
  }

  abrirNovo(): void {
    this.modoEdicao = false;
    this.epiEmEdicaoId = null;
    this.formulario = this.formularioVazio();
    this.tentouSalvar = false;
    this.mensagemErro = '';
    this.modalAberto = true;
  }

  abrirEdicao(epi: Epi): void {
    this.modoEdicao = true;
    this.epiEmEdicaoId = epi.id;
    this.formulario = {
      codigo: epi.codigo,
      nome: epi.nome,
      descricao: epi.descricao ?? '',
      ca: epi.ca,
      validade: epi.validade,
      fabricante: epi.fabricante,
      categoria: epi.categoria,
      estoqueMinimo: epi.estoqueMinimo,
      status: epi.status
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
      this.formulario.codigo.trim() &&
      this.formulario.nome.trim() &&
      this.formulario.ca.trim() &&
      this.formulario.validade.trim() &&
      this.formulario.fabricante.trim() &&
      this.formulario.categoria.trim()
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
      this.modoEdicao && this.epiEmEdicaoId !== null
        ? this.epiService.atualizar(this.epiEmEdicaoId, this.formulario)
        : this.epiService.criar(this.formulario);

    this.salvando = true;

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.changeDetector.markForCheck();
        this.carregar();
      },
      error: (erro) => {
        // Ex.: "Já existe um EPI cadastrado com o código EPI-001."
        this.salvando = false;
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  confirmarExclusao(epi: Epi): void {
    this.erroExclusao = '';
    this.epiParaExcluir = epi;
  }

  cancelarExclusao(): void {
    this.epiParaExcluir = null;
  }

  excluir(): void {
    if (!this.epiParaExcluir) {
      return;
    }

    this.epiService.excluir(this.epiParaExcluir.id).subscribe({
      next: () => {
        this.epiParaExcluir = null;
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
