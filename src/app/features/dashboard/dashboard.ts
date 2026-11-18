import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { baixarCsv, CelulaCsv, gerarCsv } from './dashboard-csv';

type PeriodoGrafico = 'ultimos-6-meses' | 'ultimos-12-meses' | 'ano-atual';
type TomIndicador = 'secondary' | 'danger' | 'primary' | 'success';
type TendenciaVariacao = 'positiva' | 'negativa' | 'neutra';
type TendenciaIndicador = TendenciaVariacao | 'critica';
type NivelValidade = 'critico' | 'atencao' | 'regular';
type StatusMovimentacao = 'Entregue' | 'Troca' | 'Devolvido';
type PrioridadePendencia = 'critica' | 'atencao';
type StatusPendencia = 'pendente' | 'em-andamento' | 'concluida';
type TipoPendencia = 'validade' | 'troca-programada' | 'entrega-pendente' | 'devolucao-atrasada';

interface IndicadorDashboard {
  id: string;
  titulo: string;
  valor: number;
  sufixo?: string;
  detalhe: string;
  icone: string;
  tom: TomIndicador;
  tendencia: TendenciaIndicador;
}

interface FiltroPeriodo {
  valor: PeriodoGrafico;
  rotulo: string;
}

interface SetorDashboard {
  id: string;
  nome: string;
}

interface MetricasDashboard {
  totalEpisEntregues: number;
  itensVencidos: number;
  itensCriticos: number;
  totalColaboradores: number;
  colaboradoresComEpiAtivo: number;
  conformidade: number;
  variacaoConformidadePontos: number;
}

interface ResumoSetorDashboard {
  setorId: string;
  metricas: MetricasDashboard;
}

interface QuantidadeEntregaSetor {
  setorId: string;
  quantidade: number;
}

export interface EntregaPeriodo {
  id: string;
  rotulo: string;
  mesCompleto: string;
  ano: number;
  quantidade: number;
  quantidadesPorSetor: readonly QuantidadeEntregaSetor[];
}

interface ValidadeProxima {
  id: number;
  epiId: number;
  epi: string;
  ca: string;
  lote: string;
  dataValidade: string;
  diasRestantes: number;
  percentualPrazo: number;
  nivel: NivelValidade;
  status: string;
  setorIds: readonly string[];
}

interface MovimentacaoRecente {
  id: number;
  colaboradorId: number;
  colaborador: string;
  funcao: string;
  setor: string;
  setorId: string;
  epiId: number;
  epi: string;
  ca: string;
  dataHora: string;
  status: StatusMovimentacao;
}

interface PendenciaDia {
  id: string;
  setorIds: readonly string[];
  tipo: TipoPendencia;
  titulo: string;
  descricao: string;
  prioridade: PrioridadePendencia;
  status: StatusPendencia;
  dataLimite: string;
  horaLimite?: string;
  quantidade: number;
  origemModulo: 'gestao-epis' | 'estoque';
  referenciaId: string;
}

const QUANTIDADES_ENTREGAS_MOCK: readonly number[] = [
  142, 158, 151, 167, 164, 173, 156, 172, 181, 205, 210, 236,
];

const SETORES_DASHBOARD_MOCK: readonly SetorDashboard[] = [
  { id: 'uti', nome: 'UTI' },
  { id: 'pronto-atendimento', nome: 'Pronto Atendimento' },
  { id: 'centro-cirurgico', nome: 'Centro Cirúrgico' },
  { id: 'analises-clinicas', nome: 'Análises Clínicas' },
  { id: 'reabilitacao', nome: 'Reabilitação' },
];

const DISTRIBUICAO_ENTREGAS_MOCK: readonly { setorId: string; peso: number }[] = [
  { setorId: 'uti', peso: 610 },
  { setorId: 'pronto-atendimento', peso: 570 },
  { setorId: 'centro-cirurgico', peso: 720 },
  { setorId: 'analises-clinicas', peso: 480 },
  { setorId: 'reabilitacao', peso: 466 },
];

const METRICAS_GERAIS_MOCK: MetricasDashboard = {
  totalEpisEntregues: 2846,
  itensVencidos: 12,
  itensCriticos: 5,
  totalColaboradores: 248,
  colaboradoresComEpiAtivo: 231,
  conformidade: 94,
  variacaoConformidadePontos: 2.1,
};

