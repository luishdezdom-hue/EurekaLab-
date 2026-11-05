/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, NavigationSection } from '../../types';
import { Avatar3D } from '../Avatar3D';
import { audio } from '../../services/audioService';
import {
  Globe,
  Gamepad2,
  Target,
  GraduationCap,
  CheckSquare,
  Trophy,
  Backpack,
  Bed,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  Zap,
  Flame,
  User,
  ArrowRight,
  Scale,
  Grid,
  BookOpen,
} from 'lucide-react';

interface HomeSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection, levelId?: number) => void;
  onStudentUpdated: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  student,
  onNavigate,
}) => {
  const totalMissionsCompleted = student.history.filter((h) => h.completed).length;
  const playerLevel = Math.max(
    1,
    Math.floor((student.coins + totalMissionsCompleted * 50) / 100) + 1
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO WELCOME BANNER WITH 3D AVATAR & STATS */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-3 border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-7">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-sky-600 text-white text-xs font-fun font-bold shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Nivel {playerLevel} • Explorador de Arrecife</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-fun font-bold shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Racha 3 Días</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold font-fun">
                <span>🌊 Grado {student.grade} de Primaria</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-sky-950 font-fun leading-tight">
              ¡Hola de nuevo, <span className="text-indigo-600">{student.name}</span>!
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Bienvenido a tu centro de control en <strong className="text-sky-900">EDUQUEST</strong>. Cada función cuenta con su pantalla independiente para que aprendas, juegues y explores a tu propio ritmo.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-3 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-800 font-bold block uppercase tracking-wide">
                  Eurekas
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-950">
                  {student.coins} 🪙
                </span>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 p-3 rounded-2xl border border-indigo-200">
                <span className="text-xs text-indigo-800 font-bold block uppercase tracking-wide">
                  Dominio Real
                </span>
                <span className="text-xl sm:text-2xl font-black font-fun text-indigo-950">
                  {student.totalLearningScore}%
                </span>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-3 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold block uppercase tracking-wide">
                  Completadas
                </span>
                <span className="text-xl sm:text-2xl font-black font-fun text-emerald-950">
                  {totalMissionsCompleted}
                </span>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  audio.playPop();
                  onNavigate('world');
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-fun font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition cursor-pointer flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>Explorar Mundo o Isla</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  audio.playPop();
                  onNavigate('games');
                }}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-fun font-bold text-sm shadow-xs hover:border-sky-300 transition cursor-pointer flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-emerald-600" />
                <span>Arcade de Juegos</span>
              </button>
            </div>
          </div>

          {/* Right 3D Avatar Preview Hero */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-sky-100/80 via-white/90 to-sky-50/80 rounded-3xl p-5 border-2 border-sky-200 shadow-inner">
            <Avatar3D
              avatarConfig={student.avatar}
              interactive={true}
              size="lg"
            />
            <div className="mt-2 text-center">
              <span className="text-xs font-fun font-bold text-sky-900 block">
                {student.name} {student.lastName}
              </span>
              <button
                onClick={() => {
                  audio.playPop();
                  onNavigate('character');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 mx-auto mt-0.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Personalizar Mi Personaje 3D</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIRECT SECTIONS PORTAL GRID (Quick Jump to All 14 Areas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black font-fun text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Acceso Directo a las Secciones de EDUQUEST</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold hidden sm:block">
            Navegación Modular Independiente
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {(
            [
              { id: 'character', num: '2', name: 'Mi Personaje', icon: '👤', desc: 'Vestidor 3D 360°, peinados, facciones, ropa, calzado y pruebas de animación.', cta: 'Personalizar 3D →', border: 'border-purple-200 hover:border-purple-400', badge: 'bg-purple-100 text-purple-700', text: 'text-purple-700', ctaCol: 'text-purple-600', stagger: 'stagger-1' },
              { id: 'world', num: '3', name: 'Mundo o Isla', icon: '🏝️', desc: 'Archipiélago tridimensional, rutas de viaje y niveles de las islas.', cta: 'Viajar a las Islas →', border: 'border-sky-200 hover:border-sky-400', badge: 'bg-sky-100 text-sky-700', text: 'text-sky-700', ctaCol: 'text-sky-600', stagger: 'stagger-2' },
              { id: 'games', num: '4', name: 'Juegos', icon: '🎮', desc: 'Balanza de fracciones, algoritmos espaciales y lectura abisal interactiva.', cta: 'Abrir Arcade →', border: 'border-emerald-200 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', ctaCol: 'text-emerald-600', stagger: 'stagger-3' },
              { id: 'missions', num: '5', name: 'Misiones', icon: '🎯', desc: 'Misiones diarias, semanales y retos de grado con recompensas en monedas.', cta: 'Ver Misiones →', border: 'border-amber-200 hover:border-amber-400', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-800', ctaCol: 'text-amber-700', stagger: 'stagger-4' },
              { id: 'lessons', num: '6', name: 'Academia', icon: '📚', desc: 'Lecciones teóricas y conceptuales separadas de los juegos prácticos.', cta: 'Aprender Lecciones →', border: 'border-blue-200 hover:border-blue-400', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-700', ctaCol: 'text-blue-600', stagger: 'stagger-5' },
              { id: 'evaluations', num: '7', name: 'Evaluaciones', icon: '📝', desc: 'Pruebas diagnósticas formativas para medir comprensión real vs azar.', cta: 'Realizar Test →', border: 'border-teal-200 hover:border-teal-400', badge: 'bg-teal-100 text-teal-800', text: 'text-teal-800', ctaCol: 'text-teal-700', stagger: 'stagger-6' },
              { id: 'rewards', num: '8', name: 'Recompensas', icon: '🏆', desc: 'Sala de trofeos, medallas y canje de Eurekas por artículos exclusivos.', cta: 'Ver Trofeos →', border: 'border-yellow-200 hover:border-yellow-400', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-800', ctaCol: 'text-yellow-700', stagger: 'stagger-7' },
              { id: 'inventory', num: '9', name: 'Inventario', icon: '🎒', desc: 'Mochila con tus atuendos, calzado, mascotas y accesorios adquiridos.', cta: 'Abrir Mochila →', border: 'border-orange-200 hover:border-orange-400', badge: 'bg-orange-100 text-orange-800', text: 'text-orange-800', ctaCol: 'text-orange-700', stagger: 'stagger-8' },
              { id: 'room', num: '10', name: 'Mi Habitación', icon: '🛏️', desc: 'Espacio 3D personal con escritorio de estudio, mascota y descanso.', cta: 'Entrar al Cuarto →', border: 'border-rose-200 hover:border-rose-400', badge: 'bg-rose-100 text-rose-700', text: 'text-rose-700', ctaCol: 'text-rose-600', stagger: 'stagger-2' },
              { id: 'stats', num: '11', name: 'Estadísticas', icon: '📊', desc: 'Métricas de aprendizaje real, intentos, tiempo y analíticas formativas.', cta: 'Ver Analíticas →', border: 'border-indigo-200 hover:border-indigo-400', badge: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-700', ctaCol: 'text-indigo-600', stagger: 'stagger-3' },
              { id: 'tutor', num: '12', name: 'Tutor Inteligente', icon: '🤖', desc: 'EurekaBot: guía socrático que te ayuda a resolver dudas conceptuales.', cta: 'Hablar con Tutor →', border: 'border-cyan-200 hover:border-cyan-400', badge: 'bg-cyan-100 text-cyan-800', text: 'text-cyan-800', ctaCol: 'text-cyan-700', stagger: 'stagger-4' },
              { id: 'settings', num: '13', name: 'Configuración', icon: '⚙️', desc: 'Volumen de audio, accesibilidad, datos de perfil y preferencias.', cta: 'Ajustes →', border: 'border-slate-200 hover:border-slate-400', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-700', ctaCol: 'text-slate-600', stagger: 'stagger-5' },
            ] as {
              id: NavigationSection;
              num: string;
              name: string;
              icon: string;
              desc: string;
              cta: string;
              border: string;
              badge: string;
              text: string;
              ctaCol: string;
              stagger: string;
            }[]
          ).map((sec) => (
            <div
              key={sec.id}
              onClick={() => {
                audio.playPop();
                onNavigate(sec.id);
              }}
              className={`relative overflow-hidden p-4 rounded-3xl bg-white/95 hover:bg-white border-2 ${sec.border} card-interactive animate-slide-up ${sec.stagger} cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-xl`}
            >
              {/* Subtle light sheen effect on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

              <div className="space-y-2 relative z-10">
                <div className={`w-10 h-10 rounded-2xl ${sec.badge} flex items-center justify-center text-xl shadow-xs group-hover:scale-115 group-hover:-rotate-6 transition-all duration-300`}>
                  {sec.icon}
                </div>
                <h3 className={`font-fun font-bold text-base text-slate-900 group-hover:${sec.text} transition-colors duration-200`}>
                  {sec.num}. {sec.name}
                </h3>
                <p className="text-xs text-slate-600 leading-snug">
                  {sec.desc}
                </p>
              </div>

              <span className={`text-xs font-bold ${sec.ctaCol} mt-3 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-200 relative z-10`}>
                {sec.cta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
