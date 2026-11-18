export type StatusColaborador = 'Ativo' | 'Inativo';

export interface Colaborador {
  id: number;
  matricula: string;
  nome: string;
  cpf: string;
  setor: string;
  /** Id da função escolhida no select (tabela de funções do back end). */
  funcaoId: number | null;
  /** Nome da função e setor: vêm do back end, puxados da função escolhida. */
  funcao: string;
  admissao: string;
  contato: string;
  status: StatusColaborador;
}