const RESUMOS_SETORES_MOCK: readonly ResumoSetorDashboard[] = [
  {
    setorId: 'uti',
    metricas: {
      totalEpisEntregues: 610,
      itensVencidos: 3,
      itensCriticos: 2,
      totalColaboradores: 52,
      colaboradoresComEpiAtivo: 49,
      conformidade: 92,
      variacaoConformidadePontos: 1.3,
    },
  },
  {
    setorId: 'pronto-atendimento',
    metricas: {
      totalEpisEntregues: 570,
      itensVencidos: 4,
      itensCriticos: 2,
      totalColaboradores: 61,
      colaboradoresComEpiAtivo: 55,
      conformidade: 90,
      variacaoConformidadePontos: -0.8,
    },
  },
  {
    setorId: 'centro-cirurgico',
    metricas: {
      totalEpisEntregues: 720,
      itensVencidos: 2,
      itensCriticos: 1,
      totalColaboradores: 48,
      colaboradoresComEpiAtivo: 47,
      conformidade: 97,
      variacaoConformidadePontos: 1.4,
    },
  },
  {
    setorId: 'analises-clinicas',
    metricas: {
      totalEpisEntregues: 480,
      itensVencidos: 1,
      itensCriticos: 0,
      totalColaboradores: 39,
      colaboradoresComEpiAtivo: 38,
      conformidade: 96,
      variacaoConformidadePontos: 0.6,
    },
  },
  {
    setorId: 'reabilitacao',
    metricas: {
      totalEpisEntregues: 466,
      itensVencidos: 2,
      itensCriticos: 0,
      totalColaboradores: 48,
      colaboradoresComEpiAtivo: 42,
      conformidade: 93,
      variacaoConformidadePontos: 0.9,
    },
  },
];

const MESES_PT_BR = [
  { rotulo: 'Jan', nome: 'Janeiro' },
  { rotulo: 'Fev', nome: 'Fevereiro' },
  { rotulo: 'Mar', nome: 'Março' },
  { rotulo: 'Abr', nome: 'Abril' },
  { rotulo: 'Mai', nome: 'Maio' },
  { rotulo: 'Jun', nome: 'Junho' },
  { rotulo: 'Jul', nome: 'Julho' },
  { rotulo: 'Ago', nome: 'Agosto' },
  { rotulo: 'Set', nome: 'Setembro' },
  { rotulo: 'Out', nome: 'Outubro' },
  { rotulo: 'Nov', nome: 'Novembro' },
  { rotulo: 'Dez', nome: 'Dezembro' },
] as const;

export function gerarEntregasUltimos12Meses(dataReferencia: Date): readonly EntregaPeriodo[] {
  return QUANTIDADES_ENTREGAS_MOCK.map((quantidade, indice) => {
    const competencia = new Date(
      dataReferencia.getFullYear(),
      dataReferencia.getMonth() - (QUANTIDADES_ENTREGAS_MOCK.length - 1 - indice),
      1,
      12,
    );
    const mes = competencia.getMonth();
    const ano = competencia.getFullYear();

    return {
      id: `${ano}-${String(mes + 1).padStart(2, '0')}`,
      rotulo: MESES_PT_BR[mes].rotulo,
      mesCompleto: MESES_PT_BR[mes].nome,
      ano,
      quantidade,
      quantidadesPorSetor: distribuirEntregasPorSetor(quantidade),
    };
  });
}

function distribuirEntregasPorSetor(quantidadeTotal: number): readonly QuantidadeEntregaSetor[] {
  const pesoTotal = DISTRIBUICAO_ENTREGAS_MOCK.reduce(
    (total, distribuicao) => total + distribuicao.peso,
    0,
  );
  let quantidadeDistribuida = 0;

  return DISTRIBUICAO_ENTREGAS_MOCK.map((distribuicao, indice) => {
    const ultimoSetor = indice === DISTRIBUICAO_ENTREGAS_MOCK.length - 1;
    const quantidade = ultimoSetor
      ? quantidadeTotal - quantidadeDistribuida
      : Math.floor((quantidadeTotal * distribuicao.peso) / pesoTotal);

    quantidadeDistribuida += quantidade;

    return { setorId: distribuicao.setorId, quantidade };
  });
}

function criarDataIso(dataReferencia: Date, diasAdicionais = 0): string {
  const data = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate() + diasAdicionais,
    12,
  );

  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
}

