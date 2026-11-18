import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';

export type TipoMovimentacaoEpi = 'Entrega' | 'Devolução' | 'Troca';
export type StatusMovimentacaoEpi = 'Concluído' | 'Pendente';

export interface MovimentacaoEpi {
  id: number;
  tipo: TipoMovimentacaoEpi;
  funcionario: string;
  matricula: string;
  setor: string;
  epiId: number;
  epi: string;
  quantidade: number;
  data: string;
  status: StatusMovimentacaoEpi;
  observacoes: string | null;
  registradoPor: string | null;
}

export interface NovaMovimentacaoEpi {
  tipo: TipoMovimentacaoEpi;
  matricula: string;
  epiId: number;
  quantidade: number;
  data: string;
  status: StatusMovimentacaoEpi;
  observacoes: string;
}

/** Entregas, devoluções e trocas de EPI (tela Gestão de EPIs), feitas pela API. */
@Injectable({ providedIn: 'root' })
export class MovimentacaoEpiService {
  private readonly url = `${API_URL}/movimentacoes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<MovimentacaoEpi[]> {
    return this.http.get<MovimentacaoEpi[]>(this.url);
  }

  registrar(dados: NovaMovimentacaoEpi): Observable<MovimentacaoEpi> {
    return this.http.post<MovimentacaoEpi>(this.url, dados);
  }
}
