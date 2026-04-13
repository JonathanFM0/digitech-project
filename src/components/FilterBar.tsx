// src/components/FilterBar.tsx
import React, { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { DashboardFilters } from '../types';
import { Button } from './ui/Button';
import { cn } from '../utils/helpers';

interface FilterBarProps {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  turmas?: Array<{ CODIGO_TURMA: string; NOME_TURMA: string }>;
  instrutores?: Array<{ ID_INSTRUTOR: number; NOME: string }>;
  ambientes?: Array<{ ID_AMBIENTE: number; NOME: string }>;
}

export function FilterBar({
  filters,
  setFilters,
  turmas = [],
  instrutores = [],
  ambientes = []
}: FilterBarProps) {
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== undefined && v !== '');
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      periodoInicio: undefined,
      periodoFim: undefined,
      instrutorId: undefined,
      turmaCodigo: undefined,
      ambienteId: undefined,
      turno: undefined,
      modalidade: undefined
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filtros
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Período */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Data Início
          </label>
          <input
            type="date"
            value={filters.periodoInicio || ''}
            onChange={(e) => setFilters({ periodoInicio: e.target.value || undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Data Fim
          </label>
          <input
            type="date"
            value={filters.periodoFim || ''}
            onChange={(e) => setFilters({ periodoFim: e.target.value || undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
        </div>

        {/* Turma */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Turma
          </label>
          <select
            value={filters.turmaCodigo || ''}
            onChange={(e) => setFilters({ turmaCodigo: e.target.value || undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="">Todas</option>
            {turmas.map(t => (
              <option key={t.CODIGO_TURMA} value={t.CODIGO_TURMA}>
                {t.NOME_TURMA}
              </option>
            ))}
          </select>
        </div>

        {/* Instrutor */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Instrutor
          </label>
          <select
            value={filters.instrutorId || ''}
            onChange={(e) => setFilters({ instrutorId: e.target.value ? Number(e.target.value) : undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="">Todos</option>
            {instrutores.map(i => (
              <option key={i.ID_INSTRUTOR} value={i.ID_INSTRUTOR}>
                {i.NOME}
              </option>
            ))}
          </select>
        </div>

        {/* Ambiente */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Ambiente
          </label>
          <select
            value={filters.ambienteId || ''}
            onChange={(e) => setFilters({ ambienteId: e.target.value ? Number(e.target.value) : undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="">Todos</option>
            {ambientes.map(a => (
              <option key={a.ID_AMBIENTE} value={a.ID_AMBIENTE}>
                {a.NOME}
              </option>
            ))}
          </select>
        </div>

        {/* Turno */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Turno
          </label>
          <select
            value={filters.turno || ''}
            onChange={(e) => setFilters({ turno: e.target.value || undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="">Todos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        {/* Modalidade */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Modalidade
          </label>
          <select
            value={filters.modalidade || ''}
            onChange={(e) => setFilters({ modalidade: e.target.value || undefined })}
            className={cn(
              'w-full px-3 py-2 text-sm border rounded-lg',
              'bg-white dark:bg-gray-900',
              'border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          >
            <option value="">Todas</option>
            <option value="Presencial">Presencial</option>
            <option value="EAD">EAD</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>
      </div>
    </div>
  );
}
