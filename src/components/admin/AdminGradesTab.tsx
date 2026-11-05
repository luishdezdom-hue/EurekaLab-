/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  X,
  Edit2,
  Save,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AppUser, SectionActivity, ActivitySubmission, SchoolSection } from '../../types';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

interface AdminGradesTabProps {
  onGradesUpdated: () => void;
}

export const AdminGradesTab: React.FC<AdminGradesTabProps> = ({
  onGradesUpdated,
}) => {
  const sections = adminService.getSections();
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Grading observation modal
  const [activeSubmission, setActiveSubmission] = useState<{
    sub: ActivitySubmission;
    act: SectionActivity;
  } | null>(null);
  const [newScore, setNewScore] = useState<number>(90);
  const [newFeedback, setNewFeedback] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const students = selectedSectionId === 'all'
    ? adminService.getUsers('student')
    : adminService.getStudentsForSection(selectedSectionId);

  const activities = adminService.getActivities(selectedSectionId);
  const submissions = adminService.getSubmissions();

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const handleExportCSV = () => {
    audio.playPop();
    const csv = adminService.exportGradesCSV(selectedSectionId === 'all' ? undefined : selectedSectionId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Libreta_Calificaciones_${selectedSectionId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenGradeModal = (sub: ActivitySubmission, act: SectionActivity) => {
    audio.playPop();
    setActiveSubmission({ sub, act });
    setNewScore(sub.score || 90);
    setNewFeedback(sub.feedback || '');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    const res = adminService.gradeSubmission(
      activeSubmission.sub.id,
      newScore,
      newFeedback
    );

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Calificación actualizada para ${activeSubmission.sub.studentName}`);
      setActiveSubmission(null);
      onGradesUpdated();
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-fun flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-500" />
            <span>Calificaciones, Evaluaciones y Seguimiento Académico</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Matriz de notas por estudiante y actividad con historial pedagógico y observaciones.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-fun shadow-md shadow-emerald-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Libreta (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-slate-100 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar estudiante en la libreta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-slate-50/70 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 font-fun">Filtrar Sección:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-rose-500 bg-white"
          >
            <option value="all">Todas las secciones</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Grade Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-fun block">
            Promedio Sección
          </span>
          <div className="text-xl font-black font-mono text-rose-600 mt-1">
            {(() => {
              const secSubs = submissions.filter((s) => (selectedSectionId === 'all' || s.sectionId === selectedSectionId) && s.status === 'graded');
              if (secSubs.length === 0) return '88.0 pts';
              const avg = secSubs.reduce((acc, s) => acc + (s.score || 0), 0) / secSubs.length;
              return `${avg.toFixed(1)} pts`;
            })()}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Evaluaciones oficiales</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-fun block">
            Sobresalientes (≥90)
          </span>
          <div className="text-xl font-black font-mono text-emerald-600 mt-1">
            {(() => {
              return filteredStudents.filter((std) => {
                const subs = submissions.filter((s) => s.studentId === std.id && s.status === 'graded');
                if (subs.length === 0) return false;
                const avg = subs.reduce((a, b) => a + (b.score || 0), 0) / subs.length;
                return avg >= 90;
              }).length;
            })()} alumnos
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Desempeño superior</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-fun block">
            Aprobados (70-89)
          </span>
          <div className="text-xl font-black font-mono text-indigo-600 mt-1">
            {(() => {
              return filteredStudents.filter((std) => {
                const subs = submissions.filter((s) => s.studentId === std.id && s.status === 'graded');
                if (subs.length === 0) return true;
                const avg = subs.reduce((a, b) => a + (b.score || 0), 0) / subs.length;
                return avg >= 70 && avg < 90;
              }).length;
            })()} alumnos
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Dominio adecuado</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-fun block">
            Tareas por Revisar
          </span>
          <div className="text-xl font-black font-mono text-amber-600 mt-1">
            {submissions.filter((s) => (selectedSectionId === 'all' || s.sectionId === selectedSectionId) && s.status === 'submitted').length}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Esperando feedback</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-fun font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 sticky left-0 bg-slate-50 z-10 shadow-r">Estudiante</th>
                {activities.map((act) => (
                  <th key={act.id} className="p-3.5 text-center min-w-[130px]">
                    <div className="truncate font-bold text-slate-800">{act.title}</div>
                    <span className="text-[9px] text-purple-600 block">{act.subject}</span>
                  </th>
                ))}
                <th className="p-3.5 text-center bg-rose-50/50 text-rose-900 font-black">
                  Promedio
                </th>
                <th className="p-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={activities.length + 3} className="p-8 text-center text-slate-400 font-fun">
                    No hay estudiantes registrados en esta sección.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  let totalScore = 0;
                  let gradedCount = 0;
                  let pendingCount = 0;

                  return (
                    <tr key={std.id} className="hover:bg-rose-50/20 transition">
                      {/* Student Name */}
                      <td className="p-3.5 font-bold font-fun sticky left-0 bg-white z-10 shadow-r">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{std.avatarIcon || '🎒'}</span>
                          <div>
                            <div className="text-slate-900">{std.name} {std.lastName}</div>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {std.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Activities Scores */}
                      {activities.map((act) => {
                        const sub = submissions.find(
                          (s) => s.activityId === act.id && s.studentId === std.id
                        );

                        if (!sub) {
                          return (
                            <td key={act.id} className="p-3.5 text-center">
                              <span className="text-[11px] text-slate-300 font-mono italic">
                                —
                              </span>
                            </td>
                          );
                        }

                        if (sub.status === 'graded') {
                          totalScore += sub.score || 0;
                          gradedCount++;

                          return (
                            <td key={act.id} className="p-3.5 text-center">
                              <button
                                onClick={() => handleOpenGradeModal(sub, act)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border transition cursor-pointer hover:scale-105 ${
                                  (sub.score || 0) >= 90
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : (sub.score || 0) >= 70
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                                title="Clic para ver o modificar nota y observación"
                              >
                                {sub.score}
                              </button>
                            </td>
                          );
                        }

                        // Status is submitted (pending grade)
                        pendingCount++;
                        return (
                          <td key={act.id} className="p-3.5 text-center">
                            <button
                              onClick={() => handleOpenGradeModal(sub, act)}
                              className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold font-fun text-[10px] hover:bg-amber-200 transition cursor-pointer"
                              title="Calificar entrega"
                            >
                              Calificar
                            </button>
                          </td>
                        );
                      })}

                      {/* Promedio General */}
                      <td className="p-3.5 text-center bg-rose-50/40">
                        <span className="font-mono font-black text-xs text-rose-700">
                          {gradedCount > 0 ? (totalScore / gradedCount).toFixed(1) : 'S/C'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="p-3.5 text-center">
                        {pendingCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-fun">
                            {pendingCount} Pendiente{pendingCount > 1 ? 's' : ''}
                          </span>
                        ) : gradedCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-fun flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Al día
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-fun">
                            Sin entregas
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR / MODIFICAR NOTA Y OBSERVACIONES */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-rose-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                <span>Calificar Entrega</span>
              </h3>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 mt-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-fun">
                  Estudiante y Actividad
                </span>
                <div className="font-bold text-slate-900 font-fun text-sm mt-0.5">
                  {activeSubmission.sub.studentName}
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  {activeSubmission.act.title} ({activeSubmission.act.subject})
                </div>
              </div>

              {activeSubmission.sub.answerText && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-fun mb-1">
                    Respuesta del Estudiante:
                  </span>
                  <p className="text-slate-700 italic">
                    "{activeSubmission.sub.answerText}"
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Calificación (0 - 100 Puntos)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-black font-mono text-center rounded-xl border border-slate-300 outline-none focus:border-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Observación Pedagógica / Retroalimentación
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escribe comentarios formativos para el alumno..."
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubmission(null)}
                  className="px-3.5 py-2 text-xs font-bold font-fun text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold font-fun bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Nota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
