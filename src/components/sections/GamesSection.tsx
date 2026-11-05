/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../../types';
import { MathScaleGame } from '../MathScaleGame';
import { AlgorithmGridGame } from '../AlgorithmGridGame';
import { ReadingComprehensionGame } from '../ReadingComprehensionGame';
import { MarineEcosystemGame } from '../MarineEcosystemGame';
import { SubmarineLogicGame } from '../SubmarineLogicGame';
import { FriendlyDuelArena } from '../FriendlyDuelArena';
import { audio } from '../../services/audioService';
import {
  Gamepad2,
  ArrowLeft,
  Scale,
  Grid,
  BookOpen,
  Play,
  Trophy,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Flame,
  Waves,
  Cpu,
  Swords,
} from 'lucide-react';

export type GameType = 'math' | 'code' | 'reading' | 'science' | 'circuits' | 'duel';

interface GamesSectionProps {
  student: Student;
  initialGame?: GameType | null;
  initialLevelId?: number;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({
  student,
  initialGame = null,
  initialLevelId,
  onNavigate,
  onStudentUpdated,
}) => {
  const [activeGame, setActiveGame] = useState<GameType | null>(initialGame);
  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(initialLevelId);
  const [gameFilter, setGameFilter] = useState<'all' | GameType>('all');

  const handleLaunchGame = (gameType: GameType, levelId?: number) => {
    audio.playPop();
    setActiveGame(gameType);
    setSelectedLevelId(levelId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArcade = () => {
    audio.playPop();
    setActiveGame(null);
    setSelectedLevelId(undefined);
    onStudentUpdated();
  };

  // If a game is actively running, display it full screen with safe return navigation
  if (activeGame === 'math') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-emerald-200 shadow-md flex items-center justify-between">
          <button
            onClick={handleBackToArcade}
            className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Volver al Arcade de Juegos</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-fun font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ⚖️ Balanza de Fracciones
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-fun font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              🏠 Inicio
            </button>
          </div>
        </div>

        <MathScaleGame
          student={student}
          initialLevelId={selectedLevelId}
          onStudentUpdated={onStudentUpdated}
        />
      </div>
    );
  }

  if (activeGame === 'code') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-indigo-200 shadow-md flex items-center justify-between">
          <button
            onClick={handleBackToArcade}
            className="px-3.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Volver al Arcade de Juegos</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-fun font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              🚀 Algoritmos en Cuadrícula
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-fun font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              🏠 Inicio
            </button>
          </div>
        </div>

        <AlgorithmGridGame
          student={student}
          initialLevelId={selectedLevelId}
          onStudentUpdated={onStudentUpdated}
        />
      </div>
    );
  }

  if (activeGame === 'reading') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-amber-200 shadow-md flex items-center justify-between">
          <button
            onClick={handleBackToArcade}
            className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Volver al Arcade de Juegos</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-fun font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              📜 Templo de Comprensión
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-fun font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              🏠 Inicio
            </button>
          </div>
        </div>

        <ReadingComprehensionGame
          student={student}
          initialLevelId={selectedLevelId}
          onStudentUpdated={onStudentUpdated}
        />
      </div>
    );
  }

  if (activeGame === 'science') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-teal-200 shadow-md flex items-center justify-between">
          <button
            onClick={handleBackToArcade}
            className="px-3.5 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-900 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Volver al Arcade de Juegos</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-fun font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1">
              <span>🧪</span>
              <span>Laboratorio Bio-Marino</span>
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-fun font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              🏠 Inicio
            </button>
          </div>
        </div>

        <MarineEcosystemGame
          student={student}
          initialLevelId={selectedLevelId}
          onStudentUpdated={onStudentUpdated}
        />
      </div>
    );
  }

  if (activeGame === 'circuits') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-indigo-200 shadow-md flex items-center justify-between">
          <button
            onClick={handleBackToArcade}
            className="px-3.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Volver al Arcade de Juegos</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-fun font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
              <span>⚡</span>
              <span>Circuito Lógico Submarino</span>
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-fun font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              🏠 Inicio
            </button>
          </div>
        </div>

        <SubmarineLogicGame
          student={student}
          initialLevelId={selectedLevelId}
          onStudentUpdated={onStudentUpdated}
        />
      </div>
    );
  }

  if (activeGame === 'duel') {
    return (
      <FriendlyDuelArena
        student={student}
        onStudentUpdated={onStudentUpdated}
        onBackToArcade={handleBackToArcade}
      />
    );
  }

  // =========================================================================
  // ARCADE HUB: Standalone independent game selector
  // Requirement: "Los juegos deben tener su propio apartado y no deben estar mezclados con las lecciones"
  // =========================================================================
  const gamesList: {
    id: GameType;
    title: string;
    subject: string;
    desc: string;
    icon: string;
    color: string;
    unlockedLevel: number;
    totalLevels: number;
    bgClass: string;
    borderClass: string;
    badgeClass: string;
    btnClass: string;
  }[] = [
    {
      id: 'math',
      title: 'Balanza de Fracciones',
      subject: 'Matemáticas',
      desc: 'Manipula pesos visuales de 1/2, 1/4 y 1/8 en una balanza física en tiempo real para desbloquear cofres de gemas.',
      icon: '⚖️',
      color: 'emerald',
      unlockedLevel: student.progress.matematicas || 1,
      totalLevels: 6,
      bgClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderClass: 'border-emerald-300/80',
      badgeClass: 'bg-emerald-100 text-emerald-800',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      id: 'code',
      title: 'Algoritmos en Cuadrícula',
      subject: 'Programación',
      desc: 'Programa secuencias algorítmicas con comandos de avance y rotación para guiar tu nave espacial a la meta.',
      icon: '🚀',
      color: 'indigo',
      unlockedLevel: student.progress.algoritmos || 1,
      totalLevels: 6,
      bgClass: 'from-indigo-500/20 via-sky-500/10 to-transparent',
      borderClass: 'border-indigo-300/80',
      badgeClass: 'bg-indigo-100 text-indigo-800',
      btnClass: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'reading',
      title: 'Templo de Comprensión Lectora',
      subject: 'Comprensión de Textos',
      desc: 'Lee textos científicos marinos y responde preguntas inferenciales y críticas con narración por voz de alta fidelidad.',
      icon: '📜',
      color: 'amber',
      unlockedLevel: student.progress.lectura || 1,
      totalLevels: 6,
      bgClass: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderClass: 'border-amber-300/80',
      badgeClass: 'bg-amber-100 text-amber-800',
      btnClass: 'bg-amber-600 hover:bg-amber-700',
    },
    {
      id: 'science',
      title: 'Laboratorio Bio-Marino',
      subject: 'Ciencias Naturales & Ecología',
      desc: 'Investiga redes tróficas marinas, pirámides de transferencia energética y equilibrio biológico ante condiciones ambientales cambiantes.',
      icon: '🧪',
      color: 'teal',
      unlockedLevel: student.progress.ciencias || 1,
      totalLevels: 6,
      bgClass: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      borderClass: 'border-teal-300/80',
      badgeClass: 'bg-teal-100 text-teal-800',
      btnClass: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      id: 'circuits',
      title: 'Circuito Lógico Submarino',
      subject: 'Pensamiento Computacional & Lógica',
      desc: 'Repara los subsistemas de soporte vital y navegación del Nautilus combinando compuertas lógicas booleanas AND, OR, NOT y XOR.',
      icon: '⚡',
      color: 'purple',
      unlockedLevel: student.progress.circuitos || 1,
      totalLevels: 6,
      bgClass: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      borderClass: 'border-purple-300/80',
      badgeClass: 'bg-purple-100 text-purple-800',
      btnClass: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'duel',
      title: 'Duelo Amistoso en Vivo',
      subject: 'Multijugador en Tiempo Real',
      desc: 'Enfréntate en vivo a compañeros en desafíos de fracciones y lógica por puntos de experiencia adicionales (XP) y monedas Eureka.',
      icon: '⚔️',
      color: 'rose',
      unlockedLevel: 1,
      totalLevels: 5,
      bgClass: 'from-rose-500/25 via-amber-500/15 to-transparent',
      borderClass: 'border-rose-400',
      badgeClass: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
      btnClass: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600',
    },
  ];

  const filteredGames =
    gameFilter === 'all' ? gamesList : gamesList.filter((g) => g.id === gameFilter);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🎮
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 font-fun block">
              Sección 4 • Apartado Independiente
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-fun text-slate-900 tracking-tight">
              Arcade de Minijuegos Educativos
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
          { id: 'all', label: 'Todos los Juegos', icon: '🌟' },
          { id: 'duel', label: '⚔️ Duelo Amistoso (PvP)', icon: '⚔️' },
          { id: 'math', label: 'Matemáticas', icon: '⚖️' },
          { id: 'code', label: 'Programación', icon: '🚀' },
          { id: 'reading', label: 'Lectura', icon: '📜' },
          { id: 'science', label: 'Ciencias', icon: '🧪' },
          { id: 'circuits', label: 'Lógica & Circuitos', icon: '⚡' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              audio.playPop();
              setGameFilter(tab.id as 'all' | GameType);
            }}
            className={`px-3.5 py-2 rounded-2xl font-fun font-bold text-xs whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              gameFilter === tab.id
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 -translate-y-0.5'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Interactive Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game, index) => (
          <div
            key={game.id}
            className={`bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 ${game.borderClass} shadow-lg flex flex-col justify-between gap-4 card-interactive animate-slide-up stagger-${(index % 6) + 1} relative overflow-hidden group`}
          >
            {/* Soft gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-b ${game.bgClass} pointer-events-none`} />

            {/* Subtle light sheen effect on hover */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl filter drop-shadow-sm group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300 inline-block">
                  {game.icon}
                </span>
                <span className={`text-[11px] font-bold font-fun uppercase px-2.5 py-1 rounded-full shadow-2xs ${game.badgeClass}`}>
                  {game.subject}
                </span>
              </div>

              <div>
                <h3 className="font-fun font-black text-slate-900 text-lg sm:text-xl group-hover:text-indigo-900 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                  {game.desc}
                </p>
              </div>

              <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs font-fun font-bold text-slate-700 shadow-2xs group-hover:border-slate-300 transition-colors">
                <span>Nivel Desbloqueado:</span>
                <span className="font-mono text-sm font-black text-indigo-900">
                  Nivel {game.unlockedLevel} / {game.totalLevels}
                </span>
              </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-3">
              <button
                onClick={() => handleLaunchGame(game.id)}
                className={`flex-1 py-3 px-4 ${game.btnClass} text-white font-fun font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer`}
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Jugar Nivel Actual ({game.unlockedLevel})</span>
              </button>

              <button
                onClick={() => handleLaunchGame(game.id, 1)}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Elegir otro nivel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
