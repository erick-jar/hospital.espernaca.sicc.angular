import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';
import { Funcao } from '../models/funcao.model';

/** CRUD de funcoes feito pela API (antes os dados ficavam fixos em memória). */
@Injectable({ providedIn: 'root' })
export class FuncaoService {
  private readonly url = `${API_URL}/funcoes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Funcao[]> {
    return this.http.get<Funcao[]>(this.url);
  }

  criar(dados: Omit<Funcao, 'id'>): Observable<Funcao> {
    return this.http.post<Funcao>(this.url, dados);
  }

  atualizar(id: number, dados: Omit<Funcao, 'id'>): Observable<Funcao> {
    return this.http.put<Funcao>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
