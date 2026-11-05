/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, NavigationSection } from '../../types';
import { audio } from '../../services/audioService';
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  BrainCircuit,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  UserCheck,
  Scale,
  Grid,
  BookOpen,
  Waves,
  Cpu,
} from 'lucide-react';
import { StatMetricCard } from '../charts/StatMetricCard';
import { InteractiveBarChart } from '../charts/InteractiveBarChart';
import { InteractiveGaugeCard } from '../charts/InteractiveGaugeCard';

interface StatsSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onOpenTeacherPanel: () => void;
  onOpenParentPanel: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  student,
  onNavigate,
  onOpenTeacherPanel,
  onOpenParentPanel,
}) => {
  const totalMissionsCompleted = student.history.filter((h) => h.completed).length;
  const totalTimeMinutes = Math.round(
    student.history.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0) / 60
  );
  const totalHints = student.history.reduce((acc, curr) => acc + (curr.hintsUsed || 0), 0);

  // Subject averages
  const mathHistory = student.history.filter((h) => h.subject === 'matematicas');
  const codeHistory = student.history.filter((h) => h.subject === 'algoritmos');
  const readingHistory = student.history.filter((h) => h.subject === 'lectura');
  const scienceHistory = student.history.filter((h) => h.subject === 'ciencias');
  const circuitsHistory = student.history.filter((h) => h.subject === 'circuitos');

  const mathAvgMastery =
    mathHistory.length > 0
      ? Math.round(mathHistory.reduce((a, b) => a + b.realLearningMastery, 0) / mathHistory.length)
      : 85;

  const codeAvgMastery =
    codeHistory.length > 0
      ? Math.round(codeHistory.reduce((a, b) => a + b.realLearningMastery, 0) / codeHistory.length)
      : 80;

  const readingAvgMastery =
    readingHistory.length > 0
      ? Math.round(readingHistory.reduce((a, b) => a + b.realLearningMastery, 0) / readingHistory.length)
      : 90;

  const scienceAvgMastery =
    scienceHistory.length > 0
      ? Math.round(scienceHistory.reduce((a, b) => a + b.realLearningMastery, 0) / scienceHistory.length)
      : 88;

  const circuitsAvgMastery =
    circuitsHistory.length > 0
      ? Math.round(circuitsHistory.reduce((a, b) => a + b.realLearningMastery, 0) / circuitsHistory.length)
      : 86;

  // Bar chart data for the 5 subjects
  const subjectsBarData = [
    {
      id: 'matematicas',
      label: 'Matemáticas',
      sublabel: `Nivel ${student.progress.matematicas}/6`,
      values: {
        maestria: mathAvgMastery,
      },
    },
    {
      id: 'algoritmos',
      label: 'Algoritmos',
      sublabel: `Nivel ${student.progress.algoritmos}/6`,
      values: {
        maestria: codeAvgMastery,
      },
    },
    {
      id: 'lectura',
      label: 'Lectura',
      sublabel: `Nivel ${student.progress.lectura || 1}/6`,
      values: {
        maestria: readingAvgMastery,
      },
    },
    {
      id: 'ciencias',
      label: 'Ciencias',
      sublabel: `Nivel ${student.progress.ciencias || 1}/6`,
      values: {
        maestria: scienceAvgMastery,
      },
    },
    {
      id: 'circuitos',
      label: 'Circuitos',
      sublabel: `Nivel ${student.progress.circuitos || 1}/6`,
      values: {
        maestria: circuitsAvgMastery,
      },
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-indigo-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-sky-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 font-fun block">
                Sección 11 • Analíticas Formativas
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-300">
                Evidencia de Aprendizaje Real
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Estadísticas y Progreso
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Monitoreo objetivo de tus competencias conceptuales, tiempo dedicado y autonomía en el aprendizaje.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenParentPanel}
            className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-900 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <span>👨‍👩‍👧 Portal Familiar</span>
          </button>

          <button
            type="button"
            onClick={onOpenTeacherPanel}
            className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Docente (PIN)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playPop();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard
          title="Dominio Real Global"
          value={student.totalLearningScore}
          suffix="%"
          description="Comprensión conceptual demostrada"
          icon={<BrainCircuit className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200"
          trend={{ value: 4.2, isPositive: true, label: 'vs intentos iniciales' }}
        />

        <StatMetricCard
          title="Misiones Superadas"
          value={totalMissionsCompleted}
          description="En 5 asignaturas exploradas"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          trend={{ value: 12.0, isPositive: true, label: 'Actividad sostenida' }}
        />

        <StatMetricCard
          title="Monedas Eurekas"
          value={student.coins}
          suffix="🪙"
          description="Por logros y méritos científicos"
          icon={<Award className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
          trend={{ value: 25.0, isPositive: true, label: 'Monedas acumuladas' }}
        />

        <StatMetricCard
          title="Tiempo de Estudio"
          value={totalTimeMinutes}
          suffix=" min"
          description={`Pistas utilizadas: ${totalHints}`}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600 border-sky-200"
          trend={{ value: 8.5, isPositive: true, label: 'Dedicación formativa' }}
        />
      </div>

      {/* Visual Charts: Subject Mastery Bar Chart + Goal Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <InteractiveBarChart
            title="Dominio Conceptual por Asignatura"
            description="Porcentaje de maestría real alcanzado en cada disciplina. Pasa el cursor para ver el nivel actual."
            data={subjectsBarData}
            series={[
              {
                key: 'maestria',
                label: 'Maestría Conceptual Real',
                color: '#6366f1',
                gradientFrom: '#6366f1',
                gradientTo: '#4338ca',
              },
            ]}
            height={260}
            unit="%"
            maxValue={100}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between">
          <InteractiveGaugeCard
            title="Meta de Certificación"
            subtitle="Porcentaje requerido para insignia de Explorador Maestro"
            value={student.totalLearningScore}
            target={85}
            unit="%"
          />
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        <h3 className="font-fun font-bold text-lg text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <span>Historial Reciente de Misiones y Aprendizaje</span>
        </h3>

        {student.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider font-fun">
                <tr>
                  <th className="py-2.5 px-3">Asignatura</th>
                  <th className="py-2.5 px-3">Nivel</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Puntaje</th>
                  <th className="py-2.5 px-3">Dominio Real</th>
                  <th className="py-2.5 px-3">Tiempo</th>
                  <th className="py-2.5 px-3">Pistas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.history.slice(-8).map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold capitalize text-slate-900 font-fun">
                      {record.subject}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">Nivel {record.level}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{record.lastAttemptDate}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-indigo-700">
                      {record.score}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                        {record.realLearningMastery}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{record.timeSpentSeconds}s</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{record.hintsUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center font-medium">
            Aún no has completado misiones registradas. ¡Inicia en los juegos o en el mundo 3D!
          </p>
        )}
      </div>
    </div>
  );
};
