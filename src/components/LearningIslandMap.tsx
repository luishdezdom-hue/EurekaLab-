import React, { useState } from 'react';
import { Student } from '../types';
import { SCALE_MISSIONS, GRID_MISSIONS, READING_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { GameButton } from './ui/GameButton';
import {
  Check,
  Lock,
  Play,
  Sparkles,
  ArrowRight,
  Zap,
  RotateCcw,
  Compass,
  X,
  Star,
  Award,
} from 'lucide-react';

interface LearningIslandMapProps {
  student: Student;
  onSelectTab: (tab: 'home' | 'character' | 'math' | 'code' | 'reading', levelId?: number) => void;
  onOpenStore?: () => void;
}

type RealmId = 'matematicas' | 'algoritmos' | 'lectura';

interface LevelCircleNode {
  id: number;
  title: string;
  subtitle: string;
  xPercent: number; // 0-100% position on the map
  yPercent: number; // 0-100% position on the map
  rewardCoins: number;
  rewardXp: number;
  isBoss?: boolean;
}

export const LearningIslandMap: React.FC<LearningIslandMapProps> = ({
  student,
  onSelectTab,
}) => {
  const [activeRealm, setActiveRealm] = useState<RealmId>('matematicas');
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Current unlocked level for the active realm
  const unlockedLevel = student.progress[activeRealm];

  // 1. Matematicas: Balanza de Fracciones (6 levels)
  const mathLevels: LevelCircleNode[] = [
    {
      id: 1,
      title: 'El Despertar del Medio',
      subtitle: 'Medios y Cuartos',
      xPercent: 16,
      yPercent: 78,
      rewardCoins: 25,
      rewardXp: 50,
    },
    {
      id: 2,
      title: 'Tres Cuartos de Perla',
      subtitle: 'Fracciones Equivalentes',
      xPercent: 34,
      yPercent: 62,
      rewardCoins: 30,
      rewardXp: 75,
    },
    {
      id: 3,
      title: 'La Balanza Abisal',
      subtitle: 'Equilibrio de Fracciones',
      xPercent: 22,
      yPercent: 44,
      rewardCoins: 40,
      rewardXp: 100,
    },
    {
      id: 4,
      title: 'El Tesoro del Octavo',
      subtitle: 'Octavos y Medios',
      xPercent: 50,
      yPercent: 40,
      rewardCoins: 50,
      rewardXp: 125,
    },
    {
      id: 5,
      title: 'Pico de Proporciones',
      subtitle: 'Quintos y Décimos',
      xPercent: 74,
      yPercent: 48,
      rewardCoins: 60,
      rewardXp: 150,
    },
    {
      id: 6,
      title: 'Castillo Balanza',
      subtitle: 'Maestro de Proporciones',
      xPercent: 82,
      yPercent: 20,
      rewardCoins: 100,
      rewardXp: 250,
      isBoss: true,
    },
  ];

  // 2. Algoritmos: Navegación en Cuadrícula (10 levels)
  const algoLevels: LevelCircleNode[] = [
    {
      id: 1,
      title: 'Primeros Pasos',
      subtitle: 'Línea Recta',
      xPercent: 10,
      yPercent: 82,
      rewardCoins: 20,
      rewardXp: 40,
    },
    {
      id: 2,
      title: 'Giro Lateral',
      subtitle: 'Maniobra de Rotación',
      xPercent: 24,
      yPercent: 72,
      rewardCoins: 25,
      rewardXp: 60,
    },
    {
      id: 3,
      title: 'Primer Asteroide',
      subtitle: 'Esquivar Obstáculos',
      xPercent: 18,
      yPercent: 54,
      rewardCoins: 30,
      rewardXp: 80,
    },
    {
      id: 4,
      title: 'Zigzag Cósmico',
      subtitle: 'Ruta en Z',
      xPercent: 36,
      yPercent: 48,
      rewardCoins: 35,
      rewardXp: 90,
    },
    {
      id: 5,
      title: 'Pasillo Estrecho',
      subtitle: 'Espacio Reducido',
      xPercent: 48,
      yPercent: 64,
      rewardCoins: 40,
      rewardXp: 100,
    },
    {
      id: 6,
      title: 'Cinturón Rocoso',
      subtitle: 'Múltiples Asteroides',
      xPercent: 62,
      yPercent: 50,
      rewardCoins: 45,
      rewardXp: 110,
    },
    {
      id: 7,
      title: 'Laberinto Estelar',
      subtitle: 'Secuencia Compleja',
      xPercent: 50,
      yPercent: 30,
      rewardCoins: 50,
      rewardXp: 130,
    },
    {
      id: 8,
      title: 'Ruta de Hiperespacio',
      subtitle: 'Eficiencia de Bloques',
      xPercent: 70,
      yPercent: 32,
      rewardCoins: 60,
      rewardXp: 150,
    },
    {
      id: 9,
      title: 'Puerta Cuántica',
      subtitle: 'Desafío Avanzado',
      xPercent: 86,
      yPercent: 42,
      rewardCoins: 75,
      rewardXp: 180,
    },
    {
      id: 10,
      title: 'Estación Orbital',
      subtitle: 'Maestro Programador',
      xPercent: 82,
      yPercent: 16,
      rewardCoins: 120,
      rewardXp: 300,
      isBoss: true,
    },
  ];

  // 3. Lectura: Comprensión y Audición (3 levels)
  const readingLevels: LevelCircleNode[] = [
    {
      id: 1,
      title: 'El Arrecife Brillante',
      subtitle: 'Lectura Literal e Inferencia',
      xPercent: 22,
      yPercent: 72,
      rewardCoins: 30,
      rewardXp: 60,
    },
    {
      id: 2,
      title: 'El Secreto del Pulpo',
      subtitle: 'Análisis y Comprensión',
      xPercent: 50,
      yPercent: 46,
      rewardCoins: 45,
      rewardXp: 100,
    },
    {
      id: 3,
      title: 'La Leyenda Marina',
      subtitle: 'Juicio Crítico y Síntesis',
      xPercent: 78,
      yPercent: 24,
      rewardCoins: 70,
      rewardXp: 160,
      isBoss: true,
    },
  ];

  const currentLevelNodes =
    activeRealm === 'matematicas'
      ? mathLevels
      : activeRealm === 'algoritmos'
      ? algoLevels
      : readingLevels;

  const totalLevels = currentLevelNodes.length;
  const completedCount = Math.min(unlockedLevel - 1, totalLevels);
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  // Find the exact circle where the avatar must stand (clamped to available levels)
  const currentActiveNode =
    currentLevelNodes.find((n) => n.id === Math.min(unlockedLevel, totalLevels)) ||
    currentLevelNodes[0];

  // Active mission details for modal
  const activeMissionData = (() => {
    if (!selectedNodeId) return null;
    if (activeRealm === 'matematicas') {
      return SCALE_MISSIONS.find((m) => m.id === selectedNodeId) || SCALE_MISSIONS[0];
    }
    if (activeRealm === 'algoritmos') {
      return GRID_MISSIONS.find((m) => m.id === selectedNodeId) || GRID_MISSIONS[0];
    }
    return READING_MISSIONS.find((m) => m.id === selectedNodeId) || READING_MISSIONS[0];
  })();

  const handleStartMission = (levelId: number) => {
    const tabMap: Record<RealmId, 'math' | 'code' | 'reading'> = {
      matematicas: 'math',
      algoritmos: 'code',
      lectura: 'reading',
    };
    setSelectedNodeId(null);
    onSelectTab(tabMap[activeRealm], levelId);
  };

  const handleNodeClick = (node: LevelCircleNode) => {
    audio.playPop();
    setSelectedNodeId(node.id);
  };

  // Determine avatar icon from characterType
  const avatarEmoji =
    student.avatar.characterType === 'girl'
      ? '👧'
      : student.avatar.characterType === 'robot'
      ? '🤖'
      : '👦';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-3 border-white/95 bg-slate-900 select-none">
      {/* Top Map HUD Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950/85 backdrop-blur-md border-b border-white/15 text-white">
        {/* Realm Selector Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/15">
            <button
              onClick={() => {
                audio.playRegionExplore();
                audio.setRegion('reef');
                setActiveRealm('matematicas');
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeRealm === 'matematicas'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 -translate-y-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⚖️</span>
              <span className="hidden sm:inline">Arrecife</span> Matemático
            </button>

            <button
              onClick={() => {
                audio.playRegionExplore();
                audio.setRegion('lab');
                setActiveRealm('algoritmos');
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeRealm === 'algoritmos'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/30 -translate-y-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🚀</span>
              <span className="hidden sm:inline">Archipiélago</span> Algoritmos
            </button>

            <button
              onClick={() => {
                audio.playRegionExplore();
                audio.setRegion('ruins');
                setActiveRealm('lectura');
                setSelectedNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fun font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeRealm === 'lectura'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md shadow-rose-500/30 -translate-y-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>📖</span>
              <span className="hidden sm:inline">Isla</span> Lectura
            </button>
          </div>
        </div>

        {/* Top Right: Progress 4/7 Bar like in the screenshot */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
            <span className="font-fun font-bold text-xs sm:text-sm text-sky-200">
              {completedCount}/{totalLevels}
            </span>
            <div className="w-20 sm:w-28 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-300 hidden md:inline">
              {progressPercent}%
            </span>
          </div>

          <GameButton
            size="xs"
            variant="accent"
            onClick={() => handleStartMission(Math.min(unlockedLevel, totalLevels))}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            <span>Jugar Nv. {Math.min(unlockedLevel, totalLevels)}</span>
          </GameButton>
        </div>
      </div>

      {/* Main Interactive Game World Canvas (Landscape with Winding Level Path and Animated Avatar) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[460px] max-h-[640px] overflow-hidden select-none bg-gradient-to-b from-sky-900 via-sky-800 to-cyan-950">
        {/* Ocean waves and island landscape SVG background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="islandIslandGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#0d9488" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="pathUnlockedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Ocean water ripples */}
          <ellipse cx="50" cy="50" rx="46" ry="38" fill="url(#islandIslandGlow)" />
          <ellipse cx="20" cy="30" rx="14" ry="7" fill="#0284c7" opacity="0.25" />
          <ellipse cx="80" cy="70" rx="16" ry="8" fill="#0284c7" opacity="0.25" />

          {/* Tropical Island Landmasses (Terracotta beach, rolling hills, mountains, and fortress hill) */}
          {/* Main island base */}
          <path
            d="M 12 75 Q 8 60 16 46 Q 24 30 38 28 Q 55 24 70 20 Q 88 18 90 35 Q 92 55 84 72 Q 72 88 52 86 Q 30 84 12 75 Z"
            fill="#d97706"
            opacity="0.5"
            filter="url(#shadowFilter)"
          />
          {/* Sandy Shore */}
          <path
            d="M 14 73 Q 10 58 18 45 Q 26 31 40 29 Q 56 25 71 21 Q 87 20 88 36 Q 90 53 82 70 Q 70 85 50 84 Q 31 82 14 73 Z"
            fill="url(#sandGradient)"
            opacity="0.9"
          />
          {/* Lush Grass Plateaus */}
          <path
            d="M 18 70 Q 15 56 22 45 Q 28 34 42 32 Q 56 28 70 25 Q 83 24 84 38 Q 86 52 79 66 Q 67 80 48 79 Q 32 77 18 70 Z"
            fill="url(#grassGradient)"
            filter="url(#shadowFilter)"
          />

          {/* Central Cliff Terraces */}
          <path
            d="M 30 65 Q 26 50 36 42 Q 46 36 60 38 Q 72 40 70 54 Q 68 68 50 68 Q 38 68 30 65 Z"
            fill="#b45309"
            opacity="0.35"
          />
          <path
            d="M 32 63 Q 28 50 38 42 Q 48 37 60 39 Q 70 41 68 53 Q 66 66 50 66 Q 40 66 32 63 Z"
            fill="#22c55e"
          />

          {/* Mountain Peaks (Northwest rocks) */}
          <polygon points="36,28 42,14 48,28" fill="url(#mountainGradient)" opacity="0.9" />
          <polygon points="41,16 42,14 43,16" fill="#f8fafc" />

          {/* Castle Fortress Citadel (Northeast summit) */}
          <rect x="76" y="14" width="8" height="9" rx="1.5" fill="#e2b17a" stroke="#b45309" strokeWidth="0.5" />
          <polygon points="76,14 80,8 84,14" fill="#ef4444" />
          <rect x="79" y="18" width="2" height="3" fill="#1e293b" />

          {/* Tropical Trees (Little decorative low-poly palms and oaks) */}
          <circle cx="28" cy="74" r="2.2" fill="#15803d" />
          <circle cx="29" cy="72" r="1.8" fill="#22c55e" />
          <circle cx="16" cy="52" r="2.4" fill="#166534" />
          <circle cx="38" cy="58" r="2.5" fill="#15803d" />
          <circle cx="44" cy="56" r="2.0" fill="#22c55e" />
          <circle cx="60" cy="62" r="2.6" fill="#166534" />
          <circle cx="72" cy="58" r="2.4" fill="#15803d" />
          <circle cx="66" cy="36" r="2.2" fill="#166534" />

          {/* Connecting Winding Path Lines between Level Circles */}
          {currentLevelNodes.slice(0, -1).map((node, index) => {
            const nextNode = currentLevelNodes[index + 1];
            const isCompletedPath = unlockedLevel > nextNode.id;
            const isCurrentPath = unlockedLevel === nextNode.id;

            return (
              <g key={`path-${node.id}-${nextNode.id}`}>
                {/* Thick road base */}
                <line
                  x1={`${node.xPercent}%`}
                  y1={`${node.yPercent}%`}
                  x2={`${nextNode.xPercent}%`}
                  y2={`${nextNode.yPercent}%`}
                  stroke={isCompletedPath ? '#10b981' : isCurrentPath ? '#f59e0b' : '#475569'}
                  strokeWidth={isCurrentPath ? '2.5' : '1.8'}
                  strokeDasharray={isCompletedPath ? 'none' : '3, 2'}
                  opacity={isCompletedPath ? '0.9' : isCurrentPath ? '1' : '0.4'}
                  strokeLinecap="round"
                />

                {/* Animated dash flow along current path */}
                {isCurrentPath && (
                  <line
                    x1={`${node.xPercent}%`}
                    y1={`${node.yPercent}%`}
                    x2={`${nextNode.xPercent}%`}
                    y2={`${nextNode.yPercent}%`}
                    stroke="#fef08a"
                    strokeWidth="1.2"
                    strokeDasharray="2, 4"
                    strokeLinecap="round"
                    className="animate-shimmer"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* 
          REPRESENTACIÓN DE NIVELES COMO CÍRCULOS
          - Círculos de niveles en posiciones específicas del mapa
          - Bloqueados: Color gris o con candado
          - Desbloqueados: Color vibrante con efecto accesible
          - Completados: Esmeralda con checkmark ✓
        */}
        {currentLevelNodes.map((node) => {
          const isCompleted = unlockedLevel > node.id;
          const isCurrent = unlockedLevel === node.id;
          const isLocked = unlockedLevel < node.id;

          return (
            <div
              key={`node-${node.id}`}
              style={{
                left: `${node.xPercent}%`,
                top: `${node.yPercent}%`,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
            >
              {/* Level Circle Button */}
              <button
                onClick={() => handleNodeClick(node)}
                disabled={isLocked}
                title={`Nivel ${node.id}: ${node.title} (${
                  isCompleted ? 'Completado' : isCurrent ? 'Nivel Actual' : 'Bloqueado'
                })`}
                className={`relative group flex items-center justify-center transition-all duration-300 ${
                  isLocked
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:scale-115 active:scale-95'
                }`}
              >
                {/* Glowing ring aura on current active level */}
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-3 rounded-full bg-amber-400/40 animate-ping pointer-events-none"
                  />
                )}

                {/* Main Level Circle */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl border-3 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-white text-white shadow-emerald-500/50 hover:shadow-emerald-400/70'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 border-white text-white shadow-amber-500/60 ring-4 ring-amber-300 animate-pulse-glow'
                      : 'bg-slate-800/90 border-slate-600/80 text-slate-400 backdrop-blur-sm'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-7 h-7 stroke-[3.5] text-white drop-shadow-md" />
                  ) : isCurrent ? (
                    <span className="font-fun font-black text-xl sm:text-2xl text-white drop-shadow-md">
                      {node.isBoss ? '👑' : node.id}
                    </span>
                  ) : (
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  )}
                </div>

                {/* Star badge on completed levels */}
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 border border-white rounded-full flex items-center justify-center text-[10px] shadow-sm animate-bounce">
                    ⭐
                  </span>
                )}
              </button>

              {/* Level label badge under circle */}
              <div
                onClick={() => !isLocked && handleNodeClick(node)}
                className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-fun font-bold transition-all whitespace-nowrap shadow-md border ${
                  isCompleted
                    ? 'bg-emerald-950/85 text-emerald-200 border-emerald-400/50 cursor-pointer'
                    : isCurrent
                    ? 'bg-amber-950/90 text-amber-200 border-amber-400/70 ring-2 ring-amber-400/30 cursor-pointer scale-105'
                    : 'bg-slate-950/80 text-slate-400 border-white/10'
                }`}
              >
                <span>Nivel {node.id}</span>
                {isCurrent && (
                  <span className="ml-1 text-amber-300 font-mono">+{node.rewardCoins}🪙</span>
                )}
              </div>
            </div>
          );
        })}

        {/* 
          AVATAR EN EL NIVEL ACTUAL
          Requisito del usuario:
          "Coloca una imagen o un ícono que represente tu avatar sobre el círculo del nivel que estás jugando o que acabas de desbloquear.
          Cuando avances, el avatar se mueve al nuevo círculo desbloqueado."
        */}
        <div
          style={{
            left: `${currentActiveNode.xPercent}%`,
            top: `${currentActiveNode.yPercent}%`,
            transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="absolute z-30 -translate-x-1/2 -translate-y-[135%] pointer-events-none flex flex-col items-center"
        >
          {/* Avatar Speech Tag */}
          <div className="bg-sky-950/90 border border-amber-300 text-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-fun font-bold shadow-lg whitespace-nowrap flex items-center gap-1 mb-1 animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>¡{student.name} aquí!</span>
          </div>

          {/* Bouncing Avatar Token */}
          <div className="relative group animate-float-bob">
            {/* Outer halo */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 shadow-2xl flex items-center justify-center border-3 border-white ring-4 ring-amber-400/60"
              style={{ backgroundColor: student.avatar.suitColor || '#0284c7' }}
            >
              <div className="w-full h-full bg-white/90 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
                {avatarEmoji}
              </div>
            </div>

            {/* Downward Pointer Arrow pointing directly to the circle beneath it */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white mx-auto drop-shadow-md" />
          </div>
        </div>

        {/* Floating instructions badge */}
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-white text-xs flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-300" />
          <span className="font-fun">Toca un círculo desbloqueado para jugar • El avatar avanza con cada victoria</span>
        </div>
      </div>

      {/* 
        DESBLOQUEO AL COMPLETAR UN NIVEL & REUSO DE JUEGOS EXISTENTES
        Ficha flotante del nivel seleccionado con lanzamiento directo al juego
      */}
      {selectedNodeId && activeMissionData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-3 border-white/95 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className={`p-5 text-white flex items-center justify-between ${
                activeRealm === 'matematicas'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : activeRealm === 'algoritmos'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600'
                  : 'bg-gradient-to-r from-rose-600 to-purple-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                  {activeRealm === 'matematicas' ? '⚖️' : activeRealm === 'algoritmos' ? '🚀' : '📖'}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 block font-fun">
                    {activeRealm === 'matematicas'
                      ? 'Matemáticas • Balanza de Fracciones'
                      : activeRealm === 'algoritmos'
                      ? 'Computación • Algoritmos en Cuadrícula'
                      : 'Comunicación • Comprensión Lectora'}
                  </span>
                  <h3 className="text-lg font-black font-fun text-white leading-tight">
                    {activeMissionData.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  audio.playPop();
                  setSelectedNodeId(null);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100 space-y-2">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide block font-fun">
                  🎯 Objetivo de Aprendizaje
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {'explanation' in activeMissionData
                    ? activeMissionData.explanation
                    : 'objective' in activeMissionData
                    ? activeMissionData.objective
                    : activeMissionData.subtitle}
                </p>
              </div>

              {/* Gamer Rewards: XP, Coins, Stars */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block font-fun">Recompensa</span>
                  <div className="text-base font-fun font-bold text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                    <span>+30</span>
                    <span>🪙</span>
                  </div>
                </div>

                <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-center">
                  <span className="text-[10px] font-bold text-sky-800 uppercase block font-fun">Experiencia</span>
                  <div className="text-base font-fun font-bold text-sky-600 flex items-center justify-center gap-1 mt-0.5">
                    <span>+100</span>
                    <Zap className="w-4 h-4 fill-sky-500" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block font-fun">Estado</span>
                  <div className="text-xs font-fun font-bold text-emerald-700 mt-1">
                    {student.progress[activeRealm] > selectedNodeId
                      ? '¡Superado! ⭐'
                      : student.progress[activeRealm] === selectedNodeId
                      ? 'Disponible 🔥'
                      : '🔒 Bloqueado'}
                  </div>
                </div>
              </div>

              {/* Locked warning */}
              {student.progress[activeRealm] < selectedNodeId && (
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Debes acreditar los niveles anteriores de forma consecutiva para desbloquear este círculo.
                  </span>
                </div>
              )}

              {/* Action Buttons: Launch the game */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <GameButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedNodeId(null)}
                >
                  Cerrar
                </GameButton>

                {student.progress[activeRealm] >= selectedNodeId ? (
                  <GameButton
                    variant={activeRealm === 'matematicas' ? 'math' : activeRealm === 'algoritmos' ? 'code' : 'reading'}
                    size="md"
                    onClick={() => handleStartMission(selectedNodeId)}
                    icon={<Play className="w-4 h-4 fill-current" />}
                  >
                    <span>
                      {student.progress[activeRealm] > selectedNodeId
                        ? 'Repasar Nivel'
                        : '¡Comenzar Desafío Ahora!'}
                    </span>
                  </GameButton>
                ) : (
                  <GameButton
                    variant="primary"
                    size="md"
                    onClick={() => handleStartMission(student.progress[activeRealm])}
                    icon={<Play className="w-4 h-4 fill-current" />}
                  >
                    <span>Jugar Nivel Desbloqueado ({student.progress[activeRealm]})</span>
                  </GameButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
