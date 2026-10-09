import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Dashboard, gerarEntregasUltimos12Meses } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the four main indicators', () => {
    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.indicator-card');
    const pageText = fixture.nativeElement.textContent as string;

    expect(indicators).toHaveLength(4);
    expect(pageText).toContain('EPIs entregues');
    expect(pageText).toContain('Itens vencidos');
    expect(pageText).toContain('Colaboradores');
    expect(pageText).toContain('Conformidade');
  });

  it('should reflect updated totals in the indicator cards', () => {
    component.totalEpisEntregues = 3000;
    fixture.detectChanges();

    const deliveredValue = fixture.nativeElement.querySelector('.indicator-value')
      .textContent as string;

    expect(deliveredValue.trim()).toBe('3.000');
  });

  it('should update the chart when a period filter is selected', () => {
    fixture.detectChanges();

    expect(component.entregasFiltradas).toHaveLength(6);

    const filterButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.period-button'),
    ) as HTMLButtonElement[];
    const twelveMonthsButton = filterButtons.find((button) =>
      button.textContent?.includes('Últimos 12 meses'),
    );

    expect(twelveMonthsButton).toBeDefined();

    twelveMonthsButton?.click();
    fixture.detectChanges();

    expect(component.periodoSelecionado).toBe('ultimos-12-meses');
    expect(component.entregasFiltradas).toHaveLength(12);
    expect(fixture.nativeElement.querySelectorAll('.chart-column')).toHaveLength(12);
  });

  it('should generate the last twelve months from the reference date', () => {
    const entregas = gerarEntregasUltimos12Meses(new Date(2026, 0, 15, 12));

    expect(entregas).toHaveLength(12);
    expect(entregas[0]?.id).toBe('2025-02');
    expect(entregas.at(-1)?.id).toBe('2026-01');
    expect(new Set(entregas.map((entrega) => entrega.id)).size).toBe(12);
    expect(
      entregas.every(
        (entrega) =>
          entrega.quantidadesPorSetor.reduce(
            (total, quantidadeSetor) => total + quantidadeSetor.quantidade,
            0,
          ) === entrega.quantidade,
      ),
    ).toBe(true);
  });

  it('should keep the current-year filter aligned with the generated series', () => {
    component.selecionarPeriodo('ano-atual');

    const ultimaCompetencia = component.entregasPorPeriodo.at(-1);
    const quantidadeMesesNoAno = Number(ultimaCompetencia?.id.slice(5, 7));

    expect(component.entregasFiltradas).toHaveLength(quantidadeMesesNoAno);
    expect(
      component.entregasFiltradas.every((entrega) => entrega.ano === ultimaCompetencia?.ano),
    ).toBe(true);
  });

  it('should keep validity dates consistent with their remaining days', () => {
    const referencia = new Date();
    referencia.setHours(12, 0, 0, 0);

    for (const validade of component.validadesProximas) {
      const vencimento = new Date(`${validade.dataValidade}T12:00:00`);
      const diferencaDias = Math.round(
        (vencimento.getTime() - referencia.getTime()) / (24 * 60 * 60 * 1000),
      );

      expect(diferencaDias).toBe(validade.diasRestantes);
    }

    expect(component.formatarDataValidade('2026-08-12')).toBe('12/08/2026');
  });

  it('should never show mocked movements in the future', () => {
    const agora = Date.now();
    const duasHoras = 2 * 60 * 60 * 1000;

    for (const movimentacao of component.movimentacoesRecentes) {
      const instante = new Date(movimentacao.dataHora).getTime();

      expect(instante).toBeLessThanOrEqual(agora);
      expect(agora - instante).toBeLessThanOrEqual(duasHoras);
    }
  });

  it('should format positive, negative and neutral variations consistently', () => {
    expect(component.formatarVariacao(12.4)).toBe('+12,4%');
    expect(component.formatarVariacao(-3.2)).toBe('-3,2%');
    expect(component.formatarVariacao(0)).toBe('0,0%');
  });

  it('should generate a CSV with the complete dashboard data and selected period', () => {
    component.selecionarPeriodo('ultimos-6-meses');

    const csv = component.gerarCsvDashboard();

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('SICC - Hospital Esperança');
    expect(csv).toContain('Entregas por período;Últimos 6 meses');
    expect(csv).toContain('Validades por vencer');
    expect(csv).toContain('EPI;CA;Lote;Setores;Data de validade');
    expect(csv).toContain('UTI · Análises Clínicas');
    expect(csv).toContain('Movimentações recentes');
    expect(csv).toContain('Ana Beatriz Lima');
  });

  it('should link the new delivery action to the EPI management module', () => {
    fixture.detectChanges();

    const newDeliveryLink = fixture.nativeElement.querySelector(
      'a[aria-label="Ir para Gestão de EPIs e registrar uma nova entrega"]',
    ) as HTMLAnchorElement | null;

    expect(newDeliveryLink?.getAttribute('href')).toBe('/gestao-de-epis');
  });

  it('should filter indicators, chart and operational areas from the sector selector', () => {
    fixture.detectChanges();

    const sectorSelect = fixture.nativeElement.querySelector(
      '#setor-dashboard',
    ) as HTMLSelectElement;

    sectorSelect.value = 'uti';
    sectorSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.setorSelecionadoId()).toBe('uti');
    expect(component.setorSelecionadoNome).toBe('UTI');
    expect(component.indicadoresPrincipais()[0]?.valor).toBe(610);
    expect(component.entregasFiltradas).toHaveLength(6);
    expect(component.entregasFiltradas.map((entrega) => entrega.quantidade)).toEqual([
      33, 36, 38, 43, 45, 50,
    ]);
    expect(component.validadesProximasFiltradas).toHaveLength(2);
    expect(
      component.validadesProximasFiltradas.every((validade) => validade.setorIds.includes('uti')),
    ).toBe(true);
    expect(component.movimentacoesRecentesFiltradas).toHaveLength(1);
    expect(component.movimentacoesRecentesFiltradas[0]?.setorId).toBe('uti');
    expect(component.pendenciasDoDiaFiltradas()).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.indicator-value').textContent.trim()).toBe('610');
    expect(fixture.nativeElement.querySelectorAll('.chart-column')).toHaveLength(6);
    expect(fixture.nativeElement.querySelectorAll('.validity-list .validity-item')).toHaveLength(2);
    expect(
      fixture.nativeElement.querySelectorAll('#lista-pendencias-dashboard > .list-group-item'),
    ).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('.movement-table tbody tr')).toHaveLength(1);
  });

  it('should restore the hospital-wide view and reject unknown sector ids', () => {
    component.selecionarSetor('uti');
    component.selecionarSetor(null);

    expect(component.setorSelecionadoId()).toBeNull();
    expect(component.indicadoresPrincipais()[0]?.valor).toBe(2846);
    expect(component.movimentacoesRecentesFiltradas).toHaveLength(5);

    component.selecionarSetor('setor-inexistente');

    expect(component.setorSelecionadoId()).toBeNull();
  });

  it('should only expose open or overdue daily tasks in priority order', () => {
    const pendencias = component.pendenciasDoDiaFiltradas();

    expect(pendencias).toHaveLength(5);
    expect(pendencias[0]?.id).toBe('pendencia-devolucao-892');
    expect(pendencias.slice(0, 2).every((pendencia) => pendencia.prioridade === 'critica')).toBe(
      true,
    );
    expect(pendencias.every((pendencia) => pendencia.status !== 'concluida')).toBe(true);
    expect(pendencias.some((pendencia) => pendencia.id === 'pendencia-futura-221')).toBe(false);
  });

  it('should initially show only the most urgent tasks and allow expanding the list', () => {
    expect(component.pendenciasDoDiaVisiveis()).toHaveLength(3);

    component.alternarPendencias();

    expect(component.pendenciasExpandidas()).toBe(true);
    expect(component.pendenciasDoDiaVisiveis()).toHaveLength(5);

    component.selecionarSetor('uti');

    expect(component.pendenciasExpandidas()).toBe(false);
    expect(component.pendenciasDoDiaVisiveis()).toHaveLength(2);
  });

  it('should identify a task whose deadline time has passed on the current day', () => {
    const pendencia = component.pendenciasDoDia.find(
      (item) => item.id === 'pendencia-validade-1042',
    );

    expect(pendencia).toBeDefined();

    component.atualizarRelogio(new Date(`${pendencia?.dataLimite}T11:00:00-03:00`));
    expect(component.formatarPrazoPendencia(pendencia!)).toBe('Hoje, até 12:00');

    component.atualizarRelogio(new Date(`${pendencia?.dataLimite}T13:00:00-03:00`));
    expect(component.formatarPrazoPendencia(pendencia!)).toBe('Prazo encerrado às 12:00');
    expect(component.obterDataHoraLimitePendencia(pendencia!)).toContain('T12:00:00-03:00');
  });

  it('should scroll to the appropriate Dashboard section from a daily task', () => {
    fixture.detectChanges();

    const validitySection = fixture.nativeElement.querySelector(
      '#validades-dashboard',
    ) as HTMLElement;
    const scrollIntoView = vi.fn();
    Object.defineProperty(validitySection, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    component.irParaSecaoPendencia('validade');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('should preserve the period when changing the selected sector', () => {
    component.selecionarPeriodo('ultimos-12-meses');
    component.selecionarSetor('centro-cirurgico');

    expect(component.periodoSelecionado).toBe('ultimos-12-meses');
    expect(component.entregasFiltradas).toHaveLength(12);
  });

  it('should export the same sector scope that is visible on the Dashboard', () => {
    component.selecionarSetor('uti');

    const csv = component.gerarCsvDashboard();

    expect(csv).toContain('Setor selecionado;UTI');
    expect(csv).toContain('Pendências do dia');
    expect(csv).toContain('Ana Beatriz Lima');
    expect(csv).not.toContain('Marcos Vinícius Silva');
  });
});
