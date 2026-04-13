// src/utils/dataProcessor.ts
import { format, parse, isValid } from 'date-fns';
import {
  Calendario, Instrutor, Ambiente, Disciplina, Turma,
  AlocacaoDiaria, Ocupacao, DashboardFilters, KPIMetrics, ProcessedData
} from '../types';

/**
 * Parse de datas no formato DD/MM/YY para ISO 8601
 */
export function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Tenta parsear DD/MM/YY ou DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    let year = parseInt(parts[2], 10);
    
    // Se ano tem 2 dígitos, assume 20XX
    if (year < 100) {
      year += 2000;
    }
    
    const date = new Date(year, month, day);
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd');
    }
  }
  
  // Se já estiver em formato ISO ou outro, retorna como está
  return dateStr;
}

/**
 * Normaliza strings: trim, uppercase/lowercase conforme necessário
 */
export function normalizeString(str: string | undefined | null, toUpper = false): string {
  if (!str) return '';
  const trimmed = str.trim();
  return toUpper ? trimmed.toUpperCase() : trimmed;
}

/**
 * Remove duplicatas de array baseado em chave única
 */
export function removeDuplicates<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Validação de consistência básica dos dados
 */
export function validateData(data: Partial<ProcessedData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.turmas || data.turmas.length === 0) {
    errors.push('Nenhuma turma encontrada');
  }
  
  if (!data.alocacoes || data.alocacoes.length === 0) {
    errors.push('Nenhuma alocação encontrada');
  }
  
  // Verifica referências cruzadas
  if (data.turmas && data.ambientes) {
    const ambienteIds = new Set(data.ambientes.map(a => a.ID_AMBIENTE));
    data.turmas.forEach(turma => {
      if (!ambienteIds.has(turma.ID_AMBIENTE)) {
        errors.push(`Turma ${turma.CODIGO_TURMA} referencia ambiente inexistente: ${turma.ID_AMBIENTE}`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Calcula métricas KPI a partir dos dados processados
 */
export function calculateMetrics(
  turmas: Turma[],
  alocacoes: AlocacaoDiaria[],
  ocupacoes: Ocupacao[]
): KPIMetrics {
  const turmasAtivas = turmas.filter(t => t.STATUS === 'Ativa').length;
  const totalAlunosMatriculados = turmas.reduce((sum, t) => sum + t.TOTAL_ALUNOS, 0);
  
  // Soma de alunos presentes nas alocações (pode haver duplicação por dia/turma)
  const totalAlunosPresentes = alocacoes.reduce((sum, a) => sum + a.ALUNOS_PRESENTES, 0);
  
  // Percentual de presença médio
  const presencaPorAlocacao = alocacoes.map(a => {
    const turma = turmas.find(t => t.CODIGO_TURMA === a.CODIGO_TURMA);
    if (!turma || turma.TOTAL_ALUNOS === 0) return 0;
    return (a.ALUNOS_PRESENTES / turma.TOTAL_ALUNOS) * 100;
  });
  const percentualPresenca = presencaPorAlocacao.length > 0
    ? presencaPorAlocacao.reduce((sum, p) => sum + p, 0) / presencaPorAlocacao.length
    : 0;
  
  // Ocupação média
  const ocupacaoMedia = ocupacoes.length > 0
    ? ocupacoes.reduce((sum, o) => sum + o.PERCENTUAL_OCUPACAO, 0) / ocupacoes.length
    : 0;
  
  // Carga horária alocada
  const cargaHorariaAlocada = alocacoes.reduce((sum, a) => sum + a.HORAS_ALOCADAS, 0);
  
  // Disciplinas concluídas (simplificado: baseado em turmas concluídas)
  const disciplinasConcluidas = turmas.filter(t => t.STATUS === 'Concluída').length;
  
  return {
    turmasAtivas,
    totalAlunosMatriculados,
    totalAlunosPresentes,
    percentualPresenca: Math.round(percentualPresenca * 100) / 100,
    ocupacaoMedia: Math.round(ocupacaoMedia * 100) / 100,
    cargaHorariaAlocada,
    disciplinasConcluidas
  };
}

/**
 * Aplica filtros aos dados
 */
export function applyFilters<T extends AlocacaoDiaria | Ocupacao>(
  data: T[],
  filters: DashboardFilters,
  turmas: Turma[]
): T[] {
  return data.filter(item => {
    // Filtro por período
    if (filters.periodoInicio && 'DATA' in item) {
      const itemDate = new Date(item.DATA);
      const inicioDate = new Date(filters.periodoInicio);
      if (itemDate < inicioDate) return false;
    }
    if (filters.periodoFim && 'DATA' in item) {
      const itemDate = new Date(item.DATA);
      const fimDate = new Date(filters.periodoFim);
      if (itemDate > fimDate) return false;
    }
    
    // Filtro por turma
    if (filters.turmaCodigo && 'CODIGO_TURMA' in item) {
      if (item.CODIGO_TURMA !== filters.turmaCodigo) return false;
    }
    
    // Filtro por turno
    if (filters.turno && 'TURNO' in item) {
      if (item.TURNO !== filters.turno) return false;
    }
    
    // Filtro por instrutor (precisa join com turmas)
    if (filters.instrutorId && 'CODIGO_TURMA' in item) {
      const turma = turmas.find(t => t.CODIGO_TURMA === item.CODIGO_TURMA);
      if (!turma || turma.ID_INSTRUTOR !== filters.instrutorId) return false;
    }
    
    // Filtro por ambiente (para Ocupacao)
    if (filters.ambienteId && 'ID_AMBIENTE' in item) {
      if (item.ID_AMBIENTE !== filters.ambienteId) return false;
    }
    
    return true;
  });
}

/**
 * Sanitiza input de texto para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Processa e mergeia dados relacionais
 */
export function processData(
  calendarios: Calendario[],
  instrutores: Instrutor[],
  ambientes: Ambiente[],
  disciplinas: Disciplina[],
  turmas: Turma[],
  alocacoes: AlocacaoDiaria[],
  ocupacoes: Ocupacao[]
): ProcessedData {
  // Normaliza datas
  const normalizedAlocacoes = alocacoes.map(a => ({
    ...a,
    DATA: parseDate(a.DATA)
  }));
  
  const normalizedOcupacoes = ocupacoes.map(o => ({
    ...o,
    DATA: parseDate(o.DATA)
  }));
  
  // Remove duplicatas
  const uniqueAlocacoes = removeDuplicates(normalizedAlocacoes, 'ID_ALOCACAO');
  const uniqueOcupacoes = removeDuplicates(normalizedOcupacoes, 'ID_OCUPACAO');
  
  // Valida consistência
  const validation = validateData({
    turmas,
    ambientes,
    alocacoes: uniqueAlocacoes
  });
  
  if (!validation.valid) {
    console.warn('Alertas de validação:', validation.errors);
  }
  
  // Calcula métricas
  const metrics = calculateMetrics(turmas, uniqueAlocacoes, uniqueOcupacoes);
  
  return {
    calendarios,
    instrutores,
    ambientes,
    disciplinas,
    turmas,
    alocacoes: uniqueAlocacoes,
    ocupacoes: uniqueOcupacoes,
    metrics
  };
}
