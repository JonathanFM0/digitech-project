// src/components/ExportButton.tsx
import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';
import { AlocacaoDiaria, Turma, Disciplina, KPIMetrics } from '../types';
import { formatDate, sanitizeInput } from '../utils/helpers';

interface ExportButtonProps {
  alocacoes: AlocacaoDiaria[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  metrics: KPIMetrics;
  filters?: Record<string, unknown>;
}

export function ExportButton({ alocacoes, turmas, disciplinas, metrics, filters }: ExportButtonProps) {
  const { addToast } = useToast();

  // Prepara dados para exportação
  const prepareDataForExport = () => {
    return alocacoes.map(alocacao => {
      const turma = turmas.find(t => t.CODIGO_TURMA === alocacao.CODIGO_TURMA);
      const disciplina = disciplinas.find(d => d.ID_DISCIPLINA === alocacao.ID_DISCIPLINA);
      
      return {
        Data: formatDate(alocacao.DATA),
        Turno: alocacao.TURNO,
        Turma: turma?.NOME_TURMA || alocacao.CODIGO_TURMA,
        Curso: turma?.CURSO || '',
        Disciplina: disciplina?.NOME || '',
        Alunos_Presentes: alocacao.ALUNOS_PRESENTES,
        Total_Alunos: turma?.TOTAL_ALUNOS || 0,
        Percentual_Presenca: turma && turma.TOTAL_ALUNOS > 0 
          ? `${((alocacao.ALUNOS_PRESENTES / turma.TOTAL_ALUNOS) * 100).toFixed(1)}%` 
          : 'N/A',
        Horas_Alocadas: alocacao.HORAS_ALOCADAS,
        Observacoes: alocacao.OBSERVACOES || ''
      };
    });
  };

  // Exporta para CSV
  const exportCSV = () => {
    try {
      const data = prepareDataForExport();
      if (data.length === 0) {
        addToast('Nenhum dado para exportar', 'error');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = String(row[header as keyof typeof row] ?? '');
            // Escapa vírgulas e aspas
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `digitech_alocacoes_${new Date().toISOString().split('T')[0]}.csv`);
      addToast('CSV exportado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao exportar CSV', 'error');
      console.error(error);
    }
  };

  // Exporta para Excel (XLSX)
  const exportExcel = () => {
    try {
      const data = prepareDataForExport();
      if (data.length === 0) {
        addToast('Nenhum dado para exportar', 'error');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alocações');

      // Adiciona sheet de resumo com KPIs
      const kpiData = [
        ['Métricas do Dashboard'],
        ['Turmas Ativas', metrics.turmasAtivas],
        ['Total Alunos Matriculados', metrics.totalAlunosMatriculados],
        ['% Presença Média', `${metrics.percentualPresenca}%`],
        ['% Ocupação Média', `${metrics.ocupacaoMedia}%`],
        ['Carga Horária Alocada', `${metrics.cargaHorariaAlocada}h`],
        ['Disciplinas Concluídas', metrics.disciplinasConcluidas]
      ];
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Resumo');

      XLSX.writeFile(workbook, `digitech_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast('Excel exportado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao exportar Excel', 'error');
      console.error(error);
    }
  };

  // Exporta para PDF
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.text('DigiTech Dashboard - Relatório de Alocações', 14, 20);
      
      // Timestamp e filtros
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
      
      if (filters && Object.keys(filters).length > 0) {
        doc.text('Filtros aplicados:', 14, 34);
        let y = 38;
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            doc.text(`  • ${key}: ${sanitizeInput(String(value))}`, 14, y);
            y += 4;
          }
        });
      }

      // KPIs
      doc.setFontSize(12);
      doc.text('Métricas Principais', 14, 50);
      doc.setFontSize(10);
      const kpiData = [
        ['Turmas Ativas', String(metrics.turmasAtivas)],
        ['Alunos Matriculados', String(metrics.totalAlunosMatriculados)],
        ['% Presença Média', `${metrics.percentualPresenca}%`],
        ['% Ocupação Média', `${metrics.ocupacaoMedia}%`],
        ['Carga Horária', `${metrics.cargaHorariaAlocada}h`]
      ];
      
      autoTable(doc, {
        startY: 55,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // Tabela de alocações
      const tableData = alocacoes.slice(0, 50).map(a => {
        const turma = turmas.find(t => t.CODIGO_TURMA === a.CODIGO_TURMA);
        const disciplina = disciplinas.find(d => d.ID_DISCIPLINA === a.ID_DISCIPLINA);
        return [
          formatDate(a.DATA),
          a.TURNO,
          turma?.NOME_TURMA || a.CODIGO_TURMA,
          disciplina?.NOME || '',
          String(a.ALUNOS_PRESENTES),
          `${a.HORAS_ALOCADAS}h`
        ];
      });

      autoTable(doc, {
        startY: (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 90,
        head: [['Data', 'Turno', 'Turma', 'Disciplina', 'Presentes', 'Horas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        foot: alocacoes.length > 50 ? [`... e mais ${alocacoes.length - 50} registros`] : undefined
      });

      doc.save(`digitech_relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
      addToast('PDF exportado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao exportar PDF', 'error');
      console.error(error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportCSV}
        title="Exportar CSV"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportExcel}
        title="Exportar Excel"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPDF}
        title="Exportar PDF"
      >
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}
