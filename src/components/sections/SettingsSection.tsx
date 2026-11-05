/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, NavigationSection, SchoolGrade, AudioPreferences, AudioRegionId } from '../../types';
import { audio } from '../../services/audioService';
import { storage } from '../../services/storageService';
import { authService } from '../../services/authService';
import { REGIONS_INFO, AudioSettingsModal } from '../AudioSettingsModal';
import {
  Settings,
  ArrowLeft,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  User,
  Shield,
  Save,
  CheckCircle2,
  Radio,
  Sparkles,
  Waves,
  Sliders,
  Play,
  RotateCcw,
  Layers,
  Lock,
} from 'lucide-react';

interface SettingsSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
  onOpenTeacherPanel: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  student,
  onNavigate,
  onStudentUpdated,
  onOpenTeacherPanel,
}) => {
  // Student Profile State
  const [name, setName] = useState<string>(student.name);
  const [lastName, setLastName] = useState<string>(student.lastName);
  const [grade, setGrade] = useState<SchoolGrade>(student.grade);
  const [guardianEmail, setGuardianEmail] = useState<string>(student.guardianEmail || '');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Audio Engine State
  const [audioPrefs, setAudioPrefs] = useState<AudioPreferences>(() => audio.getPreferences());
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // If student has saved audioPreferences, sync to audio engine
    if (student.audioPreferences) {
      audio.applyPreferences(student.audioPreferences);
    }
    setAudioPrefs(audio.getPreferences());

    const unsubscribe = audio.subscribe((newPrefs) => {
      setAudioPrefs({ ...newPrefs });
    });
    return () => unsubscribe();
  }, [student]);

  // Audio change handlers
  const handleToggleMute = () => {
    const next = !audioPrefs.muted;
    audio.setMuted(next);
    if (!next) audio.playPop();
  };

  const handleToggleMusic = () => {
    const next = !audioPrefs.musicEnabled;
    audio.setMusicEnabled(next);
    if (next) audio.playPop();
  };

  const handleToggleSfx = () => {
    const next = !audioPrefs.sfxEnabled;
    audio.setSfxEnabled(next);
    if (next) audio.playPop();
  };

  const handleToggleAmbience = () => {
    const next = !audioPrefs.ambienceEnabled;
    audio.setAmbienceEnabled(next);
    if (next) audio.playPop();
  };

  const handleMasterVolumeChange = (val: number) => {
    audio.setMasterVolume(val);
  };

  const handleMusicVolumeChange = (val: number) => {
    audio.setMusicVolume(val);
  };

  const handleSfxVolumeChange = (val: number) => {
    audio.setSfxVolume(val);
  };

  const handleSelectRegion = (regionId: AudioRegionId) => {
    audio.playRegionExplore();
    audio.setRegion(regionId);
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playActivityComplete();

    const currentAudioPrefs = audio.getPreferences();

    const updatedStudent: Student = {
      ...student,
      name: name.trim() || student.name,
      lastName: lastName.trim() || student.lastName,
      grade,
      guardianEmail: guardianEmail.trim(),
      audioPreferences: currentAudioPrefs,
    };

    storage.upsertStudent(updatedStudent);
    authService.saveStudentProgress(updatedStudent);
    onStudentUpdated();

    setSaveToast('¡Perfil y preferencias de audio guardadas con éxito!');
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-600 via-slate-700 to-indigo-700 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              ⚙️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-fun block">
                Sección 13 • Preferencias y Sistema
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-300">
                Ajustes de EDUQUEST
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Configuración, Audio y Perfil
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Personaliza el sistema de audio regional, efectos sonoros, volumen y datos de tu cuenta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audio.playPop();
              setIsAudioModalOpen(true);
            }}
            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Consola de Audio Avanzada</span>
          </button>

          <button
            onClick={() => {
              audio.playPop();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-md border border-emerald-400 flex items-center gap-2 font-fun font-bold text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Student Profile Form (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-slate-200 shadow-xl space-y-4">
          <h3 className="font-fun font-bold text-lg text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Datos del Estudiante</span>
          </h3>

          <form onSubmit={handleSaveAllSettings} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apellidos</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grado Escolar</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as SchoolGrade)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="3ro">3ro de Primaria</option>
                <option value="4to">4to de Primaria</option>
                <option value="5to">5to de Primaria</option>
                <option value="6to">6to de Primaria</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico del Tutor o Padre
              </label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="padre@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil y Preferencias</span>
            </button>
          </form>

          {/* Security & Access Portals */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <h4 className="font-fun font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Paneles de Supervisión Docente</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consulta las analíticas de aprendizaje real, tiempos de respuesta e índice de acierto mediante PIN.
            </p>
            <button
              onClick={onOpenTeacherPanel}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-fun font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Abrir Panel de Supervisión Docente</span>
            </button>
          </div>
        </div>

        {/* Right Column: Complete Audio & Regional Environment System (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Audio Master Controls */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-sky-200/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fun font-bold text-base text-slate-900">
                    Sistema de Audio y Ambiente de EDUQUEST
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Síntesis Web Audio procedural en tiempo real (0 MB descargados, cero latencia).
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMute}
                className={`px-3 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  audioPrefs.muted
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {audioPrefs.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{audioPrefs.muted ? 'Silencio Total' : 'Audio Activo'}</span>
              </button>
            </div>

            {/* Volume Sliders & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Master Volume */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-500" />
                    Master
                  </span>
                  <span className="font-mono text-sky-600">
                    {Math.round(audioPrefs.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioPrefs.masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Music Volume & Toggle */}
              <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3 text-sky-600" />
                    Música
                  </span>
                  <button
                    onClick={handleToggleMusic}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${
                      audioPrefs.musicEnabled
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {audioPrefs.musicEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  disabled={!audioPrefs.musicEnabled}
                  value={audioPrefs.musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* SFX Volume & Toggle */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Efectos
                  </span>
                  <button
                    onClick={handleToggleSfx}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${
                      audioPrefs.sfxEnabled
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {audioPrefs.sfxEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  disabled={!audioPrefs.sfxEnabled}
                  value={audioPrefs.sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Ambient Ocean Waves Toggle */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-fun font-bold text-xs text-emerald-950 block">
                    Ambiente Marino Subacuático
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Ondas procedurales con filtrado pasa-bajos
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleAmbience}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  audioPrefs.ambienceEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {audioPrefs.ambienceEnabled ? 'Ambiente Activo' : 'Desactivado'}
              </button>
            </div>
          </div>

          {/* Regional Ambient Music Selector */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-indigo-200/90 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fun font-bold text-base text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  <span>Música Ambiental por Región</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cada bioma submarino tiene su propia atmósfera musical única.
                </p>
              </div>

              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                Región Activa: {audioPrefs.currentRegion.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {REGIONS_INFO.map((reg) => {
                const isSelected = audioPrefs.currentRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => handleSelectRegion(reg.id)}
                    className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-400 shadow-sm ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{reg.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-fun font-bold text-xs text-slate-900 truncate">
                          {reg.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full">
                            En vivo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {reg.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Sound Effects Section */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-amber-200/90 shadow-xl space-y-3">
            <div>
              <h3 className="font-fun font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Configurar y Probar Sonidos por Separado</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Comprueba la síntesis de cada efecto requerido por el sistema de juego:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => audio.playActivityComplete()}
                className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-sky-900 block font-fun">
                  ✅ Actividad Completa
                </span>
                <span className="text-[9px] text-sky-600">playActivityComplete</span>
              </button>

              <button
                onClick={() => audio.playRewardClaim()}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-amber-900 block font-fun">
                  🎁 Obtener Recompensa
                </span>
                <span className="text-[9px] text-amber-600">playRewardClaim</span>
              </button>

              <button
                onClick={() => audio.playLevelUp()}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-purple-900 block font-fun">
                  ⭐ Subir de Nivel
                </span>
                <span className="text-[9px] text-purple-600">playLevelUp</span>
              </button>

              <button
                onClick={() => audio.playNotification()}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-emerald-900 block font-fun">
                  🔔 Notificación
                </span>
                <span className="text-[9px] text-emerald-600">playNotification</span>
              </button>

              <button
                onClick={() => audio.playCharacterInteract()}
                className="p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-pink-900 block font-fun">
                  🤖 Interacción Personaje
                </span>
                <span className="text-[9px] text-pink-600">playCharacterInteract</span>
              </button>

              <button
                onClick={() => audio.playRegionExplore()}
                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left cursor-pointer transition active:scale-95"
              >
                <span className="text-[10px] font-bold text-indigo-900 block font-fun">
                  🧭 Explorar Región
                </span>
                <span className="text-[9px] text-indigo-600">playRegionExplore</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Audio Modal */}
      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        student={student}
        onPreferencesUpdated={onStudentUpdated}
      />
    </div>
  );
};
