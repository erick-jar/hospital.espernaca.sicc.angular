export type StatusFuncao = 'Ativo' | 'Inativo';

export interface Funcao {
  id: number;
  nome: string;
  descricao: string;
  setor: string;
  episObrigatorios: string[];
  status: StatusFuncao;
}
