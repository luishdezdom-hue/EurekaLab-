/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Target,
  ArrowUpRight,
  Eye,
  Check,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';
import { StatMetricCard } from '../charts/StatMetricCard';
import { InteractiveBarChart } from '../charts/InteractiveBarChart';
import { InteractiveHorizontalBarChart } from '../charts/InteractiveHorizontalBarChart';
import { InteractiveLineAreaChart } from '../charts/InteractiveLineAreaChart';
import { InteractiveDonutChart } from '../charts/InteractiveDonutChart';
import { InteractiveSectionComparison } from '../charts/InteractiveSectionComparison';
import { InteractiveGaugeCard } from '../charts/InteractiveGaugeCard';

export const AdminStatsTab: React.FC = () => {
  const sections = adminService.getSections();
  const allStudents = adminService.getUsers('student');
  const currentUser = adminService.getCurrentUser();

  // Filters
  const [filterSectionId, setFilterSectionId] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'term' | 'year'>('term');

  // Refresh & interactive inspection state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);

  // Compute analytics from service
  const analytics = adminService.getDetailedAnalytics({
    period: filterPeriod,
    sectionId: filterSectionId,
    studentId: filterStudentId,
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    audio.playPop();
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setIsRefreshing(false);
      audio.playBalanceSuccess();
    }, 450);
  };

  const { kpiCards } = analytics;

  // Prepare Student Bar Chart Data
  const studentBarData = analytics.studentPerformance.slice(0, 10).map((std) => ({
    id: std.id,
    label: std.name,
    sublabel: `${std.grade} • ${std.email.split('@')[0]}`,
    values: {
      promedio: std.averageGrade,
      aprendizajeReal: std.realLearningScore,
    },
  }));

  // Prepare Submission Status Donut Data
  const submissionStatusData = [
    {
      id: 'graded',
      label: 'Actividades Evaluadas',
      value: analytics.completedSubsCount,
      color: '#10b981',
    },
    {
      id: 'pending',
      label: 'Pendientes de Revisión',
      value: analytics.pendingSubsCount,
      color: '#f59e0b',
    },
    {
      id: 'unsubmitted',
      label: 'En Proceso / Sin Entregar',
      value: Math.max(0, analytics.studentPerformance.length * 2 - (analytics.completedSubsCount + analytics.pendingSubsCount)),
      color: '#cbd5e1',
    },
  ];

  // Prepare Most Utilized Activities Horizontal Bar Data
  const activityRankingItems = analytics.activityUsageRanking.map((act) => ({
    id: act.id,
    label: act.title,
    sublabel: `Materia: ${act.subject} • Vence: ${act.dueDate}`,
    value: act.totalSubmissions,
    maxValue: Math.max(...analytics.activityUsageRanking.map((a) => a.totalSubmissions), 5),
    badge: `Promedio: ${act.averageScore} pts`,
    secondaryText: `${act.gradedCount} calificadas`,
    color:
      act.subject === 'matematicas'
        ? 'from-emerald-500 to-teal-400'
        : act.subject === 'algoritmos'
        ? 'from-indigo-500 to-sky-400'
        : act.subject === 'lectura'
        ? 'from-rose-500 to-pink-400'
        : 'from-amber-500 to-yellow-400',
  }));

  // Prepare Section Participation Ranking Items
  const sectionRankingItems = analytics.sectionParticipationRanking.map((sec) => ({
    id: sec.id,
    label: sec.label,
    sublabel: sec.sublabel,
    icon: <span>{sec.icon}</span>,
    value: sec.value,
    badge: sec.badge,
    color: sec.value >= 75 ? 'from-emerald-500 to-teal-400' : 'from-indigo-500 to-sky-400',
  }));

  return (
    <div key={refreshKey} className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & INTERACTIVE FILTERS BAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full font-fun border border-indigo-200">
              Analíticas Avanzadas de Aprendizaje
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Evaluación Objetiva y Formativa
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 font-fun mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Métricas de Rendimiento, Asistencia y Retención</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
            Gráficos interactivos con datos pedagógicos reales. Pasa el cursor sobre cualquier elemento para inspeccionar valores exactos y alternar series.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSectionId}
              onChange={(e) => {
                setFilterSectionId(e.target.value);
                setFilterStudentId('all');
                audio.playPop();
              }}
              className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="all">Todas las secciones</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStudentId}
              onChange={(e) => {
                setFilterStudentId(e.target.value);
                audio.playPop();
              }}
              className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">Todos los alumnos</option>
              {allStudents.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} {std.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value as any);
                audio.playPop();
              }}
              className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes (Marzo)</option>
              <option value="term">Bimestre Actual</option>
              <option value="year">Ciclo Escolar Completo</option>
            </select>
          </div>

          {/* One-Click Instant Data Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-fun shadow-xs transition cursor-pointer"
            title="Actualizar datos sin recargar la página"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Actualizando' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* 4. TARJETAS ESTADÍSTICAS - 6 INDICADORES GENERALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatMetricCard
          title="Total Estudiantes"
          value={kpiCards.totalStudents.value}
          description={kpiCards.totalStudents.description}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
          trend={kpiCards.totalStudents.trend}
          staggerIndex={1}
        />

        <StatMetricCard
          title="Profesores Registrados"
          value={kpiCards.totalTeachers.value}
          description={kpiCards.totalTeachers.description}
          icon={<GraduationCap className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
          trend={kpiCards.totalTeachers.trend}
          staggerIndex={2}
        />

        <StatMetricCard
          title="Secciones Activas"
          value={kpiCards.activeSections.value}
          description={kpiCards.activeSections.description}
          icon={<Layers className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          trend={kpiCards.activeSections.trend}
          staggerIndex={3}
        />

        <StatMetricCard
          title="Actividades Realizadas"
          value={kpiCards.completedActivities.value}
          description={kpiCards.completedActivities.description}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600 border-purple-200"
          trend={kpiCards.completedActivities.trend}
          staggerIndex={4}
        />

        <StatMetricCard
          title="Actividades Pendientes"
          value={kpiCards.pendingActivities.value}
          description={kpiCards.pendingActivities.description}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
          trend={kpiCards.pendingActivities.trend}
          staggerIndex={5}
        />

        <StatMetricCard
          title="Promedio General"
          value={kpiCards.overallAverage.value}
          suffix="/100"
          description={kpiCards.overallAverage.description}
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600 border-rose-200"
          trend={kpiCards.overallAverage.trend}
          staggerIndex={6}
        />
      </div>

      {/* ROW 1: EVOLUCIÓN HISTÓRICA (ÁREA/LÍNEA) + ESTADO DE ENTREGAS (DONUT) + INDICADOR META (GAUGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Line / Area Trend Chart (7 Cols) */}
        <div className="lg:col-span-7">
          <InteractiveLineAreaChart
            title="Evolución de Resultados por Semana y Mes"
            description="Progreso temporal del rendimiento académico, retención conceptual y volumen de tareas"
            data={filterPeriod === 'month' ? analytics.evolutionMonthly : analytics.evolutionWeekly}
            series={[
              {
                key: 'rendimiento',
                label: 'Calificaciones',
                color: '#6366f1',
                fillGradientFrom: '#6366f1',
                fillGradientTo: '#818cf8',
              },
              {
                key: 'retencion',
                label: 'Aprendizaje Real',
                color: '#10b981',
                fillGradientFrom: '#10b981',
                fillGradientTo: '#34d399',
              },
              {
                key: 'entregas',
                label: 'Volumen Entregas',
                color: '#f59e0b',
                fillGradientFrom: '#f59e0b',
                fillGradientTo: '#fbbf24',
              },
            ]}
            height={280}
            unit=" pts"
            periodOptions={[
              { id: 'week', label: 'Semanal' },
              { id: 'month', label: 'Mensual' },
            ]}
            activePeriod={filterPeriod === 'month' ? 'month' : 'week'}
            onPeriodChange={(p) => setFilterPeriod(p as any)}
          />
        </div>

        {/* Donut Chart: Actividades Completadas y Pendientes (3 Cols) */}
        <div className="lg:col-span-3">
          <InteractiveDonutChart
            title="Estado de Actividades"
            description="Completadas vs pendientes y en proceso"
            data={submissionStatusData}
            centerLabel="Entregas"
            size={180}
          />
        </div>

        {/* Goal Indicator Gauge Card (2 Cols) */}
        <div className="lg:col-span-2">
          <InteractiveGaugeCard
            title="Meta de Retención"
            subtitle="Validación contra adivinanza azarosa"
            value={analytics.kpiCards.overallAverage.value}
            target={85}
            unit="%"
          />
        </div>
      </div>

      {/* ROW 2: RENDIMIENTO ACADÉMICO POR ESTUDIANTE (BARRAS) + PARTICIPACIÓN POR SECCIÓN (BARRAS HORIZONTALES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Rendimiento por Estudiante (7 Cols) */}
        <div className="lg:col-span-7">
          <InteractiveBarChart
            title="Rendimiento Académico por Estudiante"
            description="Comparativa individual de calificaciones certificadas vs dominio conceptual demostrado. Haz clic en una barra para inspeccionar detalles."
            data={studentBarData}
            series={[
              {
                key: 'promedio',
                label: 'Calificación Oficial',
                color: '#6366f1',
                gradientFrom: '#6366f1',
                gradientTo: '#4f46e5',
              },
              {
                key: 'aprendizajeReal',
                label: 'Aprendizaje Real Validado',
                color: '#10b981',
                gradientFrom: '#10b981',
                gradientTo: '#059669',
              },
            ]}
            height={290}
            unit=" pts"
            maxValue={100}
            onSelectBar={(point) => {
              const std = analytics.studentPerformance.find((s) => s.id === point.id);
              if (std) {
                audio.playPop();
                setSelectedStudentDetail(std);
              }
            }}
            selectedBarId={selectedStudentDetail?.id}
          />
        </div>

        {/* Horizontal Bar Chart: Participación de los Estudiantes por Sección (5 Cols) */}
        <div className="lg:col-span-5">
          <InteractiveHorizontalBarChart
            title="Participación de Estudiantes por Sección"
            description="Porcentaje de alumnos matriculados que han realizado actividades en plataforma"
            items={sectionRankingItems}
            unit="%"
            showRanking={true}
            onSelectItem={(item) => {
              audio.playPop();
              setFilterSectionId(item.id);
            }}
            selectedItemId={filterSectionId}
          />
        </div>
      </div>

      {/* INSPECTOR CARD: If an individual student was selected */}
      {selectedStudentDetail && (
        <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm animate-in slide-in-from-top-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-indigo-200">
              {selectedStudentDetail.avatarIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-indigo-900 font-fun">
                  Ficha Detallada del Estudiante
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-800 border border-indigo-200">
                  Grado {selectedStudentDetail.grade}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 font-fun">
                {selectedStudentDetail.fullName}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {selectedStudentDetail.email}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-fun">
                Promedio
              </span>
              <span className="text-base font-black font-mono text-indigo-700">
                {selectedStudentDetail.averageGrade}/100
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-fun">
                Aprendizaje Real
              </span>
              <span className="text-base font-black font-mono text-emerald-600">
                {selectedStudentDetail.realLearningScore}%
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-fun">
                Tareas Listas
              </span>
              <span className="text-base font-black font-mono text-slate-800">
                {selectedStudentDetail.activitiesCompleted}
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block font-fun">
                Pendientes
              </span>
              <span className="text-base font-black font-mono text-amber-600">
                {selectedStudentDetail.activitiesPending}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudentDetail(null)}
              className="px-3 py-2 bg-indigo-200/80 hover:bg-indigo-300 text-indigo-900 rounded-xl text-xs font-bold font-fun transition cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* ROW 3: COMPARACIÓN DEL RENDIMIENTO ENTRE SECCIONES (CROSS-SUBJECT MATRIX) */}
      <InteractiveSectionComparison
        title="Comparación del Rendimiento entre Secciones"
        description="Analiza y compara el rendimiento académico de cada sección por materia curricular o promedio global"
        sectionsData={analytics.sectionAverages}
        onSelectSection={(secId) => {
          audio.playPop();
          setFilterSectionId(secId);
        }}
      />

      {/* ROW 4: ACTIVIDADES MÁS UTILIZADAS (RANKING) + ESTUDIANTES CON ACTIVIDADES PENDIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Utilized Activities (7 Cols) */}
        <div className="lg:col-span-7">
          <InteractiveHorizontalBarChart
            title="Actividades más Utilizadas"
            description="Ranking de actividades pedagógicas con mayor volumen de entregas y participación estudiantil"
            items={activityRankingItems}
            unit=" entregas"
            showRanking={true}
          />
        </div>

        {/* Students With Pending Activities (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-fun flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Estudiantes con Actividades Pendientes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alumnos que requieren revisión pedagógica o retroalimentación formativa
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {analytics.studentsNeedingAttention.length} alumnos
              </span>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
              {analytics.studentsNeedingAttention.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  ¡Excelente! Todos los estudiantes están al día con sus entregas.
                </div>
              ) : (
                analytics.studentsNeedingAttention.map((std) => (
                  <div
                    key={std.id}
                    onClick={() => {
                      audio.playPop();
                      setSelectedStudentDetail(std);
                    }}
                    className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/80 transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {std.avatarIcon}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-fun">
                          {std.fullName}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Grado {std.grade} • Promedio: {std.averageGrade} pts
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold font-fun px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 inline-block">
                        {std.activitiesPending} pendiente{std.activitiesPending > 1 ? 's' : ''}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        {std.activitiesCompleted} entregadas
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: ADMINISTRADOR - CRECIMIENTO DE USUARIOS REGISTRADOS Y ACTIVIDAD GENERAL */}
      {currentUser.role === 'admin' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 font-fun">
                Módulo Exclusivo de Administración
              </span>
              <h3 className="text-sm font-black text-slate-900 font-fun mt-0.5">
                Crecimiento Histórico de Usuarios y Actividad General de la Plataforma
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evolución de matriculación acumulada de estudiantes y profesores registrados
              </p>
            </div>
          </div>

          <InteractiveLineAreaChart
            title="Crecimiento de Usuarios Registrados"
            data={analytics.userGrowthTimeline}
            series={[
              {
                key: 'total',
                label: 'Usuarios Totales',
                color: '#6366f1',
                fillGradientFrom: '#6366f1',
                fillGradientTo: '#a5b4fc',
              },
              {
                key: 'estudiantes',
                label: 'Estudiantes',
                color: '#0284c7',
                fillGradientFrom: '#0284c7',
                fillGradientTo: '#7dd3fc',
              },
              {
                key: 'profesores',
                label: 'Cuerpo Docente',
                color: '#f59e0b',
                fillGradientFrom: '#f59e0b',
                fillGradientTo: '#fde68a',
              },
            ]}
            height={220}
            unit=" usuarios"
          />
        </div>
      )}
    </div>
  );
};
