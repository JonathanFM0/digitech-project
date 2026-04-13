// src/components/DataTable.tsx
import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { AlocacaoDiaria, Turma, Disciplina, Ambiente, Instrutor } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate, formatNumber } from '../utils/helpers';
import { cn } from '../utils/helpers';

interface DataTableProps {
  alocacoes: AlocacaoDiaria[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  ambientes: Ambiente[];
  instrutores: Instrutor[];
}

type SortKey = 'DATA' | 'TURNO' | 'CODIGO_TURMA' | 'ALUNOS_PRESENTES' | 'HORAS_ALOCADAS';
type SortOrder = 'asc' | 'desc';

export function DataTable({ alocacoes, turmas, disciplinas, ambientes, instrutores }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('DATA');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 10;

  // Helper para obter nome da turma
  const getTurmaNome = (codigo: string) => {
    const turma = turmas.find(t => t.CODIGO_TURMA === codigo);
    return turma?.NOME_TURMA || codigo;
  };

  // Helper para obter nome da disciplina
  const getDisciplinaNome = (id: number) => {
    const disciplina = disciplinas.find(d => d.ID_DISCIPLINA === id);
    return disciplina?.NOME || `Disciplina ${id}`;
  };

  // Filtra e ordena dados
  const filteredAndSortedData = useMemo(() => {
    let data = [...alocacoes];

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => {
        const turmaNome = getTurmaNome(item.CODIGO_TURMA).toLowerCase();
        const disciplinaNome = getDisciplinaNome(item.ID_DISCIPLINA).toLowerCase();
        return turmaNome.includes(term) || disciplinaNome.includes(term);
      });
    }

    // Ordenação
    data.sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'DATA':
          comparison = new Date(a.DATA).getTime() - new Date(b.DATA).getTime();
          break;
        case 'TURNO':
          comparison = a.TURNO.localeCompare(b.TURNO);
          break;
        case 'CODIGO_TURMA':
          comparison = a.CODIGO_TURMA.localeCompare(b.CODIGO_TURMA);
          break;
        case 'ALUNOS_PRESENTES':
          comparison = a.ALUNOS_PRESENTES - b.ALUNOS_PRESENTES;
          break;
        case 'HORAS_ALOCADAS':
          comparison = a.HORAS_ALOCADAS - b.HORAS_ALOCADAS;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [alocacoes, searchTerm, sortKey, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return (
      <ArrowUpDown className={cn('w-4 h-4 ml-1', sortOrder === 'asc' ? 'text-primary-600' : 'text-primary-600 rotate-180 transition-transform')} />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alocações Diárias</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar turma ou disciplina..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                'pl-10 pr-4 py-2 text-sm border rounded-lg',
                'bg-white dark:bg-gray-900',
                'border-gray-300 dark:border-gray-600',
                'text-gray-900 dark:text-white',
                'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              )}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('TURNO')}
                >
                  <div className="flex items-center">
                    Turno
                    <SortIcon column="TURNO" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('CODIGO_TURMA')}
                >
                  <div className="flex items-center">
                    Turma
                    <SortIcon column="CODIGO_TURMA" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Disciplina
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('ALUNOS_PRESENTES')}
                >
                  <div className="flex items-center">
                    Presentes
                    <SortIcon column="ALUNOS_PRESENTES" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('HORAS_ALOCADAS')}
                >
                  <div className="flex items-center">
                    Horas
                    <SortIcon column="HORAS_ALOCADAS" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((alocacao) => (
                <tr key={alocacao.ID_ALOCACAO} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(alocacao.DATA)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      alocacao.TURNO === 'Manhã' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                      alocacao.TURNO === 'Tarde' && 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                      alocacao.TURNO === 'Noite' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    )}>
                      {alocacao.TURNO}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getTurmaNome(alocacao.CODIGO_TURMA)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getDisciplinaNome(alocacao.ID_DISCIPLINA)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatNumber(alocacao.ALUNOS_PRESENTES)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {alocacao.HORAS_ALOCADAS}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages} ({filteredAndSortedData.length} registros)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma alocação encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
