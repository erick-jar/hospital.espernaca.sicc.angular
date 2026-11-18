import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_URL } from '../../shared/api';
import { AuthService } from '../../shared/services/auth';

/**
 * Executa em toda chamada HTTP:
 *  - envia o token do login no cabeçalho Authorization;
 *  - se a API responder 401 (token expirado ou inválido), encerra a sessão e volta para o login.
 */
export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const ehApi = requisicao.url.startsWith(API_URL);
  const ehLogin = requisicao.url.endsWith('/auth/login');
  const token = authService.obterToken();

  const requisicaoFinal =
    ehApi && token
      ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : requisicao;

  return proximo(requisicaoFinal).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (ehApi && !ehLogin && erro.status === 401) {
        authService.logout();
        router.navigate(['/']);
      }

      return throwError(() => erro);
    })
  );
};
