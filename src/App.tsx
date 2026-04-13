// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPICardGrid } from './components/KPICardGrid';
import { Charts } from './components/Charts';
import { DataTable } from './components/DataTable';
import { ExportButton } from './components/ExportButton';
import { ToastProvider } from './components/ui/Toast';
import { useDashboardData } from './hooks/useDashboardData';

function DashboardContent() {
  const { data, filteredAlocacoes, filteredOcupacoes, filters, setFilters, loading, error } = useDashboardData();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Erro ao carregar dados'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          turmas={data.turmas.map(t => ({ CODIGO_TURMA: t.CODIGO_TURMA, NOME_TURMA: t.NOME_TURMA }))}
          instrutores={data.instrutores.map(i => ({ ID_INSTRUTOR: i.ID_INSTRUTOR, NOME: i.NOME }))}
          ambientes={data.ambientes.map(a => ({ ID_AMBIENTE: a.ID_AMBIENTE, NOME: a.NOME }))}
        />

        {/* KPIs */}
        <KPICardGrid metrics={data.metrics} />

        {/* Gráficos */}
        <Charts
          alocacoes={filteredAlocacoes}
          ocupacoes={filteredOcupacoes}
          turmas={data.turmas}
          disciplinas={data.disciplinas}
          ambientes={data.ambientes}
        />

        {/* Export e Tabela */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalhamento de Alocações
          </h2>
          <ExportButton
            alocacoes={filteredAlocacoes}
            turmas={data.turmas}
            disciplinas={data.disciplinas}
            metrics={data.metrics}
            filters={filters}
          />
        </div>

        <DataTable
          alocacoes={filteredAlocacoes}
          turmas={data.turmas}
          disciplinas={data.disciplinas}
          ambientes={data.ambientes}
          instrutores={data.instrutores}
        />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>DigiTech Dashboard © {new Date().getFullYear()} - Status 2026</p>
          <p className="mt-1">Desenvolvido com React + TypeScript + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

export default App;
