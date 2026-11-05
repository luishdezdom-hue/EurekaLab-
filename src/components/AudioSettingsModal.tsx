/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, AudioPreferences, AudioRegionId } from '../types';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import { GameButton } from './ui/GameButton';
import {
  Volume2,
  VolumeX,
  Volume1,
  Music,
  Radio,
  Sparkles,
  Waves,
  Check,
  X,
  Sliders,
  Bell,
  Award,
  Compass,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onPreferencesUpdated?: () => void;
}

export const REGIONS_INFO: {
  id: AudioRegionId;
  name: string;
  icon: string;
  desc: string;
  mood: string;
}[] = [
  {
    id: 'reef',
    name: 'Arrecife de Coral',
    icon: '🏝️',
    desc: 'Aguas cálidas y soleadas',
    mood: 'Marimbas pentatónicas alegres y luminosas',
  },
  {
    id: 'kelp',
    name: 'Bosque de Kelp',
    icon: '🎋',
    desc: 'Rascacielos de algas submarinas',
    mood: 'Pads etéreos flotantes y corrientes misteriosas',
  },
  {
    id: 'abyss',
    name: 'Fosa Abisal',
    icon: '🌊',
    desc: 'Profundidades oscuras a 3,000m',
    mood: 'Drones subgraves profundos y chimes de cristal',
  },
  {
    id: 'ruins',
    name: 'Templo Sumergido',
    icon: '🏛️',
    desc: 'Ruinas antiguas y biblioteca marina',
    mood: 'Campanas místicas dóricas con resonancia ancestral',
  },
  {
    id: 'lab',
    name: 'Laboratorio Nautilus',
    icon: '🔬',
    desc: 'Cámara de investigación tecnológica',
    mood: 'Sintetizador rítmico tecnológico y pulsos de energía',
  },
];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  student,
  onPreferencesUpdated,
}) => {
  const [prefs, setPrefs] = useState<AudioPreferences>(() => audio.getPreferences());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync state with audio engine
  useEffect(() => {
    setPrefs(audio.getPreferences());
    const unsubscribe = audio.subscribe((updated) => {
      setPrefs({ ...updated });
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setMasterVolume(val);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setMusicVolume(val);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setSfxVolume(val);
  };

  const handleToggleMusic = () => {
    audio.playPop();
    audio.setMusicEnabled(!prefs.musicEnabled);
  };

  const handleToggleSfx = () => {
    audio.playPop();
    audio.setSfxEnabled(!prefs.sfxEnabled);
  };

  const handleToggleAmbience = () => {
    audio.playPop();
    audio.setAmbienceEnabled(!prefs.ambienceEnabled);
  };

  const handleSelectRegion = (regionId: AudioRegionId) => {
    audio.setRegion(regionId);
  };

  const handleSaveToProfile = () => {
    audio.playRewardClaim();
    if (student) {
      const updated = {
        ...student,
        audioPreferences: { ...prefs },
      };
      storage.upsertStudent(updated);
      if (onPreferencesUpdated) onPreferencesUpdated();
    }

    setSaveToast('¡Preferencias de audio guardadas con éxito!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-md border-3 border-sky-300 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 text-white flex items-center justify-center text-xl shadow-md">
              🎵
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block font-fun">
                Ajustes Sonoros • EDUQUEST
              </span>
              <h2 className="text-lg sm:text-xl font-black font-fun text-slate-900 leading-tight">
                Centro de Audio y Ambiente Musical
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {saveToast && (
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-md border border-emerald-400 flex items-center gap-2 font-fun font-bold text-xs animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* 1. MASTER VOLUME */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prefs.masterVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-500" />
                ) : prefs.masterVolume < 0.5 ? (
                  <Volume1 className="w-4 h-4 text-sky-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                )}
                <span className="font-fun font-bold text-xs text-slate-800">
                  Volumen General (Master)
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-indigo-900">
                {Math.round(prefs.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.masterVolume}
              onChange={handleMasterVolumeChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 2. CHANNELS: MUSIC & SFX SLIDERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Music Channel */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-sky-600" />
                  <span className="font-fun font-bold text-xs text-slate-800">
                    Música Ambiental
                  </span>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-fun font-bold transition cursor-pointer ${
                    prefs.musicEnabled
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {prefs.musicEnabled ? 'Activada' : 'Desactivada'}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Volumen música</span>
                  <span>{Math.round(prefs.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.musicVolume}
                  onChange={handleMusicVolumeChange}
                  disabled={!prefs.musicEnabled}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                />
              </div>
            </div>

            {/* SFX Channel */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-fun font-bold text-xs text-slate-800">
                    Efectos de Sonido (SFX)
                  </span>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-fun font-bold transition cursor-pointer ${
                    prefs.sfxEnabled
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {prefs.sfxEnabled ? 'Activados' : 'Desactivados'}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Volumen efectos</span>
                  <span>{Math.round(prefs.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prefs.sfxVolume}
                  onChange={handleSfxVolumeChange}
                  disabled={!prefs.sfxEnabled}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {/* Continuous Underwater Ambience Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🫧</span>
              <div>
                <span className="font-fun font-bold text-xs text-slate-900 block">
                  Ambiente Marino Continuo (Corrientes y burbujas)
                </span>
                <span className="text-[11px] text-slate-500">
                  Suave corriente submarina estéreo en segundo plano
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleAmbience}
              className={`px-3 py-1.5 rounded-xl text-xs font-fun font-bold transition cursor-pointer ${
                prefs.ambienceEnabled
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {prefs.ambienceEnabled ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          {/* 3. REGIONAL AMBIENT MUSIC SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-fun font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Música Ambiental por Región Submarina</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                Región Actual: {REGIONS_INFO.find((r) => r.id === prefs.currentRegion)?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REGIONS_INFO.map((r) => {
                const isActive = prefs.currentRegion === r.id;

                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRegion(r.id)}
                    className={`p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left flex items-start gap-2.5 ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{r.icon}</span>
                    <div className="overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-fun font-bold text-xs text-slate-900 truncate">
                          {r.name}
                        </h4>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-indigo-700 font-semibold block truncate">
                        {r.desc}
                      </span>
                      <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                        {r.mood}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. INDIVIDUAL SOUND TEST CONSOLE */}
          <div className="space-y-2.5">
            <span className="font-fun font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Probar Sonidos del Sistema por Separado</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => audio.playActivityComplete()}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🎯</span>
                <span className="truncate">Completar Actividad</span>
              </button>

              <button
                onClick={() => audio.playRewardClaim()}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🪙</span>
                <span className="truncate">Obtener Recompensa</span>
              </button>

              <button
                onClick={() => audio.playLevelUp()}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🌟</span>
                <span className="truncate">Subir de Nivel</span>
              </button>

              <button
                onClick={() => audio.playNotification()}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🔔</span>
                <span className="truncate">Notificación</span>
              </button>

              <button
                onClick={() => audio.playCharacterInteract()}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🗣️</span>
                <span className="truncate">Personaje</span>
              </button>

              <button
                onClick={() => audio.playRegionExplore()}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-950 font-fun font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🗺️</span>
                <span className="truncate">Explorar Región</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            Audio procedural sintetizado en Web Audio API • 0 MB de descarga.
          </p>

          <div className="flex items-center gap-2">
            <GameButton
              variant="secondary"
              size="sm"
              onClick={() => {
                audio.playPop();
                onClose();
              }}
            >
              Cerrar
            </GameButton>

            <GameButton
              variant="primary"
              size="sm"
              onClick={handleSaveToProfile}
            >
              Guardar Preferencias
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};
