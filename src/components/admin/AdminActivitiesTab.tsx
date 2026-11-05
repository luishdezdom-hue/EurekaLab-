/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  PlusCircle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Power,
  Paperclip,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  Search,
  X,
  FileText,
  AlertCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { SectionActivity, ActivityAttachment, SubjectType, ActivitySubmission } from '../../types';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

interface AdminActivitiesTabProps {
  onActivitiesUpdated: () => void;
  openCreateModalDirectly?: boolean;
}

export const AdminActivitiesTab: React.FC<AdminActivitiesTabProps> = ({
  onActivitiesUpdated,
  openCreateModalDirectly = false,
}) => {
  const sections = adminService.getSections();
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(openCreateModalDirectly);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState<boolean>(false);
  const [targetActivity, setTargetActivity] = useState<SectionActivity | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSectionId, setFormSectionId] = useState<string>(sections[0]?.id || '');
  const [formSubject, setFormSubject] = useState<SubjectType>('matematicas');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formInstructions, setFormInstructions] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(100);
  const [formPublishDate, setFormPublishDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');
  const [formAttachments, setFormAttachments] = useState<ActivityAttachment[]>([]);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<ActivitySubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const activities = adminService.getActivities(sectionFilter).filter((act) => {
    const matchesSubject = subjectFilter === 'all' || act.subject === subjectFilter;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleOpenAdd = () => {
    audio.playPop();
    setFormTitle('');
    setFormSectionId(sections[0]?.id || '');
    setFormSubject('matematicas');
    setFormDescription('');
    setFormInstructions('');
    setFormPoints(100);
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormAttachments([]);
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setFormStatus('active');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (act: SectionActivity) => {
    audio.playPop();
    setTargetActivity(act);
    setFormTitle(act.title);
    setFormSectionId(act.sectionId);
    setFormSubject(act.subject);
    setFormDescription(act.description);
    setFormInstructions(act.instructions);
    setFormPoints(act.points);
    setFormPublishDate(act.publishDate);
    setFormDueDate(act.dueDate);
    setFormAttachments(act.attachments || []);
    setFormStatus(act.status);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenSubmissions = (act: SectionActivity) => {
    audio.playPop();
    setTargetActivity(act);
    setShowSubmissionsModal(true);
  };

  const handleToggleStatus = (act: SectionActivity) => {
    const res = adminService.toggleActivityStatus(act.id);
    if (res.success) {
      audio.playPop();
      showToast(`Actividad ${res.newStatus === 'active' ? 'Activada' : 'Desactivada'}`);
      onActivitiesUpdated();
    }
  };

  const handleDelete = (act: SectionActivity) => {
    if (confirm(`¿Estás seguro de eliminar la actividad "${act.title}"?`)) {
      const res = adminService.deleteActivity(act.id);
      if (res.success) {
        audio.playPop();
        showToast('Actividad eliminada.');
        onActivitiesUpdated();
      }
    }
  };

  const handleAddAttachment = () => {
    if (!formAttachmentName.trim() || !formAttachmentUrl.trim()) return;
    const newAtt: ActivityAttachment = {
      id: `att_${Date.now()}`,
      name: formAttachmentName.trim(),
      url: formAttachmentUrl.trim(),
      type: 'pdf',
      sizeLabel: '1.2 MB',
    };
    setFormAttachments([...formAttachments, newAtt]);
    setFormAttachmentName('');
    setFormAttachmentUrl('');
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormAttachments(formAttachments.filter((a) => a.id !== attId));
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Por favor completa el título y la descripción.');
      return;
    }

    const res = adminService.addActivity({
      sectionId: formSectionId,
      title: formTitle,
      description: formDescription,
      instructions: formInstructions,
      subject: formSubject,
      points: formPoints,
      publishDate: formPublishDate,
      dueDate: formDueDate,
      attachments: formAttachments,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Actividad "${formTitle}" creada con éxito.`);
      setShowAddModal(false);
      onActivitiesUpdated();
    } else {
      setFormError(res.error || 'Error al guardar actividad.');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetActivity) return;
    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return;
    }

    const res = adminService.updateActivity(targetActivity.id, {
      sectionId: formSectionId,
      title: formTitle,
      description: formDescription,
      instructions: formInstructions,
      subject: formSubject,
      points: formPoints,
      publishDate: formPublishDate,
      dueDate: formDueDate,
      attachments: formAttachments,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast('Actividad actualizada.');
      setShowEditModal(false);
      onActivitiesUpdated();
    } else {
      setFormError(res.error || 'Error al actualizar actividad.');
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const res = adminService.gradeSubmission(
      gradingSubmission.id,
      gradeInput,
      feedbackInput
    );

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Calificación guardada para ${gradingSubmission.studentName}.`);
      setGradingSubmission(null);
      onActivitiesUpdated();
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
            <FileCheck2 className="w-5 h-5 text-purple-600" />
            <span>Administración de Actividades y Tareas</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Diseña tareas por sección, programa fechas límites, adjunta materiales y revisa entregas con retroalimentación.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-fun shadow-md shadow-purple-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Nueva Actividad</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar actividad por título o palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50/70 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Sección:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
            >
              <option value="all">Todas las secciones</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Materia:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
            >
              <option value="all">Todas las materias</option>
              <option value="matematicas">Matemáticas</option>
              <option value="algoritmos">Algoritmos</option>
              <option value="lectura">Lectura</option>
              <option value="ciencias">Ciencias</option>
              <option value="circuitos">Lógica / Circuitos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-slate-100 text-slate-400 font-fun text-xs">
            No se encontraron actividades registradas con los filtros seleccionados.
          </div>
        ) : (
          activities.map((act) => {
            const sec = sections.find((s) => s.id === act.sectionId);
            const submissions = adminService.getSubmissions(act.id);
            const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
            const gradedCount = submissions.filter((s) => s.status === 'graded').length;

            return (
              <div
                key={act.id}
                className={`bg-white rounded-3xl p-5 border-2 transition shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  act.status === 'active' ? 'border-slate-100 hover:border-purple-200' : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-fun uppercase">
                      {act.subject}
                    </span>
                    {sec && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-fun">
                        {sec.icon} {sec.name}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                      {act.points} Puntos Max
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 font-fun">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Publicado: {act.publishDate}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Entrega: {act.dueDate}
                    </span>
                    {act.attachments && act.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <Paperclip className="w-3.5 h-3.5" />
                        {act.attachments.length} archivo(s) adjunto(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Submissions & Actions Bar */}
                <div className="flex flex-wrap sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleOpenSubmissions(act)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold font-fun text-xs transition cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Entregas ({submissions.length})</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-mono">
                        {pendingCount} pendientes
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(act)}
                      className={`p-1.5 rounded-xl border text-[10px] font-bold font-fun transition cursor-pointer ${
                        act.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Activar/Desactivar actividad"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(act)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                      title="Editar actividad"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(act)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: CREAR ACTIVIDAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-purple-100 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-600" />
                <span>Crear Nueva Actividad Pedagógica</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Título de la Actividad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Balanza Fraccionaria Desafío Nivel 4"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Sección Asignada
                  </label>
                  <select
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 bg-white font-medium"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Materia
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 bg-white font-medium"
                  >
                    <option value="matematicas">Matemáticas</option>
                    <option value="algoritmos">Algoritmos</option>
                    <option value="lectura">Lectura</option>
                    <option value="ciencias">Ciencias</option>
                    <option value="circuitos">Lógica / Circuitos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Resumen del reto o tarea..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Instrucciones Detalladas para el Estudiante
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paso a paso de lo que debe resolver o entregar..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Fecha Publicación
                  </label>
                  <input
                    type="date"
                    required
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-mono text-rose-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Puntos Máximos
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="block text-xs font-bold text-slate-700 font-fun mb-1">
                  Adjuntar Material o Guía de Apoyo
                </span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre del archivo (ej. Guia_Practica.pdf)"
                    value={formAttachmentName}
                    onChange={(e) => setFormAttachmentName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="URL del recurso"
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold font-fun hover:bg-purple-700 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>

                {formAttachments.length > 0 && (
                  <div className="space-y-1">
                    {formAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded-lg border border-slate-200"
                      >
                        <span className="truncate max-w-[280px] font-mono text-[11px] text-slate-700">
                          📎 {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-bold font-fun text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold font-fun bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Publicar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ACTIVIDAD */}
      {showEditModal && targetActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-purple-100 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <span>Editar Actividad</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Instrucciones
                </label>
                <textarea
                  rows={3}
                  required
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Puntos Máximos
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-2 text-xs font-bold font-fun text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold font-fun bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Actualizar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONSULTAR Y CALIFICAR ENTREGAS DE ESTUDIANTES */}
      {showSubmissionsModal && targetActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border-2 border-purple-100 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 font-fun">
                  Entregas: {targetActivity.title}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {adminService.getSubmissions(targetActivity.id).length} entregas registradas • Fecha límite: {targetActivity.dueDate}
                </span>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {adminService.getSubmissions(targetActivity.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-fun">
                  No hay entregas registradas aún para esta actividad.
                </div>
              ) : (
                adminService.getSubmissions(targetActivity.id).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎒</span>
                        <div>
                          <span className="font-bold text-slate-900 font-fun text-sm">
                            {sub.studentName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Entregado: {new Date(sub.submissionDate).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.status === 'graded' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black font-fun text-xs">
                            {sub.score}/100 Pts
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold font-fun text-[11px]">
                            Pendiente
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeInput(sub.score || 90);
                            setFeedbackInput(sub.feedback || '');
                          }}
                          className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold font-fun text-xs shadow-xs transition cursor-pointer"
                        >
                          {sub.status === 'graded' ? 'Modificar Nota' : 'Calificar'}
                        </button>
                      </div>
                    </div>

                    {/* Student's answer text */}
                    {sub.answerText && (
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-slate-700 font-medium">
                        <strong className="text-[10px] text-slate-400 uppercase tracking-wider block font-fun mb-0.5">
                          Respuesta o Solución del Alumno:
                        </strong>
                        {sub.answerText}
                      </div>
                    )}

                    {/* Teacher's observation / feedback */}
                    {sub.feedback && (
                      <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100 text-purple-900 text-[11px]">
                        <strong>Observación del Docente:</strong> {sub.feedback}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Inline Grading Drawer/Form */}
            {gradingSubmission && (
              <form
                onSubmit={handleSaveGrade}
                className="mt-4 p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-950 font-fun">
                    Calificando a: {gradingSubmission.studentName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase font-fun mb-1">
                      Calificación (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={gradeInput}
                      onChange={(e) => setGradeInput(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm font-bold font-mono text-center rounded-xl border border-indigo-300 bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase font-fun mb-1">
                      Observación Pedagógica / Retroalimentación
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Excelente comprensión del concepto de fracciones..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-300 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="px-3 py-1.5 text-xs font-bold font-fun text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold font-fun bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Registrar Calificación
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="px-4 py-2 text-xs font-bold font-fun bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Cerrar Entregas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
