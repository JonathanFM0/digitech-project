// src/components/Charts.tsx
import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { AlocacaoDiaria, Ocupacao, Turma, Disciplina, Ambiente } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface ChartsProps {
  alocacoes: AlocacaoDiaria[];
  ocupacoes: Ocupacao[];
  turmas: Turma[];
  disciplinas: Disciplina[];
  ambientes: Ambiente[];
}

/**
 * Agrupa alocações por turno para gráfico de barras
 */
function prepareOcupacaoPorTurnoData(alocacoes: AlocacaoDiaria[], turmas: Turma[]): Array<{
  turno: string;
  ocupadas: number;
  capacidade: number;
}> {
  const turnos = ['Manhã', 'Tarde', 'Noite'];
  
  return turnos.map(turno => {
    const alocacoesTurno = alocacoes.filter(a => a.TURNO === turno);
    const ocupadas = alocacoesTurno.reduce((sum, a) => sum + a.ALUNOS_PRESENTES, 0);
    
    // Calcula capacidade total baseada nas turmas do turno
    const turmasTurno = turmas.filter(t => {
      const hasAlocacao = alocacoesTurno.some(a => a.CODIGO_TURMA === t.CODIGO_TURMA);
      return hasAlocacao;
    });
    const capacidade = turmasTurno.reduce((sum, t) => sum + t.TOTAL_ALUNOS, 0) || ocupadas;
    
    return {
      turno,
      ocupadas,
      capacidade
    };
  });
}

/**
 * Prepara dados para evolução de presença ao longo do tempo
 */
function prepareEvolucaoPresencaData(alocacoes: AlocacaoDiaria[]): Array<{
  data: string;
  presentes: number;
  percentual: number;
}> {
  // Agrupa por data
  const porData = new Map<string, { presentes: number; total: number }>();
  
  alocacoes.forEach(alocacao => {
    if (!porData.has(alocacao.DATA)) {
      porData.set(alocacao.DATA, { presentes: 0, total: 0 });
    }
    const entry = porData.get(alocacao.DATA)!;
    entry.presentes += alocacao.ALUNOS_PRESENTES;
    entry.total += alocacao.ALUNOS_PRESENTES; // Simplificado
  });
  
  return Array.from(porData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, values]) => ({
      data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      presentes: values.presentes,
      percentual: Math.round((values.presentes / Math.max(values.total, 1)) * 100)
    }));
}

/**
 * Prepara dados para distribuição de ocupação por ambiente
 */
function prepareOcupacaoAmbienteData(ocupacoes: Ocupacao[], ambientes: Ambiente[]): Array<{
  nome: string;
  ocupacao: number;
}> {
  return ambientes.map(ambiente => {
    const ocupacoesAmbiente = ocupacoes.filter(o => o.ID_AMBIENTE === ambiente.ID_AMBIENTE);
    const mediaOcupacao = ocupacoesAmbiente.length > 0
      ? ocupacoesAmbiente.reduce((sum, o) => sum + o.PERCENTUAL_OCUPACAO, 0) / ocupacoesAmbiente.length
      : 0;
    
    return {
      nome: ambiente.NOME,
      ocupacao: Math.round(mediaOcupacao * 100) / 100
    };
  });
}

/**
 * Prepara dados para progresso de disciplinas por turma
 */
function prepareProgressoDisciplinasData(alocacoes: AlocacaoDiaria[], turmas: Turma[], disciplinas: Disciplina[]): Array<{
  turma: string;
  aulas: number;
  cargaHoraria: number;
}> {
  return turmas.slice(0, 6).map(turma => {
    const alocacoesTurma = alocacoes.filter(a => a.CODIGO_TURMA === turma.CODIGO_TURMA);
    const totalAulas = alocacoesTurma.length;
    const totalHoras = alocacoesTurma.reduce((sum, a) => sum + a.HORAS_ALOCADAS, 0);
    
    return {
      turma: turma.CODIGO_TURMA.split('-').pop() || turma.CODIGO_TURMA,
      aulas: totalAulas,
      cargaHoraria: totalHoras
    };
  });
}

export function Charts({ alocacoes, ocupacoes, turmas, disciplinas, ambientes }: ChartsProps) {
  const ocupacaoPorTurnoData = useMemo(() => 
    prepareOcupacaoPorTurnoData(alocacoes, turmas), 
    [alocacoes, turmas]
  );
  
  const evolucaoPresencaData = useMemo(() => 
    prepareEvolucaoPresencaData(alocacoes), 
    [alocacoes]
  );
  
  const ocupacaoAmbienteData = useMemo(() => 
    prepareOcupacaoAmbienteData(ocupacoes, ambientes), 
    [ocupacoes, ambientes]
  );
  
  const progressoDisciplinasData = useMemo(() => 
    prepareProgressoDisciplinasData(alocacoes, turmas, disciplinas), 
    [alocacoes, turmas, disciplinas]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de Barras - Ocupação por Turno */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas Ocupadas vs Capacidade por Turno</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ocupacaoPorTurnoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turno" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ocupadas" name="Ocupadas" fill="#3b82f6" />
              <Bar dataKey="capacidade" name="Capacidade" fill="#93c5fd" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Evolução de Presença */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucaoPresencaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="presentes" name="Presentes" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Ocupação por Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Ocupação Média por Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ocupacaoAmbienteData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, ocupacao }) => `${nome}: ${ocupacao}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="ocupacao"
              >
                {ocupacaoAmbienteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Progresso de Disciplinas */}
      <Card>
        <CardHeader>
          <CardTitle>Carga Horária por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressoDisciplinasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cargaHoraria" name="Horas Realizadas" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
