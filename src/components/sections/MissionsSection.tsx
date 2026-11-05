/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, NavigationSection } from '../../types';
import { audio } from '../../services/audioService';
import {
  Target,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Zap,
  Flame,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

interface MissionsSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onPlayMission?: (subject: 'math' | 'code' | 'reading', levelId: number) => void;
  onStudentUpdated: () => void;
}

interface MissionItem {
  id: string;
  category: 'daily' | 'weekly' | 'subject';
  subject: 'math' | 'code' | 'reading';
  levelId: number;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  currentProgress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
}

export const MissionsSection: React.FC<MissionsSectionProps> = ({
  student,
  onNavigate,
  onPlayMission,
  onStudentUpdated,
}) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'subject'>('all');

  // Compute missions state based on student history and levels
  const mathDone = student.history.filter((h) => h.subject === 'matematicas' && h.completed).length;
  const codeDone = student.history.filter((h) => h.subject === 'algoritmos' && h.completed).length;
  const readDone = student.history.filter((h) => h.subject === 'lectura' && h.completed).length;

  const missions: MissionItem[] = [
    {
      id: 'm_daily_1',
      category: 'daily',
      subject: 'math',
      levelId: Math.min(6, student.progress.matematicas),
      title: 'Equilibrio Fraccionario Diario',
      description: 'Equilibra una balanza fraccionaria sin usar pistas conceptuales.',
      rewardCoins: 20,
      rewardXp: 30,
      currentProgress: mathDone >= 1 ? 1 : 0,
      maxProgress: 1,
      completed: mathDone >= 1,
      claimed: false,
    },
    {
      id: 'm_daily_2',
      category: 'daily',
      subject: 'code',
      levelId: Math.min(6, student.progress.algoritmos),
      title: 'Ruta Eficiente Diaria',
      description: 'Programa una nave en la cuadrícula espacial alcanzando la meta.',
      rewardCoins: 20,
      rewardXp: 30,
      currentProgress: codeDone >= 1 ? 1 : 0,
      maxProgress: 1,
      completed: codeDone >= 1,
      claimed: false,
    },
    {
      id: 'm_daily_3',
      category: 'daily',
      subject: 'reading',
      levelId: Math.min(6, student.progress.lectura),
      title: 'Explorador Literario Diario',
      description: 'Lee un texto abisal y responde correctamente la pregunta inferencial.',
      rewardCoins: 20,
      rewardXp: 30,
      currentProgress: readDone >= 1 ? 1 : 0,
      maxProgress: 1,
      completed: readDone >= 1,
      claimed: false,
    },
    {
      id: 'm_weekly_1',
      category: 'weekly',
      subject: 'math',
      levelId: student.progress.matematicas,
      title: 'Maestría de Cuartos y Octavos',
      description: 'Supera 3 niveles de matemáticas con puntuación de maestría superior a 80%.',
      rewardCoins: 60,
      rewardXp: 100,
      currentProgress: Math.min(3, mathDone),
      maxProgress: 3,
      completed: mathDone >= 3,
      claimed: false,
    },
    {
      id: 'm_weekly_2',
      category: 'weekly',
      subject: 'code',
      levelId: student.progress.algoritmos,
      title: 'Arquitecto de Bucles y Secuencias',
      description: 'Completa 3 misiones de algoritmos utilizando el menor número de bloques.',
      rewardCoins: 60,
      rewardXp: 100,
      currentProgress: Math.min(3, codeDone),
      maxProgress: 3,
      completed: codeDone >= 3,
      claimed: false,
    },
    {
      id: 'm_subject_1',
      category: 'subject',
      subject: 'math',
      levelId: student.progress.matematicas,
      title: 'Desafío del Gran Arrecife Matemático',
      description: `Alcanza el nivel ${student.progress.matematicas + 1} en Balanza de Fracciones.`,
      rewardCoins: 40,
      rewardXp: 60,
      currentProgress: Math.min(student.progress.matematicas, 6),
      maxProgress: 6,
      completed: student.progress.matematicas >= 6,
      claimed: false,
    },
  ];

  const handleClaimReward = (mission: MissionItem) => {
    if (!mission.completed || mission.claimed) return;

    audio.playRewardClaim();
    student.coins += mission.rewardCoins;
    mission.claimed = true;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#0284c7'],
    });

    onStudentUpdated();
  };

  const filteredMissions =
    filter === 'all' ? missions : missions.filter((m) => m.category === filter);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-amber-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-fun block">
              Sección 5 • Objetivos y Misiones
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-fun text-slate-900 tracking-tight">
              Registro de Misiones de EDUQUEST
            </h1>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span>← Volver a Inicio</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Todas las Misiones', icon: '🌟' },
          { id: 'daily', label: 'Misiones Diarias', icon: '📅' },
          { id: 'weekly', label: 'Misiones Semanales', icon: '📆' },
          { id: 'subject', label: 'Misiones por Materia', icon: '📚' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              audio.playPop();
              setFilter(tab.id as 'all' | 'daily' | 'weekly' | 'subject');
            }}
            className={`px-3.5 py-2 rounded-2xl font-fun font-bold text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 -translate-y-0.5'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Missions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.map((mission) => {
          const progressPercent = Math.min(
            100,
            Math.round((mission.currentProgress / mission.maxProgress) * 100)
          );

          return (
            <div
              key={mission.id}
              className={`bg-white/95 backdrop-blur-md rounded-3xl p-5 border-2 shadow-md flex flex-col justify-between gap-4 transition-all duration-200 ${
                mission.completed
                  ? 'border-emerald-300 shadow-emerald-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold font-fun uppercase px-2.5 py-1 rounded-full ${
                      mission.category === 'daily'
                        ? 'bg-sky-100 text-sky-800'
                        : mission.category === 'weekly'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {mission.category === 'daily'
                      ? 'Diaria'
                      : mission.category === 'weekly'
                      ? 'Semanal'
                      : 'Por Materia'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-mono font-black text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-lg">
                      <span>🪙</span> +{mission.rewardCoins}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono font-black text-sky-900 bg-sky-100/70 px-2 py-0.5 rounded-lg">
                      <span>⚡</span> +{mission.rewardXp} XP
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-fun font-black text-slate-900 text-base">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    {mission.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-fun font-bold text-slate-600">
                    <span>Progreso:</span>
                    <span className="font-mono">
                      {mission.currentProgress} / {mission.maxProgress} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        mission.completed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                {mission.completed ? (
                  mission.claimed ? (
                    <span className="text-xs font-fun font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Reclamada
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(mission)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fun font-black text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>¡Reclamar Recompensa!</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      audio.playPop();
                      if (onPlayMission) {
                        onPlayMission(mission.subject, mission.levelId);
                      } else {
                        onNavigate('games');
                      }
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Jugar Misión</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
