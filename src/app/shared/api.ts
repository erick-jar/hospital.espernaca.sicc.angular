import { HttpErrorResponse } from '@angular/common/http';

/** Endereço do back end (Spring Boot). Altere aqui se a API mudar de porta ou servidor. */
export const API_URL = 'http://localhost:8080/api';

interface ErroApi {
  mensagem?: string;
  campos?: Record<string, string>;
}

/** Converte o erro devolvido pela API no texto que será exibido na tela. */
export function mensagemDeErro(erro: unknown): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return 'Ocorreu um erro inesperado.';
  }

  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se o back end está em execução.';
  }

  const corpo = erro.error as ErroApi | null;
  const mensagensDosCampos = corpo?.campos ? Object.values(corpo.campos) : [];

  // Campos obrigatórios/invalidos: mostra a mensagem de cada campo
  if (mensagensDosCampos.length > 0) {
    return mensagensDosCampos.join(' ');
  }

  return corpo?.mensagem ?? 'Ocorreu um erro inesperado.';
}
