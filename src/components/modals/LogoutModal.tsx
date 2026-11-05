/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audio } from '../../services/audioService';
import { LogOut, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  studentName,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-3 border-rose-200 text-center space-y-4 animate-scale-in">
        <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto shadow-inner border border-rose-200 group-hover:scale-110 transition-transform">
          <LogOut className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-fun block">
            Sección 14 • Salida Segura
          </span>
          <h2 className="text-xl font-black font-fun text-slate-900 mt-0.5">
            ¿Cerrar Sesión, {studentName}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Tu progreso, nivel, monedas Eurekas y la personalización 3D de tu avatar están guardados con seguridad en tu perfil.
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Progreso individual sincronizado</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              audio.playPop();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs transition cursor-pointer active:scale-95"
          >
            Seguir Jugando
          </button>

          <button
            onClick={() => {
              audio.playPop();
              onConfirmLogout();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-fun font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
          >
            Sí, Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
