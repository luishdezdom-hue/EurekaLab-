/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  Users,
  Layers,
  FileCheck2,
  FolderArchive,
  GraduationCap,
  Award,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { AppUser, UserRole } from '../../types';
import { adminService } from '../../services/adminService';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'sections'
  | 'activities'
  | 'materials'
  | 'students'
  | 'grades'
  | 'stats'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: AppUser;
  onSwitchUser: (userId: string) => void;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  onClose,
}) => {
  const allUsers = adminService.getUsers();
  const teacherAndAdminUsers = allUsers.filter((u) => u.role === 'admin' || u.role === 'teacher');

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4" />, badge: currentUser.role === 'admin' ? 'Total' : 'Alumnos' },
    { id: 'sections', label: 'Secciones', icon: <Layers className="w-4 h-4" /> },
    { id: 'activities', label: 'Actividades', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'materials', label: 'Materiales', icon: <FolderArchive className="w-4 h-4" /> },
    { id: 'students', label: 'Estudiantes', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'grades', label: 'Calificaciones', icon: <Award className="w-4 h-4" /> },
    { id: 'stats', label: 'Estadísticas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand & School Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black font-fun tracking-wide text-white leading-tight">
              EurekaLab Admin
            </h1>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
              Portal Docente & Directivo
            </span>
          </div>
        </div>
      </div>

      {/* Active User Profile Pill with RBAC Selector */}
      <div className="p-3 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-fun">
            Sesión Activa (RBAC)
          </span>
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              currentUser.role === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {currentUser.role === 'admin' ? 'Super Admin' : 'Profesor'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{currentUser.avatarIcon || '👤'}</span>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate font-fun">
              {currentUser.name} {currentUser.lastName}
            </div>
            <div className="text-[10px] text-slate-400 truncate font-mono">
              {currentUser.email}
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for verification/testing */}
        <div className="pt-1.5 border-t border-slate-700/60">
          <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
            Cambiar Rol / Cuenta Docente:
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="w-full text-[11px] font-medium bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {teacherAndAdminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                [{u.role.toUpperCase()}] {u.name} {u.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {menuItems.map((item, idx) => {
          const isActive = activeTab === item.id;
          const staggerClass = idx < 6 ? `stagger-${idx + 1}` : '';

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold font-fun transition-all duration-200 cursor-pointer group active:scale-[0.98] animate-slide-left ${staggerClass} ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/35 translate-x-1'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white hover:translate-x-1.5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Return Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition font-fun cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Volver al Estudiante</span>
        </button>
      </div>
    </aside>
  );
};
