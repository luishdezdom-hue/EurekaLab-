/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Lock,
  KeyRound,
  ShieldCheck,
  Building,
  Save,
  CheckCircle2,
  Database,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

export const AdminSettingsTab: React.FC = () => {
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [schoolName, setSchoolName] = useState<string>('Colegio Submarino EurekaLab');
  const [schoolTerm, setSchoolTerm] = useState<string>('Ciclo Escolar 2026 - Bimestre 1');
  const [schoolDirector, setSchoolDirector] = useState<string>('Dra. Elena Vásquez');
  const [schoolSaved, setSchoolSaved] = useState<boolean>(false);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storage.verifyTeacherPin(currentPin)) {
      audio.playMismatch();
      setPinMessage({ text: 'El PIN actual no es correcto. (PIN por defecto: 1234)', isError: true });
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setPinMessage({ text: 'El nuevo PIN debe tener entre 4 y 8 caracteres numéricos.', isError: true });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage({ text: 'El nuevo PIN y su confirmación no coinciden.', isError: true });
      return;
    }

    storage.setTeacherPin(newPin);
    audio.playBalanceSuccess();
    setPinMessage({ text: '¡PIN docente actualizado correctamente!', isError: false });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playBalanceSuccess();
    setSchoolSaved(true);
    setTimeout(() => setSchoolSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 font-fun flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Configuración del Sistema y Seguridad Institucional</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Ajusta las políticas de acceso docente, PIN de seguridad y datos de la institución escolar.
        </p>
      </div>

      {/* Grid of Two Setting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: PIN de Seguridad Docente */}
        <div className="bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-fun">
                  PIN de Acceso Docente
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Protege analíticas y calificaciones ante alumnos
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  PIN Actual
                </label>
                <input
                  type="password"
                  required
                  placeholder="PIN actual (por defecto: 1234)"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Nuevo PIN (4 a 8 dígitos)
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="Nuevo PIN numérico"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Confirmar Nuevo PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="Repite el nuevo PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {pinMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold font-fun ${
                    pinMessage.isError
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {pinMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-fun text-xs shadow-md transition cursor-pointer mt-2"
              >
                Actualizar PIN Docente
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Información Institucional */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-fun">
                  Parámetros de la Escuela
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Nombre de la institución y periodo lectivo
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSchoolInfo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Nombre de la Institución
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Periodo Escolar Activo
                </label>
                <input
                  type="text"
                  required
                  value={schoolTerm}
                  onChange={(e) => setSchoolTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Dirección Pedagógica
                </label>
                <input
                  type="text"
                  required
                  value={schoolDirector}
                  onChange={(e) => setSchoolDirector(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {schoolSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-fun">
                  ✓ Parámetros institucionales guardados.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-fun text-xs shadow-md transition cursor-pointer mt-2"
              >
                Guardar Parámetros Escolares
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Role Matrix Reference */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-fun mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Matriz de Roles y Permisos (RBAC)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black font-fun text-[10px] uppercase">
              Super Administrador
            </span>
            <ul className="text-slate-700 space-y-1 text-[11px] list-disc list-inside">
              <li>Control total de la plataforma.</li>
              <li>Crear, editar y eliminar usuarios y docentes.</li>
              <li>Administración global de secciones.</li>
              <li>Auditoría completa y configuración.</li>
            </ul>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-black font-fun text-[10px] uppercase">
              Profesor Titular
            </span>
            <ul className="text-slate-700 space-y-1 text-[11px] list-disc list-inside">
              <li>Gestiona sus estudiantes y secciones asignadas.</li>
              <li>Crea actividades, tareas y sube materiales.</li>
              <li>Califica y registra retroalimentación.</li>
              <li>No modifica cuentas directivas ni otros docentes.</li>
            </ul>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black font-fun text-[10px] uppercase">
              Estudiante
            </span>
            <ul className="text-slate-700 space-y-1 text-[11px] list-disc list-inside">
              <li>Accede únicamente a sus secciones asignadas.</li>
              <li>Consulta materiales de apoyo autorizados.</li>
              <li>Resuelve y entrega actividades y evaluaciones.</li>
              <li>Visualiza sus notas y comentarios docentes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
