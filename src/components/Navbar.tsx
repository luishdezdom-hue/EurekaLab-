/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../types';
import { audio } from '../services/audioService';
import { AudioSettingsModal } from './AudioSettingsModal';
import {
  Volume2,
  VolumeX,
  User,
  ShoppingBag,
  Home,
  Globe,
  Gamepad2,
  Target,
  GraduationCap,
  CheckSquare,
  Trophy,
  Backpack,
  Bed,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  student: Student;
  onOpenTeacherPanel: () => void;
  onOpenParentPanel: () => void;
  onOpenLogoutModal: () => void;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  shortLabel: string;
  icon: string;
  category: 'adventure' | 'learning' | 'personal' | 'system';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '1. Inicio', shortLabel: 'Inicio', icon: '🏠', category: 'adventure' },
  { id: 'character', label: '2. Mi Personaje', shortLabel: 'Personaje', icon: '👤', category: 'adventure' },
  { id: 'world', label: '3. Mundo o Isla', shortLabel: 'Mundo', icon: '🏝️', category: 'adventure' },
  { id: 'games', label: '4. Juegos', shortLabel: 'Juegos', icon: '🎮', category: 'adventure' },
  { id: 'missions', label: '5. Misiones', shortLabel: 'Misiones', icon: '🎯', category: 'adventure' },
  { id: 'lessons', label: '6. Academia o Lecciones', shortLabel: 'Academia', icon: '📚', category: 'learning' },
  { id: 'evaluations', label: '7. Evaluaciones', shortLabel: 'Evaluaciones', icon: '📝', category: 'learning' },
  { id: 'rewards', label: '8. Recompensas', shortLabel: 'Recompensas', icon: '🏆', category: 'personal' },
  { id: 'inventory', label: '9. Inventario', shortLabel: 'Inventario', icon: '🎒', category: 'personal' },
  { id: 'room', label: '10. Mi Habitación', shortLabel: 'Habitación', icon: '🛏️', category: 'personal' },
  { id: 'stats', label: '11. Estadísticas y Progreso', shortLabel: 'Estadísticas', icon: '📊', category: 'learning' },
  { id: 'tutor', label: '12. Tutor Inteligente', shortLabel: 'Tutor', icon: '🤖', category: 'learning' },
  { id: 'settings', label: '13. Configuración', shortLabel: 'Ajustes', icon: '⚙️', category: 'system' },
  { id: 'logout', label: '14. Cerrar Sesión', shortLabel: 'Salir', icon: '🚪', category: 'system' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  student,
  onOpenTeacherPanel,
  onOpenParentPanel,
  onOpenLogoutModal,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audio.getIsMuted());
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isAllSectionsOpen, setIsAllSectionsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Sync mute and audio preferences
  React.useEffect(() => {
    const unsubscribe = audio.subscribe(() => {
      setIsMuted(audio.getIsMuted());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    audio.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) audio.playPop();
  };

  const handleItemClick = (sectionId: NavigationSection) => {
    if (sectionId === 'logout') {
      onOpenLogoutModal();
    } else {
      audio.playPop();
      onSelectSection(sectionId);
    }
    setIsAllSectionsOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Primary top bar items for quick access
  const primaryNavIds: NavigationSection[] = [
    'home',
    'character',
    'world',
    'games',
    'missions',
    'lessons',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-sky-200/90 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo -> Click to 1. Inicio */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-2 group transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-xl group-hover:scale-115 transition-transform duration-200">💡</span>
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight font-fun text-indigo-950 block leading-tight">
                Eureka<span className="text-sky-600">Lab</span>
              </span>
              <span className="hidden xl:block text-[10px] text-slate-500 font-bold -mt-0.5 font-fun">
                14 Secciones Independientes
              </span>
            </div>
          </button>
        </div>

        {/* Center Primary Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-sky-50/80 p-1 rounded-2xl border border-sky-200/60">
          {primaryNavIds.map((secId) => {
            const item = NAV_ITEMS.find((n) => n.id === secId)!;
            const isActive = activeSection === secId;
            return (
              <button
                key={secId}
                onClick={() => handleItemClick(secId)}
                className={`px-2.5 py-1.5 rounded-xl font-fun font-bold text-xs transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 -translate-y-0.5'
                    : 'text-slate-600 hover:text-indigo-900 hover:bg-white/80'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}

          {/* "Todas las Secciones" Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                audio.playPop();
                setIsAllSectionsOpen(!isAllSectionsOpen);
              }}
              className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isAllSectionsOpen
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-indigo-950 border border-indigo-200'
              }`}
            >
              <span>📑 14 Secciones</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAllSectionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu with all 14 sections */}
            {isAllSectionsOpen && (
              <div className="absolute top-full mt-2 -right-12 w-80 bg-white rounded-3xl p-3 shadow-2xl border-3 border-indigo-200 z-50 animate-scale-in">
                <div className="text-[11px] font-bold uppercase text-indigo-800 font-fun px-2.5 py-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Menú Principal de EDUQUEST</span>
                  <span className="text-[10px] text-slate-400">14 Áreas</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {NAV_ITEMS.map((item, idx) => {
                    const isCurrent = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`p-2 rounded-xl text-left text-xs font-fun font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 hover:translate-x-0.5 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : item.id === 'logout'
                            ? 'hover:bg-rose-50 text-rose-700'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right HUD Controls (Eurekas, Mute, Mobile Toggle, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Eurekas Pill (Click opens Recompensas) */}
          <button
            onClick={() => handleItemClick('rewards')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold text-amber-950 transition cursor-pointer shadow-xs active:scale-95"
            title="Ver recompensas y trofeos"
          >
            <span className="text-sm">🪙</span>
            <span className="font-mono font-black">{student.coins}</span>
          </button>

          {/* Sound & Music Controls Button */}
          <button
            onClick={() => {
              audio.playPop();
              setIsAudioModalOpen(true);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition border active:scale-90 cursor-pointer relative ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700'
            }`}
            title="Centro de Audio y Ambiente Musical (EDUQUEST)"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {audio.getPreferences().musicEnabled && !isMuted && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white">
                ♪
              </span>
            )}
          </button>

          {/* Student Profile Quick Badge (Click opens Mi Personaje) */}
          <button
            onClick={() => handleItemClick('character')}
            className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl text-xs font-fun font-bold text-slate-800 transition cursor-pointer"
            title="Personalizar Mi Personaje 3D"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
              {student.avatar.characterType === 'girl' ? '👧' : student.avatar.characterType === 'robot' ? '🤖' : '👦'}
            </div>
            <span className="truncate max-w-[90px]">{student.name}</span>
          </button>

          {/* Teacher & Admin Portal Access */}
          <button
            onClick={() => {
              audio.playPop();
              onOpenTeacherPanel();
            }}
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100 border border-indigo-200 text-indigo-900 px-2.5 py-1 rounded-xl text-xs font-bold font-fun transition cursor-pointer shadow-xs active:scale-95"
            title="Abrir Panel de Administración y Profesores"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Docente / Admin</span>
          </button>

          {/* Cerrar Sesión (Section 14 Direct Button) */}
          <button
            onClick={onOpenLogoutModal}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition active:scale-90 cursor-pointer"
            title="Cerrar Sesión (Sección 14)"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={() => {
              audio.playPop();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="lg:hidden w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accessible to all 14 sections) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b-2 border-sky-200 shadow-xl px-4 py-4 space-y-3 animate-slide-down max-h-[80vh] overflow-y-auto">
          <div className="text-xs font-bold text-sky-800 font-fun uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
            <span>Las 14 Secciones de EDUQUEST</span>
            <span className="text-[11px] text-slate-500">{student.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`p-2.5 rounded-2xl text-left text-xs font-fun font-bold transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : item.id === 'logout'
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onOpenParentPanel();
                setIsMobileMenuOpen(false);
              }}
              className="text-sky-700 font-bold hover:underline"
            >
              👨‍👩‍👧 Portal Familiar
            </button>
            <button
              onClick={() => {
                onOpenTeacherPanel();
                setIsMobileMenuOpen(false);
              }}
              className="text-amber-800 font-bold hover:underline"
            >
              🔒 Docente (PIN)
            </button>
          </div>
        </div>
      )}

      {/* Audio & Environment Controls Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        student={student}
      />
    </header>
  );
};
