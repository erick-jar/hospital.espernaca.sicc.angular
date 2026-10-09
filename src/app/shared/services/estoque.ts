import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';

export type TipoMovimentacaoEstoque = 'Entrada' | 'Saída';

export interface ItemEstoque {
  epiId: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  status: 'Disponível' | 'Baixo';
  validade: string;
  vencido: boolean;
}

export interface MovimentacaoEstoque {
  id: number;
  data: string;
  tipo: TipoMovimentacaoEstoque;
  epiId: number;
  epi: string;
  quantidade: number;
  responsavel: string;
  observacao: string | null;
}

export interface NovaMovimentacaoEstoque {
  epiId: number;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  responsavel: string;
}

/** Saldo e histórico do estoque, vindos da API. */
@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private readonly url = `${API_URL}/estoque`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ItemEstoque[]> {
    return this.http.get<ItemEstoque[]>(this.url);
  }

  historico(): Observable<MovimentacaoEstoque[]> {
    return this.http.get<MovimentacaoEstoque[]>(`${this.url}/movimentacoes`);
  }

  registrar(dados: NovaMovimentacaoEstoque): Observable<MovimentacaoEstoque> {
    return this.http.post<MovimentacaoEstoque>(`${this.url}/movimentacoes`, dados);
  }
}
