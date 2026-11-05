import React from 'react';
import { Student } from '../types';
import { audio } from '../services/audioService';
import { GameButton } from './ui/GameButton';
import { Heart, Clock, Award, CheckCircle, Sparkles, BookOpen, Brain, Compass, X, Waves, Cpu } from 'lucide-react';

interface ParentDashboardProps {
  student: Student;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ student, onClose }) => {
  const totalMinutes = Math.round(
    student.history.reduce((acc, h) => acc + h.timeSpentSeconds, 0) / 60
  );

  const completedCount = student.history.filter((h) => h.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md border-3 border-emerald-300 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-sky-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-2xl shadow-md border-b-2 border-emerald-700">
              👨‍👩‍👧
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-fun">
                Portal de Acompañamiento Familiar
              </span>
              <h2 className="text-lg sm:text-xl font-black text-sky-950 font-fun">
                Progreso de {student.name} {student.lastName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Grado {student.grade} de Primaria • {student.age} años
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-b from-white to-sky-50 p-3.5 rounded-2xl border-2 border-sky-200 text-center shadow-xs card-interactive animate-slide-up stagger-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase font-fun">Tiempo Total</span>
              <div className="text-xl font-fun font-bold text-sky-950 mt-1 flex items-center justify-center gap-1 font-mono">
                <Clock className="w-4 h-4 text-sky-600 transition-transform group-hover:rotate-12" />
                <span>{totalMinutes} min</span>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-200 text-center shadow-xs card-interactive animate-slide-up stagger-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase font-fun">Lecciones Reales</span>
              <div className="text-xl font-fun font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1 font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-600 transition-transform group-hover:scale-110" />
                <span>{completedCount} aprobadas</span>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 text-center shadow-xs card-interactive animate-slide-up stagger-3">
              <span className="text-[11px] font-bold text-amber-800 uppercase font-fun">Monedas Eurekas</span>
              <div className="text-xl font-fun font-bold text-amber-700 mt-1 flex items-center justify-center gap-1 font-mono">
                <span>{student.coins}</span>
                <span className="text-lg">🪙</span>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-purple-50 p-3.5 rounded-2xl border-2 border-purple-200 text-center shadow-xs card-interactive animate-slide-up stagger-4">
              <span className="text-[11px] font-bold text-purple-800 uppercase font-fun">Aprendizaje Real</span>
              <div className="text-xl font-fun font-bold text-purple-700 mt-1 font-mono">
                {student.totalLearningScore}%
              </div>
            </div>
          </div>

          {/* Core Competencies Progress */}
          <div className="bg-white border-2 border-sky-100 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm sm:text-base text-slate-800 font-fun flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Competencias Desarrolladas por {student.name}
            </h3>

            {/* Math */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Matemáticas: Fracciones y Pensamiento Proporcional
                </span>
                <span className="text-emerald-700 font-mono font-bold">Nivel {student.progress.matematicas} alcanzado</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min((student.progress.matematicas / 6) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Comprende la masa equivalente física dividiendo un todo en octavos, cuartos y medios.
              </p>
            </div>

            {/* Code */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Brain className="w-3.5 h-3.5 text-sky-600" />
                  Pensamiento Computacional: Algoritmos y Orientación
                </span>
                <span className="text-sky-700 font-mono font-bold">Nivel {student.progress.algoritmos} de 10</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${Math.min((student.progress.algoritmos / 10) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Escribe secuencias lógicas paso a paso para resolver laberintos sin chocar con obstáculos.
              </p>
            </div>

            {/* Reading */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                  Comprensión Lectora e Inferencia Crítica
                </span>
                <span className="text-rose-700 font-mono font-bold">Nivel {student.progress.lectura || 1} alcanzado</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((student.progress.lectura || 1) / 3) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Distingue hechos explícitos y deduce propósitos ecológicos y científicos del texto.
              </p>
            </div>

            {/* Science */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Waves className="w-3.5 h-3.5 text-teal-600" />
                  Ciencias Naturales: Redes Tróficas y Ecología
                </span>
                <span className="text-teal-700 font-mono font-bold">Nivel {student.progress.ciencias || 1} alcanzado</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((student.progress.ciencias || 1) / 6) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Comprende el flujo de energía solar a través de productores, herbívoros y depredadores marinos.
              </p>
            </div>

            {/* Circuits / Logic */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  Pensamiento Computacional: Circuitos y Lógica Booleana
                </span>
                <span className="text-indigo-700 font-mono font-bold">Nivel {student.progress.circuitos || 1} alcanzado</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((student.progress.circuitos || 1) / 6) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Resuelve problemas complejos aplicando compuertas AND, OR, NOT y XOR sin cortocircuitos.
              </p>
            </div>
          </div>

          {/* Parental Pedagogical Guidance (Tips for Home) */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 font-fun">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Consejo pedagógico para fortalecer en familia:</span>
            </div>
            <p className="leading-relaxed">
              ¡Felicita su perseverancia al resolver desafíos! En la cocina, puedes pedirle que te ayude a cortar frutas en mitades y cuartos para conectar la experiencia virtual con el mundo real.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sky-100 flex justify-end">
          <GameButton
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Entendido
          </GameButton>
        </div>
      </div>
    </div>
  );
};
