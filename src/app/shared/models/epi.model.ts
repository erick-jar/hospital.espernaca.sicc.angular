export type StatusEpi = 'Ativo' | 'Inativo';

export interface Epi {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  ca: string;
  validade: string;
  fabricante: string;
  categoria: string;
  estoqueMinimo: number;
  status: StatusEpi;
  /** Saldo atual, calculado pelo back end (somente leitura). */
  quantidadeEstoque?: number;
}
