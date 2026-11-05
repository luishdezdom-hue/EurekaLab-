/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Student, NavigationSection } from './types';
import { storage } from './services/storageService';
import { authService } from './services/authService';
import { testFirestoreConnection } from './services/firebase';
import { audio } from './services/audioService';
import { Navbar } from './components/Navbar';
import { StudentAuthView } from './components/StudentAuthView';
import { MyCharacterView } from './components/MyCharacterView';
import { HomeSection } from './components/sections/HomeSection';
import { WorldSection } from './components/sections/WorldSection';
import { GamesSection } from './components/sections/GamesSection';
import { MissionsSection } from './components/sections/MissionsSection';
import { LessonsSection } from './components/sections/LessonsSection';
import { EvaluacionesSection } from './components/sections/EvaluacionesSection';
import { RewardsSection } from './components/sections/RewardsSection';
import { InventorySection } from './components/sections/InventorySection';
import { RoomSection } from './components/sections/RoomSection';
import { StatsSection } from './components/sections/StatsSection';
import { TutorSection } from './components/sections/TutorSection';
import { SettingsSection } from './components/sections/SettingsSection';
import { LogoutModal } from './components/modals/LogoutModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { AssistantChatModal } from './components/AssistantChatModal';
import { X } from 'lucide-react';

