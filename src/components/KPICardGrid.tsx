// src/components/KPICardGrid.tsx
import React from 'react';
import { Users, CheckCircle, TrendingUp, Clock, BookOpen, Calendar, Percent } from 'lucide-react';
import { KPIMetrics } from '../types';
import { Card, CardContent } from './ui/Card';
import { formatNumber, formatPercent } from '../utils/helpers';
import { cn } from '../utils/helpers';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
};

function KPICard({ title, value, icon, trend, color }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <p className={cn(
                'mt-1 text-xs font-medium',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-gray-500'
              )}>
                {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trend === 'neutral' && '→'}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KPICardGridProps {
  metrics: KPIMetrics;
}

export function KPICardGrid({ metrics }: KPICardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        title="Turmas Ativas"
        value={formatNumber(metrics.turmasAtivas)}
        icon={<Calendar className="w-6 h-6" />}
        color="blue"
      />
      <KPICard
        title="Alunos Matriculados"
        value={formatNumber(metrics.totalAlunosMatriculados)}
        icon={<Users className="w-6 h-6" />}
        color="green"
      />
      <KPICard
        title="% Presença Média"
        value={formatPercent(metrics.percentualPresenca)}
        icon={<CheckCircle className="w-6 h-6" />}
        trend={metrics.percentualPresenca >= 80 ? 'up' : metrics.percentualPresenca >= 60 ? 'neutral' : 'down'}
        color={metrics.percentualPresenca >= 80 ? 'green' : metrics.percentualPresenca >= 60 ? 'yellow' : 'red'}
      />
      <KPICard
        title="% Ocupação Média"
        value={formatPercent(metrics.ocupacaoMedia)}
        icon={<Percent className="w-6 h-6" />}
        trend={metrics.ocupacaoMedia >= 70 ? 'up' : metrics.ocupacaoMedia >= 50 ? 'neutral' : 'down'}
        color={metrics.ocupacaoMedia >= 70 ? 'green' : metrics.ocupacaoMedia >= 50 ? 'yellow' : 'red'}
      />
      <KPICard
        title="Carga Horária Alocada"
        value={`${formatNumber(metrics.cargaHorariaAlocada)}h`}
        icon={<Clock className="w-6 h-6" />}
        color="purple"
      />
      <KPICard
        title="Disciplinas Concluídas"
        value={formatNumber(metrics.disciplinasConcluidas)}
        icon={<BookOpen className="w-6 h-6" />}
        color="green"
      />
      <KPICard
        title="Total Presentes (Acum.)"
        value={formatNumber(metrics.totalAlunosPresentes)}
        icon={<TrendingUp className="w-6 h-6" />}
        color="blue"
      />
      <KPICard
        title="Status Geral"
        value={metrics.ocupacaoMedia >= 70 && metrics.percentualPresenca >= 80 ? 'Ótimo' : metrics.ocupacaoMedia >= 50 ? 'Regular' : 'Atenção'}
        icon={<CheckCircle className="w-6 h-6" />}
        color={metrics.ocupacaoMedia >= 70 && metrics.percentualPresenca >= 80 ? 'green' : metrics.ocupacaoMedia >= 50 ? 'yellow' : 'red'}
      />
    </div>
  );
}
