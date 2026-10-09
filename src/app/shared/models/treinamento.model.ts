export type StatusTreinamento = 'Agendado' | 'Concluído' | 'Vencido';

export interface Participante {
  nome: string;
  setor: string;
  presenca: boolean;
}

export interface Treinamento {
  id?: number;
  norma?: string;
  titulo: string;
  instrutor?: string;
  cargaHoraria?: number;
  dataRealizacao?: string;
  dataValidade?: string;
  status: StatusTreinamento;
  participantes: Participante[];
}
