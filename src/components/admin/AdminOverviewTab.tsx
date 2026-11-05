/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  FileCheck2,
  Clock,
  Award,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FolderArchive,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminTab } from './AdminSidebar';
import { audio } from '../../services/audioService';
import { StatMetricCard } from '../charts/StatMetricCard';
import { InteractiveLineAreaChart } from '../charts/InteractiveLineAreaChart';
import { InteractiveDonutChart } from '../charts/InteractiveDonutChart';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenQuickAdd: (type: 'user' | 'section' | 'activity' | 'material') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  onNavigateTab,
  onOpenQuickAdd,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'term' | 'year'>('term');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const analytics = adminService.getDetailedAnalytics({ period });
  const recentLogs = adminService.getAuditLogs().slice(0, 6);
  const sections = adminService.getSections();
  const currentUser = adminService.getCurrentUser();

  const handleRefresh = () => {
    setIsRefreshing(true);
    audio.playPop();
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
      audio.playBalanceSuccess();
    }, 400);
  };

  const handleExportCSV = () => {
    audio.playPop();
    const csvContent = adminService.exportGradesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EurekaLab_Reporte_General_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { kpiCards } = analytics;

  return (
    <div key={refreshKey} className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-sky-800 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 font-fun">
              Panel Institucional EurekaLab
            </span>
            <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full">
              Periodo {period === 'week' ? 'Semanal' : period === 'month' ? 'Mensual' : 'Bimestral'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-fun tracking-tight">
            {currentUser.role === 'admin'
              ? 'Centro de Control Pedagógico y Directivo'
              : `Bienvenida, ${currentUser.name} • Gestión Docente`}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mt-1 leading-relaxed">
            Supervisión pedagógica integral, analíticas de retención conceptual en tiempo real y seguimiento por sección escolar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-fun border border-white/20 backdrop-blur-md transition cursor-pointer shadow-xs"
            title="Actualizar datos sin recargar la página"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : 'text-sky-200'}`} />
            <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold font-fun border border-white/30 backdrop-blur-md transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 4. TARJETAS ESTADÍSTICAS - 6 INDICADORES PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Estudiantes */}
        <StatMetricCard
          title="Total Estudiantes"
          value={kpiCards.totalStudents.value}
          description={kpiCards.totalStudents.description}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
          trend={kpiCards.totalStudents.trend}
          onClick={() => onNavigateTab('users')}
          staggerIndex={1}
        />

        {/* 2. Profesores Registrados */}
        <StatMetricCard
          title="Profesores Registrados"
          value={kpiCards.totalTeachers.value}
          description={kpiCards.totalTeachers.description}
          icon={<GraduationCap className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
          trend={kpiCards.totalTeachers.trend}
          onClick={() => onNavigateTab('users')}
          staggerIndex={2}
        />

        {/* 3. Secciones Activas */}
        <StatMetricCard
          title="Secciones Activas"
          value={kpiCards.activeSections.value}
          description={kpiCards.activeSections.description}
          icon={<Layers className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          trend={kpiCards.activeSections.trend}
          onClick={() => onNavigateTab('sections')}
          staggerIndex={3}
        />

        {/* 4. Actividades Realizadas (Completadas) */}
        <StatMetricCard
          title="Actividades Realizadas"
          value={kpiCards.completedActivities.value}
          description={kpiCards.completedActivities.description}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600 border-purple-200"
          trend={kpiCards.completedActivities.trend}
          onClick={() => onNavigateTab('activities')}
          staggerIndex={4}
        />

        {/* 5. Actividades Pendientes */}
        <StatMetricCard
          title="Actividades Pendientes"
          value={kpiCards.pendingActivities.value}
          description={kpiCards.pendingActivities.description}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
          trend={kpiCards.pendingActivities.trend}
          onClick={() => onNavigateTab('grades')}
          staggerIndex={5}
        />

        {/* 6. Promedio General */}
        <StatMetricCard
          title="Promedio General"
          value={kpiCards.overallAverage.value}
          suffix="/100"
          description={kpiCards.overallAverage.description}
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600 border-rose-200"
          trend={kpiCards.overallAverage.trend}
          onClick={() => onNavigateTab('grades')}
          staggerIndex={6}
        />
      </div>

      {/* Accesos Rápidos de Administración */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs card-interactive animate-slide-up stagger-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-fun mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Acciones Rápidas del Sistema</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onOpenQuickAdd('user')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/90 border border-indigo-200 text-indigo-950 text-xs font-bold font-fun transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block leading-tight group-hover:text-indigo-800 transition-colors">Registrar Usuario</span>
              <span className="text-[10px] text-indigo-600 font-normal">Estudiante / Profe</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAdd('section')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-950 text-xs font-bold font-fun transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block leading-tight group-hover:text-emerald-800 transition-colors">Crear Sección</span>
              <span className="text-[10px] text-emerald-600 font-normal">Nueva aula escolar</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAdd('activity')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/90 border border-purple-200 text-purple-950 text-xs font-bold font-fun transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block leading-tight group-hover:text-purple-800 transition-colors">Nueva Actividad</span>
              <span className="text-[10px] text-purple-600 font-normal">Con fecha de entrega</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAdd('material')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200 text-amber-950 text-xs font-bold font-fun transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block leading-tight group-hover:text-amber-800 transition-colors">Subir Material</span>
              <span className="text-[10px] text-amber-700 font-normal">PDF, video o guía</span>
            </div>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid: Evolución de Resultados + Distribución por Rol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line / Area Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <InteractiveLineAreaChart
            title="Evolución del Rendimiento y Entregas Académicas"
            description="Tendencia histórica de calificaciones promedio y volumen de actividades en la plataforma"
            data={period === 'month' ? analytics.evolutionMonthly : analytics.evolutionWeekly}
            series={[
              {
                key: 'rendimiento',
                label: 'Promedio Académico',
                color: '#6366f1',
                fillGradientFrom: '#6366f1',
                fillGradientTo: '#818cf8',
              },
              {
                key: 'retencion',
                label: 'Retención Conceptual',
                color: '#10b981',
                fillGradientFrom: '#10b981',
                fillGradientTo: '#34d399',
              },
              {
                key: 'entregas',
                label: 'Actividades Entregadas',
                color: '#f59e0b',
                fillGradientFrom: '#f59e0b',
                fillGradientTo: '#fbbf24',
              },
            ]}
            height={260}
            unit=" pts"
            periodOptions={[
              { id: 'week', label: 'Por Semana' },
              { id: 'month', label: 'Por Mes' },
            ]}
            activePeriod={period === 'month' ? 'month' : 'week'}
            onPeriodChange={(p) => setPeriod(p as any)}
          />
        </div>

        {/* Role Distribution Donut Chart (1 Col) */}
        <div className="lg:col-span-1">
          <InteractiveDonutChart
            title="Distribución de Usuarios por Rol"
            description="Composición activa de la comunidad educativa"
            data={analytics.roleDistribution}
            centerLabel="Usuarios"
            size={180}
            onSelectSegment={(seg) => {
              audio.playPop();
              onNavigateTab('users');
            }}
          />
        </div>
      </div>

      {/* Two Column Layout: Active Sections & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sections Overview */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-fun flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Secciones Escolares ({sections.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('sections')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer font-fun"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {sections.slice(0, 4).map((sec) => (
              <div
                key={sec.id}
                onClick={() => onNavigateTab('sections')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {sec.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-fun">
                      {sec.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Docente: {sec.teacherName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-fun">
                    {sec.studentIds.length} alumnos
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-fun">
                    {sec.activityIds.length} act.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Audit Stream */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 font-fun flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Actividad y Eventos Recientes</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Auditoría en tiempo real
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[260px] pr-1 custom-scrollbar">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 font-fun truncate">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    <strong className="text-indigo-900">{log.actorName}</strong> ({log.actorRole}): {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
