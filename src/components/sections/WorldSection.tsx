/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../../types';
import { WorldMap3D } from '../3d/WorldMap3D';
import { LearningIslandMap } from '../LearningIslandMap';
import { audio } from '../../services/audioService';
import {
  Globe,
  MapPin,
  Sparkles,
  Layers,
  ArrowLeft,
  Play,
  Scale,
  Grid,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

interface WorldSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection, levelId?: number) => void;
  onPlayLevel: (subject: 'math' | 'code' | 'reading', levelId: number) => void;
}

export const WorldSection: React.FC<WorldSectionProps> = ({
  student,
  onNavigate,
  onPlayLevel,
}) => {
  const [mapMode, setMapMode] = useState<'3d' | 'illustrated'>('3d');
  const [activeIsland, setActiveIsland] = useState<'matematicas' | 'algoritmos' | 'lectura'>('matematicas');

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🏝️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-fun block">
                Sección 3 • Geografía de EDUQUEST
              </span>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                Mundo y Archipiélago
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Mundo o Isla de Aprendizaje
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Explora las islas temáticas, desplaza a tu avatar por los senderos y desbloquea nuevos niveles.
            </p>
          </div>
        </div>

        {/* View Toggle + Back to Home */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-sky-50 border-2 border-sky-200 rounded-2xl p-1 gap-1">
            <button
              onClick={() => {
                audio.playPop();
                setMapMode('3d');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer flex items-center gap-1.5 ${
                mapMode === '3d'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Vista 3D</span>
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setMapMode('illustrated');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer flex items-center gap-1.5 ${
                mapMode === 'illustrated'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa Ilustrado</span>
            </button>
          </div>

          <button
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

      {/* Main Map Content Area */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl space-y-4">
        {mapMode === '3d' ? (
          <div className="space-y-3">
            <WorldMap3D
              student={student}
              onSelectTab={(tab, levelId) => {
                if (tab === 'math' || tab === 'code' || tab === 'reading') {
                  onPlayLevel(tab, levelId || 1);
                } else {
                  onNavigate(tab);
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <LearningIslandMap
              student={student}
              onSelectTab={(tab, levelId) => {
                if (tab === 'math' || tab === 'code' || tab === 'reading') {
                  onPlayLevel(tab, levelId || 1);
                } else {
                  onNavigate(tab);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
