import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';
import { Epi } from '../models/epi.model';

/** CRUD de epis feito pela API (antes os dados ficavam fixos em memória). */
@Injectable({ providedIn: 'root' })
export class EpiService {
  private readonly url = `${API_URL}/epis`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Epi[]> {
    return this.http.get<Epi[]>(this.url);
  }

  criar(dados: Omit<Epi, 'id'>): Observable<Epi> {
    return this.http.post<Epi>(this.url, dados);
  }

  atualizar(id: number, dados: Omit<Epi, 'id'>): Observable<Epi> {
    return this.http.put<Epi>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
