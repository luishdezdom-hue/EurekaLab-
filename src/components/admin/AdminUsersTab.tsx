/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Mail,
  Calendar,
} from 'lucide-react';
import { AppUser, UserRole, SchoolGrade } from '../../types';
import { adminService } from '../../services/adminService';
import { audio } from '../../services/audioService';

interface AdminUsersTabProps {
  onUsersUpdated: () => void;
  openCreateModalDirectly?: boolean;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  onUsersUpdated,
  openCreateModalDirectly = false,
}) => {
  const currentUser = adminService.getCurrentUser();
  const sections = adminService.getAllSectionsForAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(openCreateModalDirectly);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<AppUser | null>(null);

  // Form fields for Add/Edit
  const [formName, setFormName] = useState<string>('');
  const [formLastName, setFormLastName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formGrade, setFormGrade] = useState<SchoolGrade>('4to');
  const [formSectionId, setFormSectionId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const users = adminService.getUsers(roleFilter, searchQuery).filter((u) => {
    if (statusFilter === 'all') return true;
    return u.status === statusFilter;
  });

  const handleOpenAdd = () => {
    audio.playPop();
    setFormName('');
    setFormLastName('');
    setFormEmail('');
    setFormRole('student');
    setFormGrade('4to');
    setFormSectionId(sections[0]?.id || '');
    setFormStatus('active');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    audio.playPop();
    setTargetUser(user);
    setFormName(user.name);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormGrade(user.grade || '4to');
    setFormSectionId(user.sectionIds[0] || '');
    setFormStatus(user.status);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleOpenDelete = (user: AppUser) => {
    audio.playMismatch();
    setTargetUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = (user: AppUser) => {
    const res = adminService.toggleUserStatus(user.id);
    if (res.success) {
      audio.playPop();
      showToast(`Estado de ${user.name} actualizado a: ${res.newStatus?.toUpperCase()}`);
      onUsersUpdated();
    } else {
      showToast(res.error || 'Error al cambiar estado.');
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLastName.trim() || !formEmail.trim()) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return;
    }

    const res = adminService.addUser({
      name: formName,
      lastName: formLastName,
      email: formEmail,
      role: formRole,
      grade: formGrade,
      sectionIds: formSectionId ? [formSectionId] : [],
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast(`Usuario ${formName} registrado exitosamente.`);
      setShowAddModal(false);
      onUsersUpdated();
    } else {
      setFormError(res.error || 'Error al registrar usuario.');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    if (!formName.trim() || !formLastName.trim() || !formEmail.trim()) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    const res = adminService.updateUser(targetUser.id, {
      name: formName,
      lastName: formLastName,
      email: formEmail,
      role: formRole,
      grade: formGrade,
      sectionIds: formSectionId ? [formSectionId] : [],
      status: formStatus,
    });

    if (res.success) {
      audio.playBalanceSuccess();
      showToast('Información de usuario actualizada.');
      setShowEditModal(false);
      onUsersUpdated();
    } else {
      setFormError(res.error || 'Error al actualizar usuario.');
    }
  };

  const handleConfirmDelete = () => {
    if (!targetUser) return;
    const res = adminService.deleteUser(targetUser.id);
    if (res.success) {
      audio.playPop();
      showToast(`Usuario ${targetUser.name} eliminado del sistema.`);
      setShowDeleteModal(false);
      onUsersUpdated();
    } else {
      showToast(res.error || 'Error al eliminar usuario.');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-400/40 text-xs font-bold font-fun animate-in slide-in-from-top-2">
          {feedbackToast}
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-fun flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Administración de Usuarios</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gestión de cuentas para estudiantes, docentes y personal directivo con control RBAC.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-fun shadow-md shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Agregar Nuevo Usuario</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-slate-100 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50/70 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="all">Todos los roles</option>
              <option value="student">Estudiantes</option>
              {currentUser.role === 'admin' && (
                <>
                  <option value="teacher">Profesores</option>
                  <option value="admin">Administradores</option>
                </>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 font-fun">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-fun font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Nombre y Apellidos</th>
                <th className="p-3.5">Correo Electrónico</th>
                <th className="p-3.5">Rol</th>
                <th className="p-3.5">Sección Asignada</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Fecha Registro</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-fun">
                    No se encontraron usuarios que coincidan con la búsqueda o filtro.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const assignedSec = sections.find((s) => u.sectionIds.includes(s.id));
                  const isSelf = currentUser.id === u.id;
                  const canEdit = currentUser.role === 'admin' || (currentUser.role === 'teacher' && u.role === 'student') || isSelf;
                  const canDelete = currentUser.role === 'admin' && !isSelf;

                  return (
                    <tr key={u.id} className="hover:bg-indigo-50/30 transition">
                      {/* Nombre */}
                      <td className="p-3.5 font-bold font-fun">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{u.avatarIcon || '👤'}</span>
                          <div>
                            <div className="text-slate-900 leading-tight">
                              {u.name} {u.lastName}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="p-3.5 font-mono text-slate-600">
                        {u.email}
                      </td>

                      {/* Rol */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-fun ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : u.role === 'teacher'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {u.role === 'admin' ? 'Administrador' : u.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                        </span>
                      </td>

                      {/* Sección */}
                      <td className="p-3.5">
                        {assignedSec ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-fun">
                            <span>{assignedSec.icon}</span>
                            <span className="truncate max-w-[140px]">{assignedSec.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic font-fun">
                            Sin sección
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-fun transition cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title="Clic para cambiar estado activo/inactivo"
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Fecha */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Acciones */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleOpenDelete(u)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AGREGAR USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Agregar Nuevo Usuario</span>
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
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Morales Vega"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@eurekalab.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Rol en Plataforma
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="student">Estudiante</option>
                    {currentUser.role === 'admin' && (
                      <>
                        <option value="teacher">Profesor</option>
                        <option value="admin">Administrador General</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Grado Escolar
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as SchoolGrade)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="3ro">3ro Primaria</option>
                    <option value="4to">4to Primaria</option>
                    <option value="5to">5to Primaria</option>
                    <option value="6to">6to Primaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Sección Asignada
                </label>
                <select
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">Sin sección asignada</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name} ({s.grade})
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 text-xs font-bold font-fun bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {showEditModal && targetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>Editar Usuario</span>
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Rol
                  </label>
                  <select
                    value={formRole}
                    disabled={currentUser.role !== 'admin'}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium disabled:opacity-60"
                  >
                    <option value="student">Estudiante</option>
                    <option value="teacher">Profesor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                    Estado
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Sección Asignada
                </label>
                <select
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="">Sin sección asignada</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name} ({s.grade})
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 text-xs font-bold font-fun bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Actualizar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {showDeleteModal && targetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-rose-200 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 font-fun">
              ¿Eliminar Usuario?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 font-medium leading-relaxed">
              Estás a punto de eliminar a <strong>{targetUser.name} {targetUser.lastName}</strong> ({targetUser.email}). Esta acción retirará su acceso a la plataforma.
            </p>

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
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
