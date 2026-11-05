/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../../types';
import { Avatar3D } from '../Avatar3D';
import { audio } from '../../services/audioService';
import {
  Bed,
  ArrowLeft,
  Sparkles,
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  Palette,
  Sun,
  Moon,
  Heart,
} from 'lucide-react';

interface RoomSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
}

export const RoomSection: React.FC<RoomSectionProps> = ({
  student,
  onNavigate,
  onStudentUpdated,
}) => {
  const [roomTheme, setRoomTheme] = useState<'ocean' | 'cyber' | 'wood'>('ocean');
  const [activeSpot, setActiveSpot] = useState<'desk' | 'trophy' | 'pet' | 'window' | null>('desk');
  const [ambientAudioActive, setAmbientAudioActive] = useState<boolean>(false);

  const toggleAmbientAudio = () => {
    audio.playPop();
    setAmbientAudioActive(!ambientAudioActive);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-rose-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🛏️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-fun block">
                Sección 10 • Espacio Personal 3D
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                Mi Refugio de Estudio
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Mi Habitación 3D
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Tu santuario personal en EDUQUEST con escritorio de estudio, vitrina de trofeos y rincón de mascota.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleAmbientAudio}
            className={`px-3 py-1.5 rounded-2xl text-xs font-fun font-bold transition cursor-pointer flex items-center gap-1.5 border ${
              ambientAudioActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {ambientAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{ambientAudioActive ? 'Música Ambiente ON' : 'Música Relajante'}</span>
          </button>

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

      {/* Main Room Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: 3D Room Stage with Avatar */}
        <div
          className={`lg:col-span-7 rounded-3xl p-5 border-3 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden min-h-[500px] transition-all duration-500 ${
            roomTheme === 'ocean'
              ? 'bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 border-sky-400/60'
              : roomTheme === 'cyber'
              ? 'bg-gradient-to-b from-purple-950 via-slate-950 to-cyan-950 border-cyan-400/60'
              : 'bg-gradient-to-b from-amber-950 via-stone-900 to-slate-950 border-amber-600/60'
          }`}
        >
          {/* Subtle Ambient Light Glow */}
          <div className="absolute top-0 inset-x-0 h-44 bg-radial from-rose-400/20 to-transparent pointer-events-none" />

          {/* Room Top Bar */}
          <div className="w-full flex items-center justify-between z-10 text-white">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-fun border border-white/20">
              <span>🏠</span>
              <span>Cuarto de {student.name}</span>
            </div>

            {/* Room Theme Selector */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/15">
              <button
                onClick={() => setRoomTheme('ocean')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fun transition ${
                  roomTheme === 'ocean' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                🌊 Océano
              </button>
              <button
                onClick={() => setRoomTheme('cyber')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fun transition ${
                  roomTheme === 'cyber' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ⚡ Neón
              </button>
              <button
                onClick={() => setRoomTheme('wood')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-fun transition ${
                  roomTheme === 'wood' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                🪵 Cabaña
              </button>
            </div>
          </div>

          {/* 3D Avatar Relaxing in the Room */}
          <div className="relative flex items-center justify-center w-full z-10 my-3">
            <Avatar3D
              avatarConfig={student.avatar}
              interactive={true}
              size="xl"
            />
          </div>

          {/* Room Interactive Hotspots Bar */}
          <div className="w-full z-10 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 flex items-center justify-around gap-1 text-white text-xs font-fun font-bold">
            <button
              onClick={() => {
                audio.playPop();
                setActiveSpot('desk');
              }}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeSpot === 'desk' ? 'bg-rose-500 text-white shadow-xs' : 'hover:bg-white/10'
              }`}
            >
              <span>🖥️</span> Escritorio
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setActiveSpot('trophy');
              }}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeSpot === 'trophy' ? 'bg-rose-500 text-white shadow-xs' : 'hover:bg-white/10'
              }`}
            >
              <span>🏆</span> Vitrina
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setActiveSpot('pet');
              }}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeSpot === 'pet' ? 'bg-rose-500 text-white shadow-xs' : 'hover:bg-white/10'
              }`}
            >
              <span>🐾</span> Mascota
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setActiveSpot('window');
              }}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                activeSpot === 'window' ? 'bg-rose-500 text-white shadow-xs' : 'hover:bg-white/10'
              }`}
            >
              <span>🪟</span> Ventana
            </button>
          </div>
        </div>

        {/* Right Column: Hotspot Details & Room Customization */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-rose-200/90 shadow-xl space-y-4">
          {activeSpot === 'desk' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-800">
                <span className="text-2xl">🖥️</span>
                <h3 className="font-fun font-bold text-lg text-slate-900">
                  Escritorio de Estudio y Tareas
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aquí tu avatar planifica sus misiones, revisa las fracciones y programa algoritmos antes de viajar a las islas.
              </p>

              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wide block font-fun">
                  Material de Estudio en Mesa:
                </span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  <li>Cuaderno de Fracciones Equivalentes</li>
                  <li>Cuadrícula de Navegación Algorítmica</li>
                  <li>Diario de Explorador Submarino</li>
                </ul>
              </div>

              <button
                onClick={() => onNavigate('lessons')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-fun font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ir a la Academia a Estudiar</span>
              </button>
            </div>
          )}

          {activeSpot === 'trophy' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-600">
                <span className="text-2xl">🏆</span>
                <h3 className="font-fun font-bold text-lg text-slate-900">
                  Vitrina de Trofeos y Medallas
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Muestra de condecoraciones ganadas por dominar conceptos y resolver desafíos sin usar pistas.
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Trofeos Obtenidos:</span>
                  <span>{student.achievements.length} trofeos</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Eurekas Acumuladas:</span>
                  <span>{student.coins} 🪙</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('rewards')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-fun font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Abrir Sala de Recompensas Completa</span>
              </button>
            </div>
          )}

          {activeSpot === 'pet' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-pink-600">
                <span className="text-2xl">🐾</span>
                <h3 className="font-fun font-bold text-lg text-slate-900">
                  Hábitat de tu Mascota Acompañante
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tu compañera te acompaña en tus viajes flotando al lado de tu avatar.
              </p>

              <div className="p-3.5 bg-pink-50 rounded-2xl border border-pink-200 flex items-center gap-3">
                <span className="text-3xl">
                  {student.avatar.petId === 'pet_turtle'
                    ? '🐢'
                    : student.avatar.petId === 'pet_octopus'
                    ? '🐙'
                    : '🪼'}
                </span>
                <div>
                  <span className="text-xs font-bold text-pink-900 font-fun block">
                    {student.avatar.petId === 'pet_turtle'
                      ? 'Tortuga Sabia'
                      : student.avatar.petId === 'pet_octopus'
                      ? 'Pulpo Curioso'
                      : 'Medusa Bioluminiscente'}
                  </span>
                  <span className="text-[11px] text-pink-800">
                    Nivel de felicidad al 100% • ¡Lista para jugar!
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('inventory')}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-fun font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Cambiar Mascota en el Inventario</span>
              </button>
            </div>
          )}

          {activeSpot === 'window' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-sky-600">
                <span className="text-2xl">🪟</span>
                <h3 className="font-fun font-bold text-lg text-slate-900">
                  Ventana Panorámica al Archipiélago
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Desde esta ventana puedes observar el oleaje y las islas de matemáticas, algoritmos y lectura de EDUQUEST.
              </p>

              <button
                onClick={() => onNavigate('world')}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-fun font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Salir de la Habitación al Mundo 3D</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
