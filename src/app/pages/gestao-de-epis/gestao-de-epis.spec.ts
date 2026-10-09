import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoDeEpis } from './gestao-de-epis';

describe('GestaoDeEpis', () => {
  let component: GestaoDeEpis;
  let fixture: ComponentFixture<GestaoDeEpis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestaoDeEpis],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoDeEpis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
