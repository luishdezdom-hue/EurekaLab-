import React, { useState } from 'react';
import { Student } from '../types';
import { Avatar3D } from './Avatar3D';
import { audio } from '../services/audioService';
import { LearningIslandMap } from './LearningIslandMap';
import { WorldMap3D } from './3d/WorldMap3D';
import { GameButton } from './ui/GameButton';
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Heart,
  TrendingUp,
  BrainCircuit,
  Lock,
  Flame,
  Zap,
  MapPin,
  LayoutGrid,
  Award,
  CheckCircle2,
  Compass,
  Mountain,
} from 'lucide-react';

interface LearningIslandHomeProps {
  student: Student;
  onSelectTab: (tab: 'home' | 'character' | 'math' | 'code' | 'reading', levelId?: number) => void;
  onOpenStore: () => void;
  onOpenParentPanel: () => void;
  onStudentUpdated?: () => void;
}

export const LearningIslandHome: React.FC<LearningIslandHomeProps> = ({
  student,
  onSelectTab,
  onOpenStore,
  onOpenParentPanel,
  onStudentUpdated,
}) => {
  const [viewMode, setViewMode] = useState<'world3d' | 'map' | 'cards'>('world3d');

  // Gamification stats calculation
  const totalMissionsCompleted = student.history.filter((h) => h.completed).length;
  const playerLevel = Math.max(
    1,
    Math.floor((student.coins + totalMissionsCompleted * 50) / 100) + 1
  );
  const currentXp = (student.coins * 3) % 100;
  const nextLevelXp = 100;

  return (
    <div className="w-full space-y-6">
      {/* Hero Welcome Banner with 3D Avatar, Gamer HUD, Level and Real Learning Metrics */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-3 border-white/90 bg-white/90 backdrop-blur-md p-5 sm:p-7 transition-all duration-300">
        {/* Soft background light glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Greeting & Real Learning Metrics */}
          <div className="lg:col-span-7 space-y-4">
            {/* Gamer Status Bar (Level, Streak, School Grade) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-sky-600 text-white text-xs font-fun font-bold shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Nivel {playerLevel} • Explorador Arrecife</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-fun font-bold shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Racha 3 días</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold">
                <span>🌊 Grado {student.grade} de Primaria</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-sky-950 font-fun leading-tight">
              ¡Bienvenido al arrecife del saber,{' '}
              <span className="text-sky-600 underline decoration-amber-400 decoration-wavy decoration-2">
                {student.name}
              </span>!
            </h1>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed font-medium">
              Aprende física, fracciones y lógica computacional resolviendo desafíos reales en islas interactivas.
            </p>

            {/* XP Level Bar */}
            <div className="bg-sky-50/90 rounded-2xl p-3 border border-sky-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-sky-950">
                <span className="flex items-center gap-1 font-fun">
                  <span>Progreso de Nivel</span>
                  <span className="text-[10px] text-sky-600 font-normal">({currentXp}/{nextLevelXp} XP)</span>
                </span>
                <span className="text-sky-700 font-mono text-[11px]">{Math.round((currentXp / nextLevelXp) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-sky-200 rounded-full overflow-hidden p-0.5 border border-sky-300/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.max(10, Math.min((currentXp / nextLevelXp) * 100, 100))}%` }}
                />
              </div>
            </div>

            {/* Real Learning Mastery Cards (Single elevation, 3D soft feel) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div className="bg-gradient-to-b from-white to-emerald-50/60 p-3 rounded-2xl border-2 border-emerald-200/90 shadow-sm text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
                  Aprendizaje Real
                </span>
                <span className="text-lg sm:text-2xl font-black font-fun text-emerald-600">
                  {student.totalLearningScore}%
                </span>
                <span className="text-[9px] text-emerald-700/80 block mt-0.5 font-bold">
                  Sin adivinanzas
                </span>
              </div>

              <div className="bg-gradient-to-b from-white to-amber-50/60 p-3 rounded-2xl border-2 border-amber-200/90 shadow-sm text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">
                  Eurekas
                </span>
                <span className="text-lg sm:text-2xl font-black font-fun text-amber-600 flex items-center justify-center gap-1">
                  <span>{student.coins}</span>
                  <span className="text-base animate-float-bob">🪙</span>
                </span>
                <span className="text-[9px] text-amber-700/80 block mt-0.5 font-bold">
                  Monedas ganadas
                </span>
              </div>

              <div className="bg-gradient-to-b from-white to-purple-50/60 p-3 rounded-2xl border-2 border-purple-200/90 shadow-sm text-center">
                <span className="text-[10px] font-bold text-purple-800 uppercase block tracking-wider">
                  Misiones Éxito
                </span>
                <span className="text-lg sm:text-2xl font-black font-fun text-purple-600">
                  {totalMissionsCompleted}
                </span>
                <span className="text-[9px] text-purple-700/80 block mt-0.5 font-bold">
                  Completadas
                </span>
              </div>
            </div>

            {/* Tactile Game Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <GameButton
                variant="accent"
                size="md"
                onClick={onOpenStore}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                <span>Vestir Avatar 3D</span>
              </GameButton>

              <GameButton
                variant="secondary"
                size="md"
                onClick={onOpenParentPanel}
                icon={<Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />}
              >
                <span>Portal Familiar</span>
              </GameButton>
            </div>
          </div>

          {/* Right Hero 3D Avatar (Interactive 3D Three.js canvas) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-sky-100/70 via-white/80 to-sky-50/70 rounded-3xl p-5 border-2 border-sky-200 shadow-inner min-h-[280px]">
            <Avatar3D
              avatarConfig={student.avatar}
              interactive={true}
              size="lg"
            />
            <div className="mt-2 text-center">
              <span className="text-xs font-fun font-bold text-sky-900 block">
                {student.name} {student.lastName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                ¡Haz clic y arrastra para rotar en 3D!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Header with View Mode Switch: 🏔️ Mundo 3D vs 🏝️ Arrecife vs 📋 Tarjetas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-fun flex items-center gap-2">
            <span>🗺️</span> Exploración y Aventuras 3D
          </h2>
          <p className="text-xs sm:text-sm text-sky-900 font-medium">
            Recorre el mundo 3D en la montaña, el archipiélago de nodos o elige por tarjetas.
          </p>
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-2xl border-2 border-sky-200 shadow-sm">
          <button
            onClick={() => {
              audio.playPop();
              setViewMode('world3d');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'world3d'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50'
            }`}
          >
            <Mountain className="w-4 h-4" />
            <span>Mundo 3D Montaña</span>
          </button>

          <button
            onClick={() => {
              audio.playPop();
              setViewMode('map');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Nodos Arrecife</span>
          </button>

          <button
            onClick={() => {
              audio.playPop();
              setViewMode('cards');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tarjetas</span>
          </button>
        </div>
      </div>

      {/* 
        VIEW 1: Interactive 3D Adventure World Map (Mountains, Snow, River, Forest, 10 Levels & Castle)
      */}
      {viewMode === 'world3d' ? (
        <WorldMap3D
          student={student}
          onSelectTab={onSelectTab}
          onStudentUpdated={onStudentUpdated}
        />
      ) : viewMode === 'map' ? (
        /* VIEW 2: Circular Node Map */
        <LearningIslandMap
          student={student}
          onSelectTab={onSelectTab}
          onOpenStore={onOpenStore}
        />
      ) : (
        /* VIEW 3: 3 Educational Subject Cards with 3D Depth */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Island 1: Matemáticas - Balanza de Fracciones */}
          <div className="group relative bg-white/95 backdrop-blur-md border-3 border-emerald-300 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                ⚖️
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block">
                  Módulo 1 • Matemáticas
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-fun mt-0.5">
                  Balanza de Fracciones
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                  Equilibra platos virtuales agregando medios, cuartos y octavos. Aprende física y proporciones con feedback instantáneo.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs">
                <div className="flex justify-between font-bold text-emerald-950 mb-1">
                  <span>Nivel Desbloqueado:</span>
                  <span className="font-mono text-emerald-700 font-bold">Nivel {student.progress.matematicas} de 6</span>
                </div>
                <div className="w-full h-2.5 bg-emerald-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((student.progress.matematicas / 6) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <GameButton
                variant="math"
                size="md"
                fullWidth
                onClick={() => onSelectTab('math')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                <span>Explorar Balanza</span>
              </GameButton>
            </div>
          </div>

          {/* Island 2: Algoritmos - Cuadrícula Espacial */}
          <div className="group relative bg-white/95 backdrop-blur-md border-3 border-sky-300 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                🚀
              </div>

              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wide block">
                  Módulo 2 • Computación
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-fun mt-0.5">
                  Algoritmos en Cuadrícula
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                  Programa tu nave espacial con comandos de giros y avance paso a paso. Esquiva asteroides y recolecta gemas de energía.
                </p>
              </div>

              <div className="p-3 bg-sky-50/80 rounded-2xl border border-sky-200 text-xs">
                <div className="flex justify-between font-bold text-sky-950 mb-1">
                  <span>Misión Desbloqueada:</span>
                  <span className="font-mono text-sky-700 font-bold">Misión {student.progress.algoritmos} de 10</span>
                </div>
                <div className="w-full h-2.5 bg-sky-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((student.progress.algoritmos / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <GameButton
                variant="code"
                size="md"
                fullWidth
                onClick={() => onSelectTab('code')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                <span>Programar Nave</span>
              </GameButton>
            </div>
          </div>

          {/* Island 3: Comprensión Lectora y Audio HD */}
          <div className="group relative bg-white/95 backdrop-blur-md border-3 border-rose-300 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-500 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                📖
              </div>

              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide block">
                  Módulo 3 • Comunicación
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-fun mt-0.5">
                  Lectura y Audición HQ
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                  Narraciones en alta fidelidad y preguntas analíticas que miden si realmente comprendiste la historia o solo intentas adivinar.
                </p>
              </div>

              <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs">
                <div className="flex justify-between font-bold text-rose-950 mb-1">
                  <span>Lectura Desbloqueada:</span>
                  <span className="font-mono text-rose-700 font-bold">Lectura {student.progress.lectura} de 3</span>
                </div>
                <div className="w-full h-2.5 bg-rose-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((student.progress.lectura / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <GameButton
                variant="reading"
                size="md"
                fullWidth
                onClick={() => onSelectTab('reading')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                <span>Iniciar Lectura</span>
              </GameButton>
            </div>
          </div>
        </div>
      )}

      {/* Daily Quests / Misiones Diarias del Gremio */}
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-5 border-2 border-sky-200/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-fun font-bold text-sky-950 text-base sm:text-lg">
              Misiones Diarias del Explorador
            </h3>
          </div>
          <span className="text-xs font-fun font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
            Reinicia en 12h
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-emerald-50 to-white p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                ⚖️ Equilibra 1 Balanza
              </span>
              <span className="text-[11px] text-emerald-700 font-mono font-bold">+25 🪙 Eurekas</span>
            </div>
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              ✓
            </span>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-white p-3 rounded-2xl border border-sky-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                🚀 Programa 1 Nave espacial
              </span>
              <span className="text-[11px] text-sky-700 font-mono font-bold">+35 🪙 Eurekas</span>
            </div>
            <span className="text-xs text-sky-600 font-bold">En curso</span>
          </div>

          <div className="bg-gradient-to-r from-rose-50 to-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                📖 Comprensión sin errores
              </span>
              <span className="text-[11px] text-rose-700 font-mono font-bold">+50 🪙 Eurekas</span>
            </div>
            <span className="text-xs text-slate-400 font-bold">0/1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
