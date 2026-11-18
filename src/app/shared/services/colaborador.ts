import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';
import { Colaborador } from '../models/colaborador.model';

/** CRUD de colaboradores feito pela API (antes os dados ficavam fixos em memória). */
@Injectable({ providedIn: 'root' })
export class ColaboradorService {
  private readonly url = `${API_URL}/colaboradores`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Colaborador[]> {
    return this.http.get<Colaborador[]>(this.url);
  }

  criar(dados: Omit<Colaborador, 'id'>): Observable<Colaborador> {
    return this.http.post<Colaborador>(this.url, dados);
  }

  atualizar(id: number, dados: Omit<Colaborador, 'id'>): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
