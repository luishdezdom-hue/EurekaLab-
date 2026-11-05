/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderArchive,
  PlusCircle,
  FileText,
  Video,
  Image,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  X,
  Download,
} from 'lucide-react';
import { SectionMaterial, SchoolSection } from '../../types';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

interface AdminMaterialsTabProps {
  onMaterialsUpdated: () => void;
  openCreateModalDirectly?: boolean;
}

export const AdminMaterialsTab: React.FC<AdminMaterialsTabProps> = ({
  onMaterialsUpdated,
  openCreateModalDirectly = false,
}) => {
  const sections = adminService.getSections();
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(openCreateModalDirectly);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [targetMaterial, setTargetMaterial] = useState<SectionMaterial | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSectionId, setFormSectionId] = useState<string>(sections[0]?.id || '');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formType, setFormType] = useState<'pdf' | 'image' | 'video' | 'link' | 'document'>('pdf');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formSizeLabel, setFormSizeLabel] = useState<string>('2.5 MB');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const materials = adminService.getMaterials(sectionFilter).filter((mat) => {
    const matchesType = typeFilter === 'all' || mat.type === typeFilter;
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenAdd = () => {
    audio.playPop();
    setFormTitle('');
    setFormSectionId(sections[0]?.id || '');
    setFormDescription('');
    setFormType('pdf');
    setFormUrl('');
    setFormSizeLabel('1.8 MB');
    setFormStatus('published');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (mat: SectionMaterial) => {
    audio.playPop();
    setTargetMaterial(mat);
    setFormTitle(mat.title);
    setFormSectionId(mat.sectionId);
    setFormDescription(mat.description);
    setFormType(mat.type);
    setFormUrl(mat.url);
    setFormSizeLabel(mat.sizeLabel || '1.5 MB');
    setFormStatus(mat.status);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleToggleStatus = (mat: SectionMaterial) => {
    const res = adminService.toggleMaterialStatus(mat.id);
    if (res.success) {
      audio.playPop();
      showToast(`Material ${res.newStatus === 'published' ? 'Publicado' : 'Guardado como Borrador'}`);
      onMaterialsUpdated();
    }
  };

  const handleDelete = (mat: SectionMaterial) => {
    if (confirm(`¿Eliminar el recurso "${mat.title}"?`)) {
      const res = adminService.deleteMaterial(mat.id);
      if (res.success) {
        audio.playPop();
        showToast('Material eliminado del repositorio.');
        onMaterialsUpdated();
      }
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      setFormError('Por favor completa el título y el enlace/archivo.');
      return;
    }

    const res = adminService.addMaterial({
      sectionId: formSectionId,
      title: formTitle,
      description: formDescription,
      type: formType,
      url: formUrl,
      sizeLabel: formSizeLabel,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Material "${formTitle}" agregado.`);
      setShowAddModal(false);
      onMaterialsUpdated();
    } else {
      setFormError(res.error || 'Error al agregar material.');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMaterial) return;
    if (!formTitle.trim() || !formUrl.trim()) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    const res = adminService.updateMaterial(targetMaterial.id, {
      sectionId: formSectionId,
      title: formTitle,
      description: formDescription,
      type: formType,
      url: formUrl,
      sizeLabel: formSizeLabel,
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast('Material actualizado.');
      setShowEditModal(false);
      onMaterialsUpdated();
    } else {
      setFormError(res.error || 'Error al actualizar material.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      default:
        return <ExternalLink className="w-5 h-5 text-amber-500" />;
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
            <FolderArchive className="w-5 h-5 text-amber-600" />
            <span>Administración de Materiales y Recursos Educativos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Sube y organiza documentos PDF, infografías, videos explicativos y enlaces de apoyo por aula.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-fun shadow-md shadow-amber-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Subir Nuevo Material</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar material por título o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-slate-50/70 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Sección:</span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
            >
              <option value="all">Todas las secciones</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 bg-white"
            >
              <option value="all">Todos los formatos</option>
              <option value="pdf">Documentos PDF</option>
              <option value="video">Videos</option>
              <option value="image">Imágenes / Infografías</option>
              <option value="link">Enlaces Web</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-10 text-center border-2 border-slate-100 text-slate-400 font-fun text-xs">
            No se encontraron materiales con los filtros actuales.
          </div>
        ) : (
          materials.map((mat) => {
            const sec = sections.find((s) => s.id === mat.sectionId);

            return (
              <div
                key={mat.id}
                className={`bg-white rounded-3xl p-5 border-2 transition shadow-sm flex flex-col justify-between ${
                  mat.status === 'published'
                    ? 'border-slate-100 hover:border-amber-200'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="p-2 rounded-2xl bg-amber-50 border border-amber-100">
                      {getTypeIcon(mat.type)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {mat.sizeLabel || '1 MB'}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(mat)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-fun cursor-pointer ${
                          mat.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                        title="Cambiar visibilidad"
                      >
                        {mat.status === 'published' ? 'Publicado' : 'Borrador'}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 font-fun leading-tight mb-1">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">
                    {mat.description}
                  </p>

                  {sec && (
                    <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-xl border border-indigo-100 inline-block font-fun">
                      {sec.icon} {sec.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 font-fun"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ver / Descargar</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                      title="Editar material"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                      title="Eliminar material"
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

      {/* MODAL: SUBIR / REGISTRAR MATERIAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-600" />
                <span>Subir Material de Apoyo</span>
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
                  Título del Material
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Guía Ilustrada de Fracciones Equivalentes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Sección Asignada
                </label>
                <select
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 bg-white font-medium"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Tipo de Formato
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 bg-white font-medium"
                  >
                    <option value="pdf">Documento PDF</option>
                    <option value="video">Video Explicativo</option>
                    <option value="image">Imagen / Infografía</option>
                    <option value="link">Enlace Web</option>
                    <option value="document">Documento Word</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Tamaño Aproximado
                  </label>
                  <input
                    type="text"
                    value={formSizeLabel}
                    onChange={(e) => setFormSizeLabel(e.target.value)}
                    placeholder="Ej. 2.4 MB"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  URL o Enlace del Archivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://cdn.eurekalab.edu/docs/archivo.pdf"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción o Instrucción de Estudio
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Orientaciones para el estudiante..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-medium"
                />
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
                  className="px-4 py-2 text-xs font-bold font-fun bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR MATERIAL */}
      {showEditModal && targetMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <span>Editar Material</span>
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  URL / Enlace
                </label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-amber-500 font-medium"
                />
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
                  className="px-4 py-2 text-xs font-bold font-fun bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Actualizar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
