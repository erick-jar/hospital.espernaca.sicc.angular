import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { mensagemDeErro } from '../../shared/api';
import { Participante, Treinamento } from '../../shared/models/treinamento.model';
import { TreinamentoService } from '../../shared/services/treinamento';

export type { Participante, Treinamento } from '../../shared/models/treinamento.model';

@Component({
  selector: 'app-gestao-treinamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treinamento.html',
  styleUrls: ['./treinamento.css']
})
export class Treinamentos {
  // Filtros de Busca
  termoBusca: string = '';
  statusFiltro: string = 'TODOS';

  // Controle de Estado dos Modais
  exibirModal: boolean = false;
  modoEdicao: boolean = false;
  treinamentoSelecionado: Treinamento | null = null;

  // Form Models
  novoTreinamento: Partial<Treinamento> = { participantes: [] };
  novoParticipante: Participante = { nome: '', setor: '', presenca: false };

  // Dados vindos do back end (GET /api/treinamentos)
  treinamentos: Treinamento[] = [];

  // Mensagens devolvidas pelo back end
  erroLista: string = '';
  mensagemErro: string = '';
  salvando: boolean = false;

  constructor(
    private treinamentoService: TreinamentoService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.carregar();
  }

  private carregar(): void {
    this.treinamentoService.listar().subscribe({
      next: (treinamentos) => {
        this.treinamentos = treinamentos;
        this.erroLista = '';
        this.changeDetector.markForCheck();
      },
      error: (erro) => {
        this.erroLista = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  // Filtra a lista de treinamentos em tempo real
  get treinamentosFiltrados(): Treinamento[] {
    return this.treinamentos.filter(t => {
      const atendeBusca = !this.termoBusca ||
        t.titulo.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        (t.norma && t.norma.toLowerCase().includes(this.termoBusca.toLowerCase())) ||
        (t.instrutor && t.instrutor.toLowerCase().includes(this.termoBusca.toLowerCase()));

      const atendeStatus = this.statusFiltro === 'TODOS' || t.status === this.statusFiltro;

      return atendeBusca && atendeStatus;
    });
  }

  // --- GERENCIAMENTO DE MODAIS (CRIAR / EDITAR / DELETAR) ---

  abrirModalNovo(): void {
    this.modoEdicao = false;
    this.novoTreinamento = {
      titulo: '',
      norma: '',
      cargaHoraria: undefined,
      instrutor: '',
      dataRealizacao: '',
      status: 'Agendado',
      participantes: []
    };
    this.novoParticipante = { nome: '', setor: '', presenca: false };
    this.mensagemErro = '';
    this.exibirModal = true;
  }

  abrirModalEditar(treinamento: Treinamento): void {
    this.modoEdicao = true;
    // Clona o objeto para evitar alterações diretas na tabela antes de salvar
    this.novoTreinamento = JSON.parse(JSON.stringify(treinamento));
    if (!this.novoTreinamento.participantes) {
      this.novoTreinamento.participantes = [];
    }
    this.novoParticipante = { nome: '', setor: '', presenca: false };
    this.mensagemErro = '';
    this.exibirModal = true;
  }

  fecharModal(): void {
    this.exibirModal = false;
  }

  salvarTreinamento(): void {
    this.mensagemErro = '';

    if (!this.novoTreinamento.titulo || !this.novoTreinamento.dataRealizacao) {
      this.mensagemErro = 'Preencha os campos obrigatórios (Título e Data de Realização).';
      return;
    }

    if (this.salvando) {
      return;
    }

    const requisicao =
      this.modoEdicao && this.novoTreinamento.id !== undefined
        ? this.treinamentoService.atualizar(this.novoTreinamento.id, this.novoTreinamento)
        : this.treinamentoService.criar(this.novoTreinamento);

    this.salvando = true;

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.fecharModal();
        this.changeDetector.markForCheck();
        this.carregar();
      },
      error: (erro) => {
        // Ex.: "Um treinamento com data futura não pode ter o status Concluído."
        this.salvando = false;
        this.mensagemErro = mensagemDeErro(erro);
        this.changeDetector.markForCheck();
      }
    });
  }

  excluirTreinamento(treinamento: Treinamento): void {
    if (treinamento.id === undefined) {
      return;
    }

    if (confirm(`Deseja realmente excluir o treinamento "${treinamento.titulo}"?`)) {
      this.treinamentoService.excluir(treinamento.id).subscribe({
        next: () => this.carregar(),
        error: (erro) => {
          this.erroLista = mensagemDeErro(erro);
          this.changeDetector.markForCheck();
        }
      });
    }
  }

  // --- MANIPULAÇÃO DE PARTICIPANTES NO MODAL ---

  adicionarParticipanteModal(): void {
    if (this.novoParticipante.nome.trim()) {
      if (!this.novoTreinamento.participantes) {
        this.novoTreinamento.participantes = [];
      }
      this.novoTreinamento.participantes.push({ ...this.novoParticipante });
      this.novoParticipante = { nome: '', setor: '', presenca: false };
    }
  }

  removerParticipanteModal(index: number): void {
    if (this.novoTreinamento.participantes) {
      this.novoTreinamento.participantes.splice(index, 1);
    }
  }

  // --- MODAL DE DETALHES DOS PARTICIPANTES ---

  verParticipantes(treinamento: Treinamento): void {
    this.treinamentoSelecionado = treinamento;
  }

  fecharDetalhes(): void {
    this.treinamentoSelecionado = null;
  }
}