function criarDataHoraMock(dataReferencia: Date, minutosAnteriores: number): string {
  return new Date(dataReferencia.getTime() - minutosAnteriores * 60_000).toISOString();
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy {
  private readonly documento = inject(DOCUMENT);
  private readonly dataReferencia = new Date();
  private readonly agoraState = signal(new Date());
  private readonly metricasGeraisState = signal<MetricasDashboard>({ ...METRICAS_GERAIS_MOCK });
  private readonly setorSelecionadoIdState = signal<string | null>(null);
  private readonly pendenciasExpandidasState = signal(false);
  private readonly atualizadorRelogio = this.documento.defaultView?.setInterval(
    () => this.atualizarRelogio(),
    60_000,
  );

  readonly setoresDisponiveis = SETORES_DASHBOARD_MOCK;
  readonly setorSelecionadoId = this.setorSelecionadoIdState.asReadonly();
  readonly pendenciasExpandidas = this.pendenciasExpandidasState.asReadonly();
  readonly atualizadoEm = this.dataReferencia.toISOString();

  readonly entregasPorPeriodo = gerarEntregasUltimos12Meses(this.dataReferencia);

  readonly filtrosPeriodo: readonly FiltroPeriodo[] = [
    { valor: 'ultimos-6-meses', rotulo: 'Últimos 6 meses' },
    { valor: 'ultimos-12-meses', rotulo: 'Últimos 12 meses' },
    { valor: 'ano-atual', rotulo: 'Ano atual' },
  ];

  periodoSelecionado: PeriodoGrafico = 'ultimos-6-meses';

  readonly validadesProximas: readonly ValidadeProxima[] = [
    {
      id: 1,
      epiId: 1042,
      epi: 'Luva de procedimento',
      ca: 'CA 45.812',
      lote: 'L-4821',
      dataValidade: criarDataIso(this.dataReferencia, 3),
      diasRestantes: 3,
      percentualPrazo: 12,
      nivel: 'critico',
      status: 'Crítico',
      setorIds: ['uti', 'analises-clinicas'],
    },
    {
      id: 2,
      epiId: 1035,
      epi: 'Respirador PFF2',
      ca: 'CA 38.942',
      lote: 'RP-9024',
      dataValidade: criarDataIso(this.dataReferencia, 12),
      diasRestantes: 12,
      percentualPrazo: 38,
      nivel: 'atencao',
      status: 'Atenção',
      setorIds: ['uti', 'pronto-atendimento'],
    },
    {
      id: 3,
      epiId: 1018,
      epi: 'Óculos de proteção',
      ca: 'CA 34.176',
      lote: 'OP-1807',
      dataValidade: criarDataIso(this.dataReferencia, 48),
      diasRestantes: 48,
      percentualPrazo: 78,
      nivel: 'regular',
      status: 'Regular',
      setorIds: ['centro-cirurgico', 'reabilitacao'],
    },
  ];

  readonly movimentacoesRecentes: readonly MovimentacaoRecente[] = [
    {
      id: 701,
      colaboradorId: 1204,
      colaborador: 'Ana Beatriz Lima',
      funcao: 'Enfermeira',
      setor: 'UTI',
      setorId: 'uti',
      epiId: 1035,
      epi: 'Respirador PFF2',
      ca: 'CA 38.942',
      dataHora: criarDataHoraMock(this.dataReferencia, 2),
      status: 'Entregue',
    },
    {
      id: 700,
      colaboradorId: 1187,
      colaborador: 'Marcos Vinícius Silva',
      funcao: 'Técnico de enfermagem',
      setor: 'Pronto Atendimento',
      setorId: 'pronto-atendimento',
      epiId: 1018,
      epi: 'Óculos de proteção',
      ca: 'CA 34.176',
      dataHora: criarDataHoraMock(this.dataReferencia, 26),
      status: 'Troca',
    },
    {
      id: 699,
      colaboradorId: 1261,
      colaborador: 'Juliana Costa Rocha',
      funcao: 'Fisioterapeuta',
      setor: 'Reabilitação',
      setorId: 'reabilitacao',
      epiId: 1064,
      epi: 'Protetor facial',
      ca: 'CA 41.205',
      dataHora: criarDataHoraMock(this.dataReferencia, 51),
      status: 'Devolvido',
    },
    {
      id: 698,
      colaboradorId: 1098,
      colaborador: 'Ricardo Alves Santos',
      funcao: 'Médico cirurgião',
      setor: 'Centro Cirúrgico',
      setorId: 'centro-cirurgico',
      epiId: 1072,
      epi: 'Avental impermeável',
      ca: 'CA 46.033',
      dataHora: criarDataHoraMock(this.dataReferencia, 84),
      status: 'Entregue',
    },
    {
      id: 697,
      colaboradorId: 1240,
      colaborador: 'Fernanda Oliveira',
      funcao: 'Auxiliar de laboratório',
      setor: 'Análises Clínicas',
      setorId: 'analises-clinicas',
      epiId: 1042,
      epi: 'Luva de procedimento',
      ca: 'CA 45.812',
      dataHora: criarDataHoraMock(this.dataReferencia, 118),
      status: 'Entregue',
    },
  ];

  readonly pendenciasDoDia: readonly PendenciaDia[] = [
    {
      id: 'pendencia-validade-1042',
      setorIds: ['uti', 'analises-clinicas'],
      tipo: 'validade',
      titulo: 'Preparar lote de luvas para vencimento',
      descricao: 'O lote L-4821 vence em três dias; separar os itens e validar a reposição.',
      prioridade: 'critica',
      status: 'em-andamento',
      dataLimite: criarDataIso(this.dataReferencia),
      horaLimite: '12:00',
      quantidade: 48,
      origemModulo: 'estoque',
      referenciaId: '1042',
    },
    {
      id: 'pendencia-devolucao-892',
      setorIds: ['pronto-atendimento'],
      tipo: 'devolucao-atrasada',
      titulo: 'Devolução de protetores faciais atrasada',
      descricao: 'Confirmar a devolução de três unidades vinculadas ao plantão anterior.',
      prioridade: 'critica',
      status: 'pendente',
      dataLimite: criarDataIso(this.dataReferencia, -2),
      quantidade: 3,
      origemModulo: 'gestao-epis',
      referenciaId: '892',
    },
    {
      id: 'pendencia-troca-417',
      setorIds: ['centro-cirurgico'],
      tipo: 'troca-programada',
      titulo: 'Trocas programadas para o turno',
      descricao: 'Quatro aventais impermeáveis precisam ser substituídos após inspeção.',
      prioridade: 'atencao',
      status: 'pendente',
      dataLimite: criarDataIso(this.dataReferencia),
      horaLimite: '16:00',
      quantidade: 4,
      origemModulo: 'gestao-epis',
      referenciaId: '417',
    },
    {
      id: 'pendencia-entrega-305',
      setorIds: ['reabilitacao'],
      tipo: 'entrega-pendente',
      titulo: 'Entregas aguardando confirmação',
      descricao: 'Validar o recebimento de dois protetores faciais pelos colaboradores.',
      prioridade: 'atencao',
      status: 'pendente',
      dataLimite: criarDataIso(this.dataReferencia),
      horaLimite: '17:30',
      quantidade: 2,
      origemModulo: 'gestao-epis',
      referenciaId: '305',
    },
    {
      id: 'pendencia-termos-118',
      setorIds: [],
      tipo: 'entrega-pendente',
      titulo: 'Termos de entrega aguardando assinatura',
      descricao: 'Seis registros precisam de confirmação para concluir a movimentação.',
      prioridade: 'atencao',
      status: 'pendente',
      dataLimite: criarDataIso(this.dataReferencia),
      horaLimite: '18:00',
      quantidade: 6,
      origemModulo: 'gestao-epis',
      referenciaId: '118',
    },
    {
      id: 'pendencia-futura-221',
      setorIds: ['analises-clinicas'],
      tipo: 'troca-programada',
      titulo: 'Troca preventiva agendada',
      descricao: 'Revisar os óculos de proteção antes da próxima semana.',
      prioridade: 'atencao',
      status: 'pendente',
      dataLimite: criarDataIso(this.dataReferencia, 2),
      quantidade: 5,
      origemModulo: 'gestao-epis',
      referenciaId: '221',
    },
    {
      id: 'pendencia-concluida-517',
      setorIds: ['uti'],
      tipo: 'entrega-pendente',
      titulo: 'Entrega do turno da manhã',
      descricao: 'Distribuição de respiradores concluída e confirmada.',
      prioridade: 'atencao',
      status: 'concluida',
      dataLimite: criarDataIso(this.dataReferencia),
      quantidade: 12,
      origemModulo: 'gestao-epis',
      referenciaId: '517',
    },
  ];

  mensagemAcao = '';

  private readonly formatadorNumero = new Intl.NumberFormat('pt-BR');
  private readonly formatadorData = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
  private readonly formatadorHorario = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  });

  private readonly metricasAtuais = computed<MetricasDashboard>(() => {
    const setorId = this.setorSelecionadoIdState();

    if (!setorId) {
      return this.metricasGeraisState();
    }

    return (
      RESUMOS_SETORES_MOCK.find((resumo) => resumo.setorId === setorId)?.metricas ??
      this.metricasGeraisState()
    );
  });

  readonly pendenciasDoDiaFiltradas = computed<readonly PendenciaDia[]>(() => {
    const setorId = this.setorSelecionadoIdState();
    const agora = this.agoraState();
    const hoje = criarDataIso(agora);
    const ordemPrioridade: Readonly<Record<PrioridadePendencia, number>> = {
      critica: 0,
      atencao: 1,
    };

    return this.pendenciasDoDia
      .filter(
        (pendencia) =>
          pendencia.status !== 'concluida' &&
          pendencia.dataLimite <= hoje &&
          (!setorId || pendencia.setorIds.length === 0 || pendencia.setorIds.includes(setorId)),
      )
      .slice()
      .sort(
        (primeira, segunda) =>
          ordemPrioridade[primeira.prioridade] - ordemPrioridade[segunda.prioridade] ||
          this.obterInstanteLimitePendencia(primeira).getTime() -
            this.obterInstanteLimitePendencia(segunda).getTime(),
      );
  });

  readonly pendenciasDoDiaVisiveis = computed<readonly PendenciaDia[]>(() =>
    this.pendenciasExpandidasState()
      ? this.pendenciasDoDiaFiltradas()
      : this.pendenciasDoDiaFiltradas().slice(0, 3),
  );

  readonly indicadoresPrincipais = computed<readonly IndicadorDashboard[]>(() => {
    const metricas = this.metricasAtuais();
    const tendenciaConformidade = this.obterTendencia(metricas.variacaoConformidadePontos);

    return [
      {
        id: 'epis-entregues',
        titulo: 'EPIs entregues',
        valor: metricas.totalEpisEntregues,
        detalhe: `${this.formatarVariacao(this.variacaoMensalEntregas)} em relação ao mês anterior`,
        icone: 'bi-shield-check',
        tom: 'secondary',
        tendencia: this.tendenciaVariacaoMensal,
      },
      {
        id: 'itens-vencidos',
        titulo: 'Itens vencidos',
        valor: metricas.itensVencidos,
        detalhe: `${metricas.itensCriticos} exigem ação imediata`,
        icone: 'bi-exclamation-triangle',
        tom: 'danger',
        tendencia: metricas.itensCriticos > 0 ? 'critica' : 'neutra',
      },
      {
        id: 'colaboradores',
        titulo: 'Colaboradores',
        valor: metricas.totalColaboradores,
        detalhe: `${metricas.colaboradoresComEpiAtivo} com EPI ativo`,
        icone: 'bi-people',
        tom: 'primary',
        tendencia: 'neutra',
      },
      {
        id: 'conformidade',
        titulo: 'Conformidade',
        valor: metricas.conformidade,
        sufixo: '%',
        detalhe: `${this.formatarVariacaoPontos(metricas.variacaoConformidadePontos)} neste trimestre`,
        icone: 'bi-patch-check',
        tom: 'success',
        tendencia: tendenciaConformidade,
      },
    ];
  });

  get totalEpisEntregues(): number {
    return this.metricasGeraisState().totalEpisEntregues;
  }

  set totalEpisEntregues(valor: number) {
    this.metricasGeraisState.update((metricas) => ({ ...metricas, totalEpisEntregues: valor }));
  }

  get itensVencidos(): number {
    return this.metricasGeraisState().itensVencidos;
  }

  set itensVencidos(valor: number) {
    this.metricasGeraisState.update((metricas) => ({ ...metricas, itensVencidos: valor }));
  }

  get totalColaboradores(): number {
    return this.metricasGeraisState().totalColaboradores;
  }

  set totalColaboradores(valor: number) {
    this.metricasGeraisState.update((metricas) => ({ ...metricas, totalColaboradores: valor }));
  }

  get conformidade(): number {
    return this.metricasGeraisState().conformidade;
  }

  set conformidade(valor: number) {
    this.metricasGeraisState.update((metricas) => ({ ...metricas, conformidade: valor }));
  }

  get setorSelecionadoNome(): string {
    return this.setorSelecionado?.nome ?? 'Todos os setores';
  }

  get setorSelecionado(): SetorDashboard | undefined {
    const setorId = this.setorSelecionadoIdState();

    return this.setoresDisponiveis.find((setor) => setor.id === setorId);
  }

  get setorMaiorMovimentacao(): string {
    const ultimaCompetencia = this.entregasPorPeriodo.at(-1);
    const maiorQuantidade = ultimaCompetencia?.quantidadesPorSetor.reduce<
      QuantidadeEntregaSetor | undefined
    >((maior, atual) => (!maior || atual.quantidade > maior.quantidade ? atual : maior), undefined);

    return (
      this.setoresDisponiveis.find((setor) => setor.id === maiorQuantidade?.setorId)?.nome ??
      'Não identificado'
    );
  }

  get entregasDoEscopo(): readonly EntregaPeriodo[] {
    const setorId = this.setorSelecionadoIdState();

    if (!setorId) {
      return this.entregasPorPeriodo;
    }

    return this.entregasPorPeriodo.map((entrega) => ({
      ...entrega,
      quantidade:
        entrega.quantidadesPorSetor.find((quantidade) => quantidade.setorId === setorId)
          ?.quantidade ?? 0,
    }));
  }

  get entregasFiltradas(): readonly EntregaPeriodo[] {
    if (this.periodoSelecionado === 'ultimos-6-meses') {
      return this.entregasDoEscopo.slice(-6);
    }

    if (this.periodoSelecionado === 'ultimos-12-meses') {
      return this.entregasDoEscopo.slice(-12);
    }

    const anoAtual = this.dataReferencia.getFullYear();

    return this.entregasDoEscopo.filter((entrega) => entrega.ano === anoAtual);
  }

  get entregasNoMes(): number {
    return this.entregasDoEscopo.at(-1)?.quantidade ?? 0;
  }

  get variacaoMensalEntregas(): number {
    return this.calcularVariacaoMensalEntregas(this.entregasDoEscopo);
  }

  get tendenciaVariacaoMensal(): TendenciaVariacao {
    return this.obterTendencia(this.variacaoMensalEntregas);
  }

  get validadesProximasFiltradas(): readonly ValidadeProxima[] {
    const setorId = this.setorSelecionadoIdState();

    return setorId
      ? this.validadesProximas.filter(
          (validade) => validade.setorIds.length === 0 || validade.setorIds.includes(setorId),
        )
      : this.validadesProximas;
  }

  get movimentacoesRecentesFiltradas(): readonly MovimentacaoRecente[] {
    const setorId = this.setorSelecionadoIdState();
    const movimentacoes = setorId
      ? this.movimentacoesRecentes.filter((movimentacao) => movimentacao.setorId === setorId)
      : this.movimentacoesRecentes;

    return movimentacoes
      .slice()
      .sort(
        (primeira, segunda) =>
          new Date(segunda.dataHora).getTime() - new Date(primeira.dataHora).getTime(),
      )
      .slice(0, 5);
  }

  get totalEntregasPeriodo(): number {
    return this.entregasFiltradas.reduce((total, entrega) => total + entrega.quantidade, 0);
  }

  get mediaEntregasPeriodo(): number {
    const quantidadeMeses = this.entregasFiltradas.length;

    if (quantidadeMeses === 0) {
      return 0;
    }

    return Math.round(this.totalEntregasPeriodo / quantidadeMeses);
  }

  selecionarPeriodo(periodo: PeriodoGrafico): void {
    this.periodoSelecionado = periodo;
  }

  alterarSetor(evento: Event): void {
    const elemento = evento.target;

    if (!(elemento instanceof HTMLSelectElement)) {
      return;
    }

    this.selecionarSetor(elemento.value || null);
  }

  selecionarSetor(setorId: string | null): void {
    const setorValido = setorId
      ? this.setoresDisponiveis.some((setor) => setor.id === setorId)
      : true;

    this.setorSelecionadoIdState.set(setorValido ? setorId : null);
    this.pendenciasExpandidasState.set(false);
  }

  alternarPendencias(): void {
    this.pendenciasExpandidasState.update((expandida) => !expandida);
  }

  atualizarRelogio(agora = new Date()): void {
    this.agoraState.set(agora);
  }

  ngOnDestroy(): void {
    if (this.atualizadorRelogio !== undefined) {
      this.documento.defaultView?.clearInterval(this.atualizadorRelogio);
    }
  }

  calcularAlturaBarra(quantidade: number): number {
    const maiorQuantidade = Math.max(
      ...this.entregasFiltradas.map((entrega) => entrega.quantidade),
    );

    if (maiorQuantidade === 0) {
      return 24;
    }

    return Math.max(24, Math.round((quantidade / maiorQuantidade) * 150));
  }

  private calcularVariacaoMensalEntregas(entregas: readonly EntregaPeriodo[]): number {
    const mesAnterior = entregas.at(-2)?.quantidade ?? 0;
    const mesAtual = entregas.at(-1)?.quantidade ?? 0;

    if (mesAnterior === 0) {
      return 0;
    }

    return Number((((mesAtual - mesAnterior) / mesAnterior) * 100).toFixed(1));
  }

  private obterTendencia(valor: number): TendenciaVariacao {
    if (valor > 0) {
      return 'positiva';
    }

    if (valor < 0) {
      return 'negativa';
    }

    return 'neutra';
  }

  formatarNumero(valor: number): string {
    return this.formatadorNumero.format(valor);
  }

  formatarDecimal(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  formatarVariacao(valor: number): string {
    const sinal = valor > 0 ? '+' : '';

    return `${sinal}${this.formatarDecimal(valor)}%`;
  }

  formatarVariacaoPontos(valor: number): string {
    const sinal = valor > 0 ? '+' : '';

    return `${sinal}${this.formatarDecimal(valor)} p.p.`;
  }

  formatarData(dataHora: string): string {
    return this.formatadorData.format(new Date(dataHora));
  }

  formatarDataValidade(data: string): string {
    return this.formatadorData.format(new Date(`${data}T12:00:00-03:00`));
  }

  formatarHorario(dataHora: string): string {
    return this.formatadorHorario.format(new Date(dataHora));
  }

  obterIniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('');
  }

  obterIconePendencia(tipo: TipoPendencia): string {
    switch (tipo) {
      case 'validade':
        return 'bi-clock-history';
      case 'troca-programada':
        return 'bi-arrow-repeat';
      case 'entrega-pendente':
        return 'bi-box-arrow-right';
      case 'devolucao-atrasada':
        return 'bi-box-arrow-in-left';
    }
  }

  obterDestinoPendencia(tipo: TipoPendencia): string {
    return tipo === 'validade' ? 'validades-dashboard' : 'movimentacoes-dashboard';
  }

  obterRotuloAcaoPendencia(tipo: TipoPendencia): string {
    return tipo === 'validade' ? 'Ver validades' : 'Ver movimentações';
  }

  irParaSecaoPendencia(tipo: TipoPendencia): void {
    const destino = this.documento.getElementById(this.obterDestinoPendencia(tipo));

    if (!destino) {
      return;
    }

    const reduzirMovimento =
      this.documento.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    destino.scrollIntoView({
      behavior: reduzirMovimento ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  formatarPrioridadePendencia(prioridade: PrioridadePendencia): string {
    return prioridade === 'critica' ? 'Crítica' : 'Atenção';
  }

  formatarStatusPendencia(status: StatusPendencia): string {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em-andamento':
        return 'Em andamento';
      case 'concluida':
        return 'Concluída';
    }
  }

  formatarSetoresPendencia(pendencia: PendenciaDia): string {
    if (pendencia.setorIds.length === 0) {
      return 'Todos os setores';
    }

    return pendencia.setorIds
      .map(
        (setorId) => this.setoresDisponiveis.find((setor) => setor.id === setorId)?.nome ?? setorId,
      )
      .join(' · ');
  }

  formatarPrazoPendencia(pendencia: PendenciaDia): string {
    const agora = this.agoraState();
    const hoje = criarDataIso(agora);

    if (pendencia.dataLimite < hoje) {
      const dataHoje = new Date(`${hoje}T12:00:00`);
      const dataLimite = new Date(`${pendencia.dataLimite}T12:00:00`);
      const diasAtraso = Math.round(
        (dataHoje.getTime() - dataLimite.getTime()) / (24 * 60 * 60 * 1000),
      );

      return `Atrasada há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}`;
    }

    if (this.obterInstanteLimitePendencia(pendencia).getTime() < agora.getTime()) {
      return pendencia.horaLimite
        ? `Prazo encerrado às ${pendencia.horaLimite}`
        : 'Prazo encerrado hoje';
    }

    return pendencia.horaLimite ? `Hoje, até ${pendencia.horaLimite}` : 'Vence hoje';
  }

  obterDataHoraLimitePendencia(pendencia: PendenciaDia): string {
    return `${pendencia.dataLimite}T${pendencia.horaLimite ?? '23:59'}:00-03:00`;
  }

  descricaoGrafico(): string {
    const pontos = this.entregasFiltradas
      .map((entrega) => `${entrega.mesCompleto} de ${entrega.ano}: ${entrega.quantidade}`)
      .join('; ');

    return `Gráfico de barras de EPIs entregues por período para ${this.setorSelecionadoNome}. ${pontos}.`;
  }

  private obterInstanteLimitePendencia(pendencia: PendenciaDia): Date {
    return new Date(this.obterDataHoraLimitePendencia(pendencia));
  }

  gerarCsvDashboard(): string {
    const dataExportacao = new Date();
    const periodoSelecionado =
      this.filtrosPeriodo.find((filtro) => filtro.valor === this.periodoSelecionado)?.rotulo ?? '';
    const linhas: CelulaCsv[][] = [
      ['SICC - Hospital Esperança'],
      ['Dashboard'],
      [
        'Exportado em',
        `${this.formatarData(dataExportacao.toISOString())} ${this.formatarHorario(dataExportacao.toISOString())}`,
      ],
      ['Setor selecionado', this.setorSelecionadoNome],
      [],
      ['Resumo'],
      ['Indicador', 'Valor', 'Informação complementar'],
      ...this.indicadoresPrincipais().map((indicador) => [
        indicador.titulo,
        `${this.formatarNumero(indicador.valor)}${indicador.sufixo ?? ''}`,
        indicador.detalhe,
      ]),
      [],
      ['Entregas por período', periodoSelecionado],
      ['Mês', 'Ano', 'Quantidade'],
      ...this.entregasFiltradas.map((entrega) => [
        entrega.mesCompleto,
        entrega.ano,
        entrega.quantidade,
      ]),
      [],
      ['Validades por vencer'],
      ['EPI', 'CA', 'Lote', 'Setores', 'Data de validade', 'Dias restantes', 'Situação'],
      ...this.validadesProximasFiltradas.map((validade) => [
        validade.epi,
        validade.ca,
        validade.lote,
        validade.setorIds
          .map(
            (setorId) =>
              this.setoresDisponiveis.find((setor) => setor.id === setorId)?.nome ?? setorId,
          )
          .join(' · ') || 'Todos os setores',
        this.formatarDataValidade(validade.dataValidade),
        validade.diasRestantes,
        validade.status,
      ]),
      [],
      ['Pendências do dia'],
      ['Prioridade', 'Título', 'Setor', 'Prazo', 'Status', 'Quantidade'],
      ...this.pendenciasDoDiaFiltradas().map((pendencia) => [
        this.formatarPrioridadePendencia(pendencia.prioridade),
        pendencia.titulo,
        this.formatarSetoresPendencia(pendencia),
        this.formatarPrazoPendencia(pendencia),
        this.formatarStatusPendencia(pendencia.status),
        pendencia.quantidade,
      ]),
      [],
      ['Movimentações recentes'],
      ['Colaborador', 'Função', 'Setor', 'EPI', 'CA', 'Data', 'Horário', 'Status'],
      ...this.movimentacoesRecentesFiltradas.map((movimentacao) => [
        movimentacao.colaborador,
        movimentacao.funcao,
        movimentacao.setor,
        movimentacao.epi,
        movimentacao.ca,
        this.formatarData(movimentacao.dataHora),
        this.formatarHorario(movimentacao.dataHora),
        movimentacao.status,
      ]),
    ];

    return gerarCsv(linhas);
  }

  exportarDashboard(): void {
    const exportacaoIniciada = baixarCsv(
      this.documento,
      this.gerarCsvDashboard(),
      `dashboard-sicc-${criarDataIso(new Date())}.csv`,
    );

    this.mensagemAcao = exportacaoIniciada
      ? 'Dashboard exportado com sucesso em formato CSV.'
      : 'Não foi possível exportar o Dashboard neste navegador.';
  }

  fecharMensagemAcao(): void {
    this.mensagemAcao = '';
  }
}
