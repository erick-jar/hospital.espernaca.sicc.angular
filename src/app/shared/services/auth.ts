import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_URL } from '../api';

export interface UsuarioAutenticado {
  id?: number;
  nome: string;
  email: string;
  matricula: string;
  perfil: 'Administrador' | 'RH' | 'Técnico de Segurança';
  iniciais: string;
}

interface LoginResposta {
  token: string;
  tipo: string;
  expiraEmMinutos: number;
  usuario: UsuarioAutenticado;
}

const CHAVE_TOKEN = 'sicc.token';
const CHAVE_USUARIO = 'sicc.usuario';

/**
 * Autenticação feita pelo back end (POST /api/auth/login).
 * Os usuários e senhas não ficam mais no código do front: a API confere a senha
 * e devolve um token, que é enviado nas chamadas seguintes pelo authInterceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;
  private usuarioAtual: UsuarioAutenticado | null = null;

  constructor(private http: HttpClient) {
    this.restaurarSessao();
  }

  login(identificacao: string, senha: string): Observable<UsuarioAutenticado> {
    return this.http
      .post<LoginResposta>(`${API_URL}/auth/login`, {
        identificacao: identificacao.trim(),
        senha
      })
      .pipe(
        tap((resposta) => this.guardarSessao(resposta)),
        map((resposta) => resposta.usuario)
      );
  }

  logout(): void {
    this.token = null;
    this.usuarioAtual = null;

    try {
      sessionStorage.removeItem(CHAVE_TOKEN);
      sessionStorage.removeItem(CHAVE_USUARIO);
    } catch {
      // armazenamento do navegador indisponível: a sessão já foi limpa da memória
    }
  }

  obterToken(): string | null {
    return this.token;
  }

  estaAutenticado(): boolean {
    return this.token !== null && this.usuarioAtual !== null;
  }

  obterUsuarioAtual(): UsuarioAutenticado | null {
    return this.usuarioAtual;
  }

  ehAdministrador(): boolean {
    return this.usuarioAtual?.perfil === 'Administrador';
  }

  ehRH(): boolean {
    return this.usuarioAtual?.perfil === 'RH';
  }

  ehTecnicoSeguranca(): boolean {
    return this.usuarioAtual?.perfil === 'Técnico de Segurança';
  }

  private guardarSessao(resposta: LoginResposta): void {
    this.token = resposta.token;
    this.usuarioAtual = resposta.usuario;

    try {
      // sessionStorage: a sessão continua ao recarregar a página (F5) e some ao fechar a aba
      sessionStorage.setItem(CHAVE_TOKEN, resposta.token);
      sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
    } catch {
      // sem armazenamento: a sessão vale só até recarregar a página
    }
  }

  private restaurarSessao(): void {
    try {
      const token = sessionStorage.getItem(CHAVE_TOKEN);
      const usuario = sessionStorage.getItem(CHAVE_USUARIO);

      if (token && usuario) {
        this.token = token;
        this.usuarioAtual = JSON.parse(usuario) as UsuarioAutenticado;
      }
    } catch {
      this.token = null;
      this.usuarioAtual = null;
    }
  }
}
