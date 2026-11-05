/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Menu,
  X,
  FileSpreadsheet,
  GraduationCap,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { audio } from '../services/audioService';
import { adminService } from '../services/adminService';
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminSectionsTab } from './admin/AdminSectionsTab';
import { AdminStudentAssignmentTab } from './admin/AdminStudentAssignmentTab';
import { AdminActivitiesTab } from './admin/AdminActivitiesTab';
import { AdminMaterialsTab } from './admin/AdminMaterialsTab';
import { AdminGradesTab } from './admin/AdminGradesTab';
import { AdminStatsTab } from './admin/AdminStatsTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';

interface TeacherDashboardProps {
  onClose: () => void;
  onStudentSelected: (studentId: string) => void;
  onRefresh: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onClose,
  onStudentSelected,
  onRefresh,
}) => {
  // Security PIN gatekeeper (default PIN 1234)
  const [pinInput, setPinInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Tab navigation (9 core tabs)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Active user session
  const [currentUser, setCurrentUser] = useState(() => adminService.getCurrentUser());

  // Quick Action triggers
  const [quickAddUserDirectly, setQuickAddUserDirectly] = useState<boolean>(false);
  const [quickAddSectionDirectly, setQuickAddSectionDirectly] = useState<boolean>(false);
  const [quickAddActivityDirectly, setQuickAddActivityDirectly] = useState<boolean>(false);
  const [quickAddMaterialDirectly, setQuickAddMaterialDirectly] = useState<boolean>(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storage.verifyTeacherPin(pinInput)) {
      audio.playBalanceSuccess();
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      audio.playMismatch();
      setPinError('PIN de seguridad incorrecto. El PIN institucional por defecto es: 1234');
    }
  };

  const handleSwitchUser = (userId: string) => {
    const switched = adminService.switchUser(userId);
    if (switched) {
      setCurrentUser(switched);
      audio.playPop();
    }
  };

  const handleSelectTab = (tab: AdminTab) => {
    audio.playPop();
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    setQuickAddUserDirectly(false);
    setQuickAddSectionDirectly(false);
    setQuickAddActivityDirectly(false);
    setQuickAddMaterialDirectly(false);
  };

  const handleOpenQuickAdd = (type: 'user' | 'section' | 'activity' | 'material') => {
    audio.playPop();
    if (type === 'user') {
      setActiveTab('users');
      setQuickAddUserDirectly(true);
    } else if (type === 'section') {
      setActiveTab('sections');
      setQuickAddSectionDirectly(true);
    } else if (type === 'activity') {
      setActiveTab('activities');
      setQuickAddActivityDirectly(true);
    } else if (type === 'material') {
      setActiveTab('materials');
      setQuickAddMaterialDirectly(true);
    }
  };

  const handleGlobalRefresh = () => {
    onRefresh();
  };

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-sky-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-3 border-indigo-200 shadow-2xl text-center animate-scale-in">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-200 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-fun inline-block mb-1">
            Seguridad Escolar EurekaLab
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-fun">
            Panel de Profesores & Directivos
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6 font-medium">
            Ingresa el PIN institucional docente para gestionar usuarios, secciones, tareas y calificaciones.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (Ej: 1234)"
                className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition bg-indigo-50/30"
                autoFocus
              />
              <span className="text-[11px] text-slate-500 mt-2 block font-medium">
                PIN de acceso escolar: <strong className="font-mono text-indigo-700 font-bold">1234</strong>
              </span>
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-shake">
                {pinError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-fun transition cursor-pointer active:scale-98"
              >
                Volver
              </button>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-fun shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Teacher & Administrator Dashboard
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-slate-100 rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col md:flex-row shadow-2xl border-2 border-slate-700/60 overflow-hidden animate-scale-in">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onClose={onClose}
          />
        </div>

        {/* Mobile Header with Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between p-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-black font-fun tracking-wide">
              EurekaLab Admin • {activeTab.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Flyout Drawer */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 flex animate-fade-in">
            <div className="w-64 h-full bg-slate-900 flex flex-col animate-slide-right">
              <div className="p-3 flex justify-end">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AdminSidebar
                activeTab={activeTab}
                onSelectTab={handleSelectTab}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                onClose={onClose}
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace with smooth tab transitions */}
        <main
          key={activeTab}
          className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-100 p-4 sm:p-6 custom-scrollbar animate-fade-in"
        >
          {activeTab === 'overview' && (
            <AdminOverviewTab
              onNavigateTab={handleSelectTab}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              onUsersUpdated={handleGlobalRefresh}
              openCreateModalDirectly={quickAddUserDirectly}
            />
          )}

          {activeTab === 'sections' && (
            <AdminSectionsTab
              onSectionsUpdated={handleGlobalRefresh}
              openCreateModalDirectly={quickAddSectionDirectly}
            />
          )}

          {activeTab === 'students' && (
            <AdminStudentAssignmentTab
              onAssignmentsUpdated={handleGlobalRefresh}
            />
          )}

          {activeTab === 'activities' && (
            <AdminActivitiesTab
              onActivitiesUpdated={handleGlobalRefresh}
              openCreateModalDirectly={quickAddActivityDirectly}
            />
          )}

          {activeTab === 'materials' && (
            <AdminMaterialsTab
              onMaterialsUpdated={handleGlobalRefresh}
              openCreateModalDirectly={quickAddMaterialDirectly}
            />
          )}

          {activeTab === 'grades' && (
            <AdminGradesTab
              onGradesUpdated={handleGlobalRefresh}
            />
          )}

          {activeTab === 'stats' && <AdminStatsTab />}

          {activeTab === 'settings' && <AdminSettingsTab />}
        </main>
      </div>
    </div>
  );
};
