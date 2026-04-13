// src/hooks/useDashboardData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProcessedData, DashboardFilters } from '../types';
import { processData, applyFilters } from '../utils/dataProcessor';
import {
  mockCalendarios,
  mockInstrutores,
  mockAmbientes,
  mockDisciplinas,
  mockTurmas,
  mockAlocacoes,
  mockOcupacoes
} from '../data/mockData';

interface UseDashboardDataReturn {
  data: ProcessedData | null;
  filteredAlocacoes: typeof mockAlocacoes;
  filteredOcupacoes: typeof mockOcupacoes;
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [filters, setFiltersState] = useState<DashboardFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega e processa dados inicialmente
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Simula loading de dados (em produção viria de API ou arquivo)
      setTimeout(() => {
        const processed = processData(
          mockCalendarios,
          mockInstrutores,
          mockAmbientes,
          mockDisciplinas,
          mockTurmas,
          mockAlocacoes,
          mockOcupacoes
        );
        setData(processed);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aplica filtros com memoization
  const filteredAlocacoes = useMemo(() => {
    if (!data) return [];
    return applyFilters(data.alocacoes, filters, data.turmas);
  }, [data, filters]);

  const filteredOcupacoes = useMemo(() => {
    if (!data) return [];
    return applyFilters(data.ocupacoes, filters, data.turmas);
  }, [data, filters]);

  const setFilters = useCallback((newFilters: DashboardFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data,
    filteredAlocacoes,
    filteredOcupacoes,
    filters,
    setFilters,
    loading,
    error,
    refreshData: loadData
  };
}
