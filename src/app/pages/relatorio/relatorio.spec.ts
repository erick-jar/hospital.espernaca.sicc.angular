import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Relatorio } from './relatorio';

describe('Relatorio', () => {
  let component: Relatorio;
  let fixture: ComponentFixture<Relatorio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Relatorio],
    }).compileComponents();

    fixture = TestBed.createComponent(Relatorio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should filter the stock and delivery reports by date and collaborator', () => {
    component.tipoRelatorioSelecionado = 'ESTOQUE';
    component.dataInicio = '2026-08-01';
    component.dataFim = '2026-08-08';
    component.filtrarDados();

    expect(component.relatorioEstoque.length).toBeGreaterThan(0);
    expect(
      component.relatorioEstoque.every((item) => item.data >= component.dataInicio && item.data <= component.dataFim),
    ).toBe(true);

    component.tipoRelatorioSelecionado = 'ENTREGAS';
    component.buscaColaborador = 'ana';
    component.filtrarDados();

    expect(component.relatorioEntregas).toHaveLength(1);
    expect(component.relatorioEntregas[0].colaborador).toBe('Ana Maria');
  });
});
