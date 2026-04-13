// src/types/index.ts

export interface Calendario {
  ID_CALENDARIO: number;
  DESCRICAO: string;
  DATA_INICIO: string;
  DATA_FIM: string;
}

export interface Instrutor {
  ID_INSTRUTOR: number;
  NOME: string;
  EMAIL?: string;
  ESPECIALIDADE?: string;
}

export interface Ambiente {
  ID_AMBIENTE: number;
  NOME: string;
  CAPACIDADE: number;
  TIPO: 'Laboratório' | 'Sala de Aula' | 'Auditório' | 'Online';
  RECURSOS?: string[];
}

export interface Disciplina {
  ID_DISCIPLINA: number;
  CODIGO: string;
  NOME: string;
  CARGA_HORARIA_PLANEJADA: number;
  MODALIDADE: 'Presencial' | 'EAD' | 'Híbrido';
}

export interface Turma {
  CODIGO_TURMA: string;
  NOME_TURMA: string;
  CURSO: string;
  SEMESTRE: string;
  STATUS: 'Ativa' | 'Concluída' | 'Cancelada';
  TOTAL_ALUNOS: number;
  ID_CALENDARIO: number;
  ID_AMBIENTE: number;
  ID_INSTRUTOR: number;
}

export interface AlocacaoDiaria {
  ID_ALOCACAO: number;
  CODIGO_TURMA: string;
  ID_DISCIPLINA: number;
  DATA: string;
  TURNO: 'Manhã' | 'Tarde' | 'Noite';
  HORAS_ALOCADAS: number;
  ALUNOS_PRESENTES: number;
  OBSERVACOES?: string;
}

export interface Ocupacao {
  ID_OCUPACAO: number;
  ID_AMBIENTE: number;
  DATA: string;
  TURNO: 'Manhã' | 'Tarde' | 'Noite';
  VAGAS_OCUPADAS: number;
  CAPACIDADE_TOTAL: number;
  PERCENTUAL_OCUPACAO: number;
}

export interface DashboardFilters {
  periodoInicio?: string;
  periodoFim?: string;
  instrutorId?: number;
  turmaCodigo?: string;
  ambienteId?: number;
  turno?: string;
  modalidade?: string;
}

export interface KPIMetrics {
  turmasAtivas: number;
  totalAlunosMatriculados: number;
  totalAlunosPresentes: number;
  percentualPresenca: number;
  ocupacaoMedia: number;
  cargaHorariaAlocada: number;
  disciplinasConcluidas: number;
}

export interface ProcessedData {
  calendarios: Calendario[];
  instrutores: Instrutor[];
  ambientes: Ambiente[];
  disciplinas: Disciplina[];
  turmas: Turma[];
  alocacoes: AlocacaoDiaria[];
  ocupacoes: Ocupacao[];
  metrics: KPIMetrics;
}
