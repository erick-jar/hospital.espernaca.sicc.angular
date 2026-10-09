import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



export interface ItemRelatorioTreinamento {
  titulo: string;
  norma?: string;
  data: string; // Formato YYYY-MM-DD
  concluidos: number;
  pendentes: number;
  status: 'Regular' | 'Atenção' | 'Crítico';
}

export interface ItemRelatorioEstoque {
  codigo: string;
  item: string;
  data: string; // Formato YYYY-MM-DD
  saldo: number;
  estoqueMinimo: number;
  setor?: string;
  status: 'OK' | 'REPOR' | 'CRÍTICO';
}

export interface ItemRelatorioEntrega {
  data: string; // Formato YYYY-MM-DD
  colaborador: string;
  setor: string;
  epi: string;
  motivo: string;
}
@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio.html',
  styleUrls: ['./relatorio.css']
})

export class Relatorio implements OnInit {

  // Filtros selecionados no formulário
  tipoRelatorioSelecionado: 'TREINAMENTOS' | 'ESTOQUE' | 'ENTREGAS' = 'TREINAMENTOS';
  dataInicio: string = '';
  dataFim: string = '';
  setorFiltro: string = 'TODOS';
  buscaColaborador: string = '';

  // Listas Exibidas na Tela (Filtradas)
  relatorioTreinamentos: ItemRelatorioTreinamento[] = [];
  relatorioEstoque: ItemRelatorioEstoque[] = [];
  relatorioEntregas: ItemRelatorioEntrega[] = [];

  // Base de Dados Simulado (Dados Brutos)
  private todosTreinamentos: ItemRelatorioTreinamento[] = [
    { titulo: 'Trabalho em Altura', norma: 'NR-35', data: '2026-05-10', concluidos: 15, pendentes: 2, status: 'Regular' },
    { titulo: 'Segurança em Instalações Elétricas', norma: 'NR-10', data: '2026-06-15', concluidos: 8, pendentes: 5, status: 'Atenção' },
    { titulo: 'Operação de Empilhadeira', norma: 'NR-11', data: '2026-07-20', concluidos: 12, pendentes: 0, status: 'Regular' },
    { titulo: 'Proteção Contra Incêndios', norma: 'NR-23', data: '2026-08-01', concluidos: 20, pendentes: 4, status: 'Atenção' }
  ];

  private todosEstoque: ItemRelatorioEstoque[] = [
    { codigo: 'EPI-001', item: 'Capacete de Segurança com Jugular', data: '2026-08-01', saldo: 45, estoqueMinimo: 15, setor: 'Operações', status: 'OK' },
    { codigo: 'EPI-002', item: 'Luva de Vaqueta Cano Curto', data: '2026-08-03', saldo: 8, estoqueMinimo: 20, setor: 'Manutenção', status: 'CRÍTICO' },
    { codigo: 'EPI-003', item: 'Óculos de Proteção Incolor', data: '2026-08-05', saldo: 18, estoqueMinimo: 20, setor: 'Pintura', status: 'REPOR' },
    { codigo: 'EPI-004', item: 'Protetor Auditivo do Tipo Plug', data: '2026-08-08', saldo: 120, estoqueMinimo: 50, setor: 'Operações', status: 'OK' }
  ];

  private todasEntregas: ItemRelatorioEntrega[] = [
    { data: '2026-08-01', colaborador: 'João Pedro', setor: 'Manutenção', epi: 'Luva de Vaqueta', motivo: 'Substituição por desgaste' },
    { data: '2026-08-03', colaborador: 'Ana Maria', setor: 'Operações', epi: 'Óculos de Proteção', motivo: 'Novo colaborador' },
    { data: '2026-08-05', colaborador: 'Carlos Eduardo', setor: 'Pintura', epi: 'Máscara PFF2', motivo: 'Vencimento do CA' },
    { data: '2026-08-08', colaborador: 'Lucas Lima', setor: 'Manutenção', epi: 'Bota de Segurança', motivo: 'Substituição por dano' }
  ];

  ngOnInit(): void {
    this.filtrarDados();
  }

  /**
   * Aplica a lógica de filtros de acordo com o relatório ativo
   */
  filtrarDados(): void {
    switch (this.tipoRelatorioSelecionado) {
      case 'TREINAMENTOS':
        this.filtrarTreinamentos();
        break;
      case 'ESTOQUE':
        this.filtrarEstoque();
        break;
      case 'ENTREGAS':
        this.filtrarEntregas();
        break;
    }
  }

  private filtrarTreinamentos(): void {
    this.relatorioTreinamentos = this.todosTreinamentos.filter(item => {
      return this.validarPeriodoData(item.data);
    });
  }

  private filtrarEstoque(): void {
    this.relatorioEstoque = this.todosEstoque.filter(item => {
      const atendeData = this.validarPeriodoData(item.data);
      const atendeSetor = this.setorFiltro === 'TODOS' || item.setor === this.setorFiltro;
      return atendeData && atendeSetor;
    });
  }

  private filtrarEntregas(): void {
    this.relatorioEntregas = this.todasEntregas.filter(item => {
      const atendeData = this.validarPeriodoData(item.data);
      const atendeSetor = this.setorFiltro === 'TODOS' || item.setor === this.setorFiltro;
      const atendeNome = !this.buscaColaborador.trim() || 
        item.colaborador.toLowerCase().includes(this.buscaColaborador.toLowerCase().trim());

      return atendeData && atendeSetor && atendeNome;
    });
  }

  /**
   * Compara strings no formato YYYY-MM-DD para evitar inconsistências de fuso horário/timezone
   */
  private validarPeriodoData(dataStr: string): boolean {
    if (!dataStr) return true;
    const atendeInicio = !this.dataInicio || dataStr >= this.dataInicio;
    const atendeFim = !this.dataFim || dataStr <= this.dataFim;
    return atendeInicio && atendeFim;
  }

  /**
   * Abre apenas a tabela ativa em uma janela separada para impressão.
   */
  imprimirTabela(): void {
    const areaTabela = document.querySelector('.table-responsive');

    if (!areaTabela) {
      return;
    }

    const janela = window.open('', '_blank', 'width=900,height=700');

    if (!janela) {
      alert('Seu navegador bloqueou a janela de impressão. Permita pop-ups e tente novamente.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Relatório</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            h2 {
              margin: 0 0 16px;
              font-size: 22px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th, td {
              border: 1px solid #d1d5db;
              padding: 10px 12px;
              text-align: left;
              vertical-align: middle;
            }

            th {
              background: #f3f4f6;
              font-weight: 700;
            }

            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 700;
            }

            .bg-success { background: #dcfce7; color: #166534; }
            .bg-warning { background: #fef3c7; color: #92400e; }
            .bg-danger { background: #fee2e2; color: #991b1b; }
            .bg-danger-subtle { background: #fef2f2; color: #b91c1c; }
            .text-danger-emphasis { color: #7f1d1d; }
            .border-danger-subtle { border: 1px solid #fecaca; }
            code {
              background: #f3f4f6;
              border-radius: 4px;
              padding: 2px 6px;
            }
          </style>
        </head>
        <body>
          <h2>Relatório do Sistema</h2>
          ${areaTabela.outerHTML}
        </body>
      </html>
    `;

    janela.document.write(html);
    janela.document.close();
    janela.focus();

    setTimeout(() => {
      janela.print();
      janela.close();
    }, 300);
  }
}