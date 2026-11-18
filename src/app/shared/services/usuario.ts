import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../api';

export interface UsuarioSistema {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  perfil: string;
  ativo: boolean;
  iniciais: string;
}

/** Usuários do sistema (tela Configurações), vindos da API - acesso só de Administrador. */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly url = `${API_URL}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(this.url);
  }

  alterarStatus(id: number, ativo: boolean): Observable<UsuarioSistema> {
    return this.http.patch<UsuarioSistema>(`${this.url}/${id}/status`, { ativo });
  }
}
