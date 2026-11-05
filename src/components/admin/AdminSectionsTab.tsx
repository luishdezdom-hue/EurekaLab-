/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  Power,
  Users,
  FileCheck2,
  FolderArchive,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  UserCheck,
  Search,
} from 'lucide-react';
import { SchoolSection, SchoolGrade, AppUser } from '../../types';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

interface AdminSectionsTabProps {
  onSectionsUpdated: () => void;
  openCreateModalDirectly?: boolean;
}

export const AdminSectionsTab: React.FC<AdminSectionsTabProps> = ({
  onSectionsUpdated,
  openCreateModalDirectly = false,
}) => {
  const sections = adminService.getSections();
  const allTeachers = adminService.getUsers('teacher');
  const allUsers = adminService.getUsers();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(openCreateModalDirectly);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [targetSection, setTargetSection] = useState<SchoolSection | null>(null);

  // Form fields
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIcon, setFormIcon] = useState<string>('🪸');
  const [formGrade, setFormGrade] = useState<SchoolGrade>('4to');
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const availableIcons = ['🪸', '🚢', '🌊', '🔬', '⚓', '⚡', '🐠', '🐙', '🐢', '🐬', '🤿', '🪐'];

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const filteredSections = sections.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.teacherName.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    audio.playPop();
    setFormName('');
    setFormDescription('');
    setFormIcon('🪸');
    setFormGrade('4to');
    setFormTeacherId(allTeachers[0]?.id || '');
    setFormStatus('active');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (sec: SchoolSection) => {
    audio.playPop();
    setTargetSection(sec);
    setFormName(sec.name);
    setFormDescription(sec.description);
    setFormIcon(sec.icon);
    setFormGrade(sec.grade);
    setFormTeacherId(sec.teacherId);
    setFormStatus(sec.status);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenDelete = (sec: SchoolSection) => {
    audio.playMismatch();
    setTargetSection(sec);
    setShowDeleteModal(true);
  };

  const handleOpenMembers = (sec: SchoolSection) => {
    audio.playPop();
    setTargetSection(sec);
    setShowMembersModal(true);
  };

  const handleToggleStatus = (sec: SchoolSection) => {
    const res = adminService.toggleSectionStatus(sec.id);
    if (res.success) {
      audio.playPop();
      showToast(`Estado de sección cambiado a: ${res.newStatus?.toUpperCase()}`);
      onSectionsUpdated();
    }
  };

  const handleReorder = (id: string, dir: 'up' | 'down') => {
    adminService.reorderSection(id, dir);
    audio.playPop();
    onSectionsUpdated();
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const res = adminService.addSection({
      name: formName,
      description: formDescription,
      icon: formIcon,
      grade: formGrade,
      teacherId: formTeacherId,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Sección "${formName}" creada exitosamente.`);
      setShowAddModal(false);
      onSectionsUpdated();
    } else {
      setFormError(res.error || 'Error al crear la sección.');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSection) return;
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const res = adminService.updateSection(targetSection.id, {
      name: formName,
      description: formDescription,
      icon: formIcon,
      grade: formGrade,
      teacherId: formTeacherId,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast('Información de la sección actualizada.');
      setShowEditModal(false);
      onSectionsUpdated();
    } else {
      setFormError(res.error || 'Error al actualizar sección.');
    }
  };

  const handleConfirmDelete = () => {
    if (!targetSection) return;
    const res = adminService.deleteSection(targetSection.id);
    if (res.success) {
      audio.playPop();
      showToast(`Sección "${targetSection.name}" eliminada.`);
      setShowDeleteModal(false);
      onSectionsUpdated();
    } else {
      showToast(res.error || 'Error al eliminar sección.');
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
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Administración de Secciones Escolares</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Crea, reordena y administra grupos, vinculando docentes responsables, actividades y materiales.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-fun shadow-md shadow-emerald-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Crear Nueva Sección</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar sección por nombre, docente o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-slate-50/70 font-medium"
        />
      </div>

      {/* Sections Grid & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSections.map((sec, idx) => {
          const enrolledStudents = adminService.getStudentsForSection(sec.id);
          const relatedActivities = adminService.getActivities(sec.id);
          const relatedMaterials = adminService.getMaterials(sec.id);

          return (
            <div
              key={sec.id}
              className={`bg-white rounded-3xl p-5 border-2 transition shadow-sm flex flex-col justify-between ${
                sec.status === 'active'
                  ? 'border-slate-100 hover:border-emerald-200'
                  : 'border-slate-200/70 bg-slate-50/70 opacity-80'
              }`}
            >
              <div>
                {/* Top Badge & Order Controls */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1 bg-slate-100 rounded-xl">{sec.icon}</span>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-fun">
                        {sec.grade} Primaria • Posición #{sec.order}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 font-fun">
                        {sec.name}
                      </h3>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleReorder(sec.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition cursor-pointer"
                      title="Subir orden"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(sec.id, 'down')}
                      disabled={idx === filteredSections.length - 1}
                      className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition cursor-pointer"
                      title="Bajar orden"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-1 mb-3 font-medium line-clamp-2">
                  {sec.description}
                </p>

                {/* Responsible Teacher Info */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👨‍🏫</span>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-fun">
                        Docente Responsable
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-fun">
                        {sec.teacherName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(sec)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-fun transition cursor-pointer flex items-center gap-1 ${
                      sec.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {sec.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Activa</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Inactiva</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Metrics Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-indigo-50/80 p-2 rounded-xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-700 font-fun block">Estudiantes</span>
                    <span className="font-black text-indigo-950 text-sm font-fun">
                      {sec.studentIds.length}
                    </span>
                  </div>
                  <div className="bg-purple-50/80 p-2 rounded-xl border border-purple-100">
                    <span className="text-[10px] text-purple-700 font-fun block">Actividades</span>
                    <span className="font-black text-purple-950 text-sm font-fun">
                      {relatedActivities.length}
                    </span>
                  </div>
                  <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-fun block">Materiales</span>
                    <span className="font-black text-amber-950 text-sm font-fun">
                      {relatedMaterials.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenMembers(sec)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 font-fun cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ver Integrantes ({sec.studentIds.length})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(sec)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                    title="Editar sección"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(sec)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                    title="Eliminar sección"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CREAR SECCIÓN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-emerald-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Crear Nueva Sección</span>
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
                  Nombre de la Sección
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 4to Grado C • Submarino Amarillo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción Pedagógica
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Objetivos temáticos del aula o grupo..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Icono Temático
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableIcons.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setFormIcon(ico)}
                      className={`text-lg p-2 rounded-xl border transition cursor-pointer ${
                        formIcon === ico
                          ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Grado Escolar
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as SchoolGrade)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="3ro">3ro Primaria</option>
                    <option value="4to">4to Primaria</option>
                    <option value="5to">5to Primaria</option>
                    <option value="6to">6to Primaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Docente Responsable
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="">Seleccionar docente</option>
                    {allTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="px-4 py-2 text-xs font-bold font-fun bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Guardar Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR SECCIÓN */}
      {showEditModal && targetSection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-emerald-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" />
                <span>Editar Sección</span>
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
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Icono Temático
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableIcons.map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setFormIcon(ico)}
                      className={`text-lg p-2 rounded-xl border transition cursor-pointer ${
                        formIcon === ico
                          ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Grado Escolar
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as SchoolGrade)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="3ro">3ro Primaria</option>
                    <option value="4to">4to Primaria</option>
                    <option value="5to">5to Primaria</option>
                    <option value="6to">6to Primaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Docente Responsable
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="">Seleccionar docente</option>
                    {allTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {formError}
                </p>
              )}

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
                  className="px-4 py-2 text-xs font-bold font-fun bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Actualizar Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ELIMINAR CON ADVERTENCIA DE CONTENIDO RELACIONADO */}
      {showDeleteModal && targetSection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-rose-200 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 font-fun">
              ¿Eliminar Sección Escolar?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 font-medium leading-relaxed">
              Estás a punto de eliminar la sección <strong>"{targetSection.name}"</strong>.
            </p>

            {/* Warning of related content */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left text-xs mb-4">
              <span className="font-bold text-amber-900 block font-fun mb-1">
                ⚠️ Información vinculada a esta sección:
              </span>
              <ul className="space-y-1 text-amber-800 text-[11px] list-disc list-inside">
                <li><strong>{targetSection.studentIds.length}</strong> estudiantes quedarán sin sección.</li>
                <li><strong>{adminService.getActivities(targetSection.id).length}</strong> actividades asociadas.</li>
                <li><strong>{adminService.getMaterials(targetSection.id).length}</strong> materiales educativos vinculados.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold font-fun text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold font-fun text-white bg-rose-600 hover:bg-rose-700 shadow-md transition cursor-pointer"
              >
                Sí, Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONSULTAR INTEGRANTES */}
      {showMembersModal && targetSection && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{targetSection.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-fun">
                    Integrantes: {targetSection.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Docente: {targetSection.teacherName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {adminService.getStudentsForSection(targetSection.id).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-fun">
                  No hay estudiantes asignados en esta sección todavía. Puedes asignarlos desde la pestaña "Estudiantes".
                </div>
              ) : (
                adminService.getStudentsForSection(targetSection.id).map((std) => (
                  <div
                    key={std.id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{std.avatarIcon || '🎒'}</span>
                      <div>
                        <div className="font-bold text-slate-800 font-fun">
                          {std.name} {std.lastName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {std.email}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-fun">
                      Activo
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 text-xs font-bold font-fun bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