export default function App() {
  // Authentication & active student state
  const [student, setStudent] = useState<Student | null>(() => authService.getCurrentStudent());
  const [welcomeGreeting, setWelcomeGreeting] = useState<string | null>(null);

  // 14 Independent Navigation Sections
  const [activeSection, setActiveSection] = useState<NavigationSection>('home');
  const [targetGame, setTargetGame] = useState<'math' | 'code' | 'reading' | 'science' | 'circuits' | 'duel' | null>(null);
  const [targetLevelId, setTargetLevelId] = useState<number | undefined>(undefined);

  // Modal open states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isTeacherPanelOpen, setIsTeacherPanelOpen] = useState<boolean>(false);
  const [isParentPanelOpen, setIsParentPanelOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Test Firestore connection on app mount & listen to Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = authService.onStudentAuthChanged((currentStudent) => {
      setStudent(currentStudent);
      if (currentStudent) {
        storage.upsertStudent(currentStudent);
        if (currentStudent.audioPreferences) {
          audio.applyPreferences(currentStudent.audioPreferences);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle successful login or registration
  const handleAuthenticated = (authenticatedStudent: Student, isNewRegistration = false) => {
    setStudent(authenticatedStudent);
    storage.upsertStudent(authenticatedStudent);

    if (authenticatedStudent.audioPreferences) {
      audio.applyPreferences(authenticatedStudent.audioPreferences);
    }

    // Personalized Welcome greeting with audio notification
    const greetingText = `¡Hola, ${authenticatedStudent.name}! ¿Listo para continuar tu aventura?`;
    setWelcomeGreeting(greetingText);
    audio.playNotification();

    confetti({
      particleCount: isNewRegistration ? 80 : 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Auto-hide greeting toast after 6 seconds
    setTimeout(() => {
      setWelcomeGreeting(null);
    }, 6000);
  };

  // Secure Logout
  const handleLogout = async () => {
    await authService.logout();
    setStudent(null);
    setWelcomeGreeting(null);
    setActiveSection('home');
    setTargetGame(null);
    setTargetLevelId(undefined);
    setIsLogoutModalOpen(false);
    setIsTeacherPanelOpen(false);
    setIsParentPanelOpen(false);
  };

  // Refresh student data from storage and sync to Firestore
  const handleRefreshStudent = () => {
    if (!student) return;
    const latest = storage.getActiveStudent();
    if (latest && latest.id === student.id) {
      setStudent({ ...latest });
      authService.saveStudentProgress(latest);
    }
  };

  // Universal Navigation Handler across all 14 independent sections
  const handleNavigate = (
    section: NavigationSection,
    levelId?: number,
    game?: 'math' | 'code' | 'reading' | 'science' | 'circuits' | 'duel'
  ) => {
    if (section === 'logout') {
      setIsLogoutModalOpen(true);
      return;
    }

    if (game !== undefined) {
      setTargetGame(game);
    }
    if (levelId !== undefined) {
      setTargetLevelId(levelId);
    }

    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // GATEKEEPER: If no student is authenticated, show the login/register screen.
  // =========================================================================
  if (!student) {
    return (
      <div className="min-h-screen relative flex flex-col font-sans select-none">
        <StudentAuthView
          onAuthenticated={handleAuthenticated}
          onOpenTeacherDirect={() => setIsTeacherPanelOpen(true)}
        />

        {/* Teacher Panel accessible via PIN for educators even before student logs in */}
        {isTeacherPanelOpen && (
          <TeacherDashboard
            onClose={() => setIsTeacherPanelOpen(false)}
            onStudentSelected={() => {
              setIsTeacherPanelOpen(false);
            }}
            onRefresh={handleRefreshStudent}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED VIDEO GAME WORLD WITH 14 INDEPENDENT SECTIONS
  // =========================================================================
  return (
    <div className="min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden">
      {/* 
        MAIN UNDERSEA BIKINI BOTTOM ATMOSPHERE BACKGROUND
      */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-fixed pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `url('/assets/spongebob_background.jpg')`,
        }}
      />

      {/* Gentle translucent sunlight veil for readability */}
      <div className="fixed inset-0 -z-10 bg-sky-900/10 backdrop-brightness-105 pointer-events-none" />

      {/* Floating background ambient bubble effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute left-[10%] bottom-0 text-2xl opacity-40 animate-bubble-slow select-none">
          🫧
        </div>
        <div
          className="absolute left-[35%] bottom-0 text-xl opacity-30 animate-bubble-slow select-none"
          style={{ animationDelay: '2.5s' }}
        >
          🫧
        </div>
        <div
          className="absolute left-[70%] bottom-0 text-3xl opacity-35 animate-bubble-slow select-none"
          style={{ animationDelay: '4.8s' }}
        >
          🫧
        </div>
        <div
          className="absolute left-[88%] bottom-0 text-lg opacity-40 animate-bubble-slow select-none"
          style={{ animationDelay: '1.2s' }}
        >
          🫧
        </div>
      </div>

      {/* Top Navigation Bar with Quick Links and Full 14-Section Drawer */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={handleNavigate}
        student={student}
        onOpenTeacherPanel={() => setIsTeacherPanelOpen(true)}
        onOpenParentPanel={() => setIsParentPanelOpen(true)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Personalized Welcome Banner upon Login */}
      {welcomeGreeting && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl border-2 border-white/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🌟
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200 block font-fun">
                  Sesión Individual Iniciada • {student.username ? `@${student.username}` : `Grado ${student.grade}`}
                </span>
                <h3 className="text-sm sm:text-base font-black font-fun tracking-tight text-white leading-tight">
                  {welcomeGreeting}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setWelcomeGreeting(null)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Independent Section Router */}
      <main key={activeSection} className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20 animate-fade-in">
        {/* 1. Inicio */}
        {activeSection === 'home' && (
          <HomeSection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 2. Mi Personaje */}
        {activeSection === 'character' && (
          <MyCharacterView
            student={student}
            onStudentUpdated={handleRefreshStudent}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* 3. Mundo o Isla */}
        {activeSection === 'world' && (
          <WorldSection
            student={student}
            onNavigate={handleNavigate}
            onPlayLevel={(subject, levelId) => {
              setTargetGame(subject);
              setTargetLevelId(levelId);
              setActiveSection('games');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 4. Juegos (Apartado independiente de lecciones) */}
        {activeSection === 'games' && (
          <GamesSection
            student={student}
            initialGame={targetGame}
            initialLevelId={targetLevelId}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 5. Misiones */}
        {activeSection === 'missions' && (
          <MissionsSection
            student={student}
            onNavigate={handleNavigate}
            onPlayMission={(subject, levelId) => {
              setTargetGame(subject);
              setTargetLevelId(levelId);
              setActiveSection('games');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 6. Academia o Lecciones */}
        {activeSection === 'lessons' && (
          <LessonsSection
            student={student}
            onNavigate={handleNavigate}
            onGoToGame={(subject) => {
              setTargetGame(subject);
              setTargetLevelId(undefined);
              setActiveSection('games');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 7. Evaluaciones */}
        {activeSection === 'evaluations' && (
          <EvaluacionesSection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 8. Recompensas */}
        {activeSection === 'rewards' && (
          <RewardsSection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 9. Inventario */}
        {activeSection === 'inventory' && (
          <InventorySection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 10. Mi Habitación */}
        {activeSection === 'room' && (
          <RoomSection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
          />
        )}

        {/* 11. Estadísticas y Progreso */}
        {activeSection === 'stats' && (
          <StatsSection
            student={student}
            onNavigate={handleNavigate}
            onOpenTeacherPanel={() => setIsTeacherPanelOpen(true)}
            onOpenParentPanel={() => setIsParentPanelOpen(true)}
          />
        )}

        {/* 12. Tutor Inteligente */}
        {activeSection === 'tutor' && (
          <TutorSection
            student={student}
            onNavigate={handleNavigate}
          />
        )}

        {/* 13. Configuración */}
        {activeSection === 'settings' && (
          <SettingsSection
            student={student}
            onNavigate={handleNavigate}
            onStudentUpdated={handleRefreshStudent}
            onOpenTeacherPanel={() => setIsTeacherPanelOpen(true)}
          />
        )}
      </main>

      {/* 14. Cerrar Sesión Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        studentName={student.name}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleLogout}
      />

      {/* Teacher Dashboard Accessible via PIN */}
      {isTeacherPanelOpen && (
        <TeacherDashboard
          onClose={() => setIsTeacherPanelOpen(false)}
          onStudentSelected={() => {
            setIsTeacherPanelOpen(false);
          }}
          onRefresh={handleRefreshStudent}
        />
      )}

      {/* Parent Dashboard */}
      {isParentPanelOpen && (
        <ParentDashboard
          student={student}
          onClose={() => setIsParentPanelOpen(false)}
        />
      )}

      {/* Floating AI Virtual Assistant (EurekaBot) Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            audio.playPop();
            setIsAssistantOpen(true);
          }}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl border-2 border-white/70 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-sky-400/30"
          title="Abrir Asistente Virtual EurekaBot (IA)"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl">
            🤖
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-fun font-black leading-tight tracking-wide">
              EurekaBot AI
            </span>
            <span className="block text-[10px] text-sky-100 font-medium leading-none">
              ¿Dudas o ayuda?
            </span>
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        </button>
      </div>

      {/* Modern AI Virtual Assistant Chat Modal */}
      <AssistantChatModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        student={student}
        currentSection={activeSection}
        activeGame={targetGame}
        activeLevelId={targetLevelId}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
