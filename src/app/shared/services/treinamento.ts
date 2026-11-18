import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';
import { Treinamento } from '../models/treinamento.model';

/** CRUD de treinamentos feito pela API. */
@Injectable({ providedIn: 'root' })
export class TreinamentoService {
  private readonly url = `${API_URL}/treinamentos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Treinamento[]> {
    return this.http.get<Treinamento[]>(this.url);
  }

  criar(dados: Partial<Treinamento>): Observable<Treinamento> {
    return this.http.post<Treinamento>(this.url, dados);
  }

  atualizar(id: number, dados: Partial<Treinamento>): Observable<Treinamento> {
    return this.http.put<Treinamento>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
