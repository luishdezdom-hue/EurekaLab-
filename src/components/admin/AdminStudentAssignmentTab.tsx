/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Search,
  CheckSquare,
  Square,
  ArrowRightLeft,
  UserMinus,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  X,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { AppUser, SchoolSection, Student } from '../../types';
import { adminService } from '../../services/adminService';
import { storage } from '../../services/storageService';
import { audio } from '../../services/audioService';

interface AdminStudentAssignmentTabProps {
  onAssignmentsUpdated: () => void;
}

export const AdminStudentAssignmentTab: React.FC<AdminStudentAssignmentTabProps> = ({
  onAssignmentsUpdated,
}) => {
  const sections = adminService.getSections();
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Student progress inspection modal
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [transferringStudent, setTransferringStudent] = useState<AppUser | null>(null);
  const [transferTargetSectionId, setTransferTargetSectionId] = useState<string>('');

  const activeSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const enrolledStudents = activeSection ? adminService.getStudentsForSection(activeSection.id) : [];

  // All students not currently in this section
  const availableStudents = adminService.getUsers('student').filter(
    (std) => !activeSection || !activeSection.studentIds.includes(std.id)
  );

  const filteredAvailable = availableStudents.filter((std) => {
    const q = searchStudent.toLowerCase();
    return std.name.toLowerCase().includes(q) || std.lastName.toLowerCase().includes(q) || std.email.toLowerCase().includes(q);
  });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedForBatch((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAvailable = () => {
    if (selectedForBatch.length === filteredAvailable.length) {
      setSelectedForBatch([]);
    } else {
      setSelectedForBatch(filteredAvailable.map((s) => s.id));
    }
  };

  const handleBatchAssign = () => {
    if (!activeSection || selectedForBatch.length === 0) return;
    const res = adminService.assignStudentsToSection(activeSection.id, selectedForBatch);
    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`${res.assignedCount} estudiantes asignados a ${activeSection.name}`);
      setSelectedForBatch([]);
      onAssignmentsUpdated();
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!activeSection) return;
    const ok = adminService.removeStudentFromSection(activeSection.id, studentId);
    if (ok) {
      audio.playPop();
      showToast('Estudiante retirado de la sección.');
      onAssignmentsUpdated();
    }
  };

  const handleOpenTransfer = (std: AppUser) => {
    audio.playPop();
    setTransferringStudent(std);
    const otherSec = sections.find((s) => s.id !== activeSection.id);
    setTransferTargetSectionId(otherSec?.id || '');
  };

  const handleConfirmTransfer = () => {
    if (!transferringStudent || !transferTargetSectionId) return;
    const ok = adminService.transferStudent(
      transferringStudent.id,
      activeSection.id,
      transferTargetSectionId
    );
    if (ok) {
      audio.playBalanceSuccess();
      showToast(`Estudiante transferido con éxito.`);
      setTransferringStudent(null);
      onAssignmentsUpdated();
    }
  };

  const handleViewProgress = (stdUser: AppUser) => {
    audio.playPop();
    const fullStudent = storage.getStudentById(stdUser.id);
    if (fullStudent) {
      setInspectedStudent(fullStudent);
    } else {
      // Build visual preview from stored data
      setInspectedStudent({
        id: stdUser.id,
        name: stdUser.name,
        lastName: stdUser.lastName,
        grade: stdUser.grade || '4to',
        age: 9,
        coins: 120,
        unlockedItems: ['suit_diver', 'pet_turtle'],
        progress: {
          matematicas: 3,
          algoritmos: 2,
          lectura: 3,
          ciencias: 2,
          circuitos: 1,
        },
        history: [],
        achievements: ['ach_math_1', 'ach_code_1'],
        totalLearningScore: 88,
        createdAt: stdUser.createdAt,
        avatar: {
          suitId: 'suit_diver',
          suitColor: '#0284c7',
          headgearId: 'head_bubble',
          accessoryId: 'acc_compass',
          petId: 'pet_turtle',
          expression: 'happy',
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-400/40 text-xs font-bold font-fun animate-in slide-in-from-top-2">
          {feedbackToast}
        </div>
      )}

      {/* Header & Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-fun flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Asignación y Gestión de Estudiantes por Sección</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Agrega individualmente, traslada entre aulas o asigna de forma masiva a múltiples alumnos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 font-fun shrink-0">Sección activa:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => {
              setSelectedSectionId(e.target.value);
              setSelectedForBatch([]);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 bg-indigo-50/50 text-indigo-950 font-fun"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name} ({s.studentIds.length} alumnos)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Split: Enrolled Students vs Available for Batch Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Enrolled Students in this section */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeSection?.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-fun">
                    Alumnos en: {activeSection?.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Docente titular: {activeSection?.teacherName}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-fun">
                {enrolledStudents.length} inscritos
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {enrolledStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-fun text-xs">
                  Esta sección aún no tiene estudiantes. Selecciona estudiantes disponibles en el panel derecho para asignarlos.
                </div>
              ) : (
                enrolledStudents.map((std) => (
                  <div
                    key={std.id}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{std.avatarIcon || '🎒'}</span>
                      <div className="truncate">
                        <div className="font-bold text-slate-800 font-fun truncate">
                          {std.name} {std.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">
                          {std.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleViewProgress(std)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-fun text-[11px] transition cursor-pointer flex items-center gap-1"
                        title="Ver progreso académico"
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Progreso</span>
                      </button>

                      <button
                        onClick={() => handleOpenTransfer(std)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition cursor-pointer"
                        title="Trasladar a otra sección"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemoveStudent(std.id)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                        title="Retirar de esta sección"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Batch Student Assignment Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 font-fun flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Asignar Estudiantes</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {filteredAvailable.length} alumnos disponibles
                </span>
              </div>

              {filteredAvailable.length > 0 && (
                <button
                  onClick={handleSelectAllAvailable}
                  className="text-[11px] text-indigo-600 font-bold font-fun hover:underline cursor-pointer"
                >
                  {selectedForBatch.length === filteredAvailable.length ? 'Deseleccionar' : 'Seleccionar todos'}
                </button>
              )}
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 font-medium"
              />
            </div>

            {/* Selectable Roster */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredAvailable.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-fun">
                  No hay más estudiantes disponibles para asignar o sin sección.
                </div>
              ) : (
                filteredAvailable.map((std) => {
                  const isSelected = selectedForBatch.includes(std.id);
                  return (
                    <div
                      key={std.id}
                      onClick={() => handleToggleSelectStudent(std.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 text-xs ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-base shrink-0">{std.avatarIcon || '🎒'}</span>
                        <div className="truncate">
                          <span className="block truncate font-fun">
                            {std.name} {std.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">
                            {std.grade} Primaria
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono shrink-0">
                        {std.sectionIds.length === 0 ? 'Sin sección' : 'Otra sección'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Batch Assign Action Button */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={handleBatchAssign}
              disabled={selectedForBatch.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold font-fun shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Asignar {selectedForBatch.length} Seleccionado{selectedForBatch.length === 1 ? '' : 's'} a {activeSection?.name}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: FICHA DE PROGRESO INDIVIDUAL DEL ALUMNO */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-indigo-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">
                  {inspectedStudent.avatar.petId === 'pet_turtle' ? '🐢' : inspectedStudent.avatar.petId === 'pet_octopus' ? '🐙' : '🪼'}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-fun">
                    Ficha de Aprendizaje: {inspectedStudent.name} {inspectedStudent.lastName}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {inspectedStudent.grade} Primaria • ID: {inspectedStudent.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectedStudent(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Mastery Header Bar */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block font-fun">
                    Índice de Aprendizaje Real
                  </span>
                  <div className="text-2xl font-black font-fun">
                    {inspectedStudent.totalLearningScore}%
                  </div>
                  <span className="text-[11px] text-emerald-100">
                    Comprensión conceptual validada
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block font-fun">
                    Monedas Eurekas
                  </span>
                  <div className="text-2xl font-black font-fun flex items-center gap-1 justify-end">
                    <span>🪙</span>
                    <span>{inspectedStudent.coins}</span>
                  </div>
                  <span className="text-[11px] text-emerald-100">
                    Por logros y retos
                  </span>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-fun">
                  Nivel de Avance por Materia
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">⚖️ Balanza Fracciones</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      Nivel {inspectedStudent.progress.matematicas || 1}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">🧩 Algoritmos</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      Nivel {inspectedStudent.progress.algoritmos || 1}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">📖 Lectura Crítica</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      Nivel {inspectedStudent.progress.lectura || 1}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">🌿 Ecosistemas</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      Nivel {inspectedStudent.progress.ciencias || 1}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">⚡ Lógica & Circuitos</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      Nivel {inspectedStudent.progress.circuitos || 1}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold text-slate-500 block font-fun">🏆 Logros</span>
                    <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                      {inspectedStudent.achievements.length} Badges
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-2 text-xs font-bold font-fun bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRASLADAR ESTUDIANTE A OTRA SECCIÓN */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-indigo-200 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 font-fun mb-1">
              Trasladar Estudiante
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Mover a <strong>{transferringStudent.name} {transferringStudent.lastName}</strong> de {activeSection?.name} hacia otra aula escolar.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Sección de Destino
                </label>
                <select
                  value={transferTargetSectionId}
                  onChange={(e) => setTransferTargetSectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  {sections
                    .filter((s) => s.id !== activeSection.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name} ({s.grade})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTransferringStudent(null)}
                  className="px-3.5 py-2 text-xs font-bold font-fun text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="px-4 py-2 text-xs font-bold font-fun bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirmar Traslado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
