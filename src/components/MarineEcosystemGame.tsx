import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { EcosystemMission, OrganismItem, Student } from '../types';
import { ECOSYSTEM_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import { GameButton } from './ui/GameButton';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
  Lock,
  ArrowRight,
  Volume2,
  Waves,
  Sun,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Award,
  Play,
  Flame,
  Info,
} from 'lucide-react';

interface MarineEcosystemGameProps {
  student: Student;
  onStudentUpdated: () => void;
  initialLevelId?: number;
}

export const MarineEcosystemGame: React.FC<MarineEcosystemGameProps> = ({
  student,
  onStudentUpdated,
  initialLevelId,
}) => {
  // Current unlocked level for student in Ciencias (defaults to 1 if not yet recorded)
  const unlockedLevel = student.progress?.ciencias || 1;

  // Active level state (only unlocked or passed levels can be accessed)
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      return initialLevelId;
    }
    return Math.min(unlockedLevel, ECOSYSTEM_MISSIONS.length);
  });

  useEffect(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      setCurrentLevelId(initialLevelId);
    }
  }, [initialLevelId, unlockedLevel]);

  const mission: EcosystemMission =
    ECOSYSTEM_MISSIONS.find((m) => m.id === currentLevelId) || ECOSYSTEM_MISSIONS[0];

  // Placed organisms in each slot: { slotId: organismId }
  const [placedOrganisms, setPlacedOrganisms] = useState<Record<string, string>>({});
  const [selectedOrganismId, setSelectedOrganismId] = useState<string | null>(null);

  // Simulation & feedback state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [ecoBalanceScore, setEcoBalanceScore] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'Organiza los seres vivos en la red trófica y presiona "Simular Ciclo Ecológico".'
  );
  const [feedbackType, setFeedbackType] = useState<'info' | 'error' | 'success'>('info');

  // Pedagogical metrics
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<'aquarium' | 'pyramid' | 'facts'>('aquarium');

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when mission changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    setPlacedOrganisms({});
    setSelectedOrganismId(null);
    setIsSimulating(false);
    setSimulationStep(-1);
    setEcoBalanceScore(0);
    setIsSuccess(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setAttemptsCount(0);
    setStartTime(Date.now());
    setFeedbackType('info');
    setFeedbackMessage(
      'Organiza los seres vivos en la red trófica y presiona "Simular Ciclo Ecológico".'
    );
  }, [mission]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    };
  }, []);

  // Handle organism placement into a specific slot
  const handleAssignToSlot = (slotId: string) => {
    if (!selectedOrganismId) return;

    audio.playPieceDrop();
    setPlacedOrganisms((prev) => {
      const updated = { ...prev };
      // If organism was placed in another slot, unassign it
      Object.keys(updated).forEach((k) => {
        if (updated[k] === selectedOrganismId) {
          delete updated[k];
        }
      });
      updated[slotId] = selectedOrganismId;
      return updated;
    });

    setSelectedOrganismId(null);
  };

  const handleRemoveFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playPop();
    setPlacedOrganisms((prev) => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  // Run the ecological simulation test
  const handleSimulateEcosystem = () => {
    if (isSimulating) return;

    // Check that all required slots are filled
    const allFilled = mission.slots.every((slot) => placedOrganisms[slot.id]);
    if (!allFilled) {
      audio.playMismatch();
      setFeedbackType('error');
      setFeedbackMessage('Debes asignar un organismo en cada uno de los niveles tróficos del hábitat.');
      return;
    }

    setIsSimulating(true);
    setSimulationStep(0);
    audio.playPop();
    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    // Step-by-step visual energy flow through the chain
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);
      audio.playPop();

      if (step >= mission.slots.length) {
        clearInterval(interval);
        finalizeSimulation(newAttempts);
      }
    }, 700);
  };

  const finalizeSimulation = (newAttempts: number) => {
    setIsSimulating(false);
    setSimulationStep(-1);

    // Validate each slot against mission correctOrganismId
    let correctCount = 0;
    const mistakes: string[] = [];

    mission.slots.forEach((slot) => {
      const assignedId = placedOrganisms[slot.id];
      if (assignedId === slot.correctOrganismId) {
        correctCount++;
      } else {
        const assignedOrg = mission.availableOrganisms.find((o) => o.id === assignedId);
        mistakes.push(`En "${slot.roleLabel}", ${assignedOrg ? assignedOrg.name : 'el organismo'} no encaja en este nicho.`);
      }
    });

    const isAllCorrect = correctCount === mission.slots.length;
    const balancePercent = Math.round((correctCount / mission.slots.length) * 100);
    setEcoBalanceScore(balancePercent);

    if (isAllCorrect) {
      audio.playBalanceSuccess();
      audio.playActivityComplete();
      audio.playVictoryFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#38bdf8', '#f59e0b'],
      });

      setIsSuccess(true);
      setFeedbackType('success');
      setFeedbackMessage(
        `¡Equilibrio Ecológico del 100%! La energía solar fluye sin pérdidas destructivas. ${mission.explanation}`
      );

      // Mastery calculation
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      let masteryScore = 100;
      if (newAttempts > 2) masteryScore -= (newAttempts - 2) * 8;
      if (hintsUsedCount > 0) masteryScore -= hintsUsedCount * 10;
      if (masteryScore < 75) masteryScore = 75;

      storage.recordProgress(student.id, 'ciencias', mission.id, {
        score: 100,
        attempts: newAttempts,
        hintsUsed: hintsUsedCount,
        timeSpentSeconds: elapsedSeconds,
        realLearningMastery: masteryScore,
      });

      onStudentUpdated();

      if (mission.id < ECOSYSTEM_MISSIONS.length) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNextLevel();
        }, 3000);
      }
    } else {
      audio.playMismatch();
      setFeedbackType('error');
      setFeedbackMessage(
        `Desbalance trófico (${balancePercent}% de equilibrio). ${mistakes[0] || 'Revisa la relación entre productores y consumidores.'}`
      );
    }
  };

  const handleNextLevel = () => {
    if (mission.id < ECOSYSTEM_MISSIONS.length) {
      setCurrentLevelId(mission.id + 1);
    }
  };

  const handleSelectLevel = (levelId: number) => {
    if (levelId <= unlockedLevel) {
      audio.playPop();
      setCurrentLevelId(levelId);
    } else {
      audio.playBuzzer();
    }
  };

  const handleResetSlots = () => {
    audio.playPop();
    setPlacedOrganisms({});
    setSelectedOrganismId(null);
    setIsSuccess(false);
    setEcoBalanceScore(0);
    setFeedbackType('info');
    setFeedbackMessage('Ranuras limpiadas. Selecciona un organismo y haz clic en una ranura para ubicarlo.');
  };

  const handleNarrateConcept = () => {
    audio.playPop();
    audio.speak(`${mission.title}. ${mission.subsystemTitle}. ${mission.explanation}`);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-emerald-300 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-100/60 via-teal-50/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-black font-fun uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ciencias Naturales • Biología Marina</span>
              </span>
              <span className="text-[11px] font-bold font-fun px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Grado {mission.grade}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Misión {mission.id} de {ECOSYSTEM_MISSIONS.length}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-fun text-slate-900 tracking-tight flex items-center gap-2">
              <span>🧪</span>
              <span>{mission.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {mission.subsystemTitle}
            </p>
          </div>

          {/* Level Selector Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {ECOSYSTEM_MISSIONS.map((m) => {
              const isLocked = m.id > unlockedLevel;
              const isCurrent = m.id === mission.id;
              const isCompleted = m.id < unlockedLevel || (isCurrent && isSuccess);

              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectLevel(m.id)}
                  disabled={isLocked}
                  className={`w-9 h-9 rounded-xl font-fun font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400 -translate-y-0.5'
                      : isCompleted
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  title={isLocked ? `Bloqueado (Supera el Nivel ${m.id - 1})` : m.title}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    m.id
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* View mode tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('aquarium');
              }}
              className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'aquarium'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🐠 Hábitat Acuático</span>
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('pyramid');
              }}
              className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pyramid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🔺 Pirámide Trófica</span>
            </button>
            <button
              onClick={() => {
                audio.playPop();
                setActiveTab('facts');
              }}
              className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'facts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>🔬 Fichas de Especies</span>
            </button>
          </div>

          {/* Environmental Factor badge */}
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-xl">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{mission.environmentalCondition.name}:</span>
            <span className="font-semibold text-emerald-700">
              {mission.environmentalCondition.valueLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Play Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: Interactive Aquatic Biosphere Chamber (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-gradient-to-b from-sky-900 via-teal-900 to-slate-950 rounded-3xl p-5 border-3 border-teal-500/50 shadow-2xl relative overflow-hidden text-white min-h-[420px] flex flex-col justify-between">
            {/* Ambient Animated Sunrays and Water Highlights */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/20 via-sky-600/10 to-transparent pointer-events-none" />
            <div className="absolute top-2 left-6 text-xl opacity-20 animate-bubble-slow pointer-events-none select-none">
              🫧
            </div>
            <div className="absolute top-8 right-12 text-2xl opacity-25 animate-bubble-slow pointer-events-none select-none" style={{ animationDelay: '2s' }}>
              🫧
            </div>

            {/* Chamber Topbar */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-fun font-bold uppercase tracking-wider text-teal-200">
                  Cámara de Simulación Biológica • Tanque Activo
                </span>
              </div>

              {/* Equilibrium Meter Gauge */}
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-teal-500/40">
                <span className="text-[11px] font-fun text-slate-300 font-bold">Equilibrio:</span>
                <span
                  className={`font-mono text-xs font-black ${
                    ecoBalanceScore === 100
                      ? 'text-emerald-400'
                      : ecoBalanceScore > 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {ecoBalanceScore}%
                </span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${ecoBalanceScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Interactive Canvas: Aquarium or Pyramid view */}
            <div className="relative z-10 my-6">
              {activeTab === 'aquarium' && (
                <div className="space-y-4">
                  <p className="text-xs text-sky-200/90 text-center font-medium max-w-xl mx-auto">
                    Arrastra o haz clic en los organismos del estante inferior para ubicarlos en cada ranura del ciclo vital.
                  </p>

                  {/* Visual Food Web Slots in Horizontal Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mission.slots.map((slot, index) => {
                      const assignedId = placedOrganisms[slot.id];
                      const assignedOrg = mission.availableOrganisms.find((o) => o.id === assignedId);
                      const isSimActive = simulationStep === index + 1;
                      const isSlotCorrect = isSuccess && assignedId === slot.correctOrganismId;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => handleAssignToSlot(slot.id)}
                          className={`rounded-2xl p-3 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px] relative ${
                            isSimActive
                              ? 'border-emerald-400 bg-emerald-500/30 scale-105 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300'
                              : isSlotCorrect
                              ? 'border-emerald-400 bg-emerald-950/70 shadow-md shadow-emerald-500/20'
                              : assignedOrg
                              ? 'border-teal-400 bg-slate-900/80 hover:border-teal-300'
                              : 'border-dashed border-sky-400/50 bg-sky-950/40 hover:bg-sky-900/50 hover:border-sky-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-fun">
                            <span className="text-teal-300 font-bold truncate">
                              {slot.roleLabel.split(':')[0]}
                            </span>
                            {assignedOrg && !isSuccess && (
                              <button
                                onClick={(e) => handleRemoveFromSlot(slot.id, e)}
                                className="text-rose-400 hover:text-rose-200 font-black p-0.5 rounded cursor-pointer"
                                title="Quitar organismo"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {assignedOrg ? (
                            <div className="my-auto py-2 text-center animate-in zoom-in-75 duration-200">
                              <div className="text-4xl filter drop-shadow-md animate-float-bob">
                                {assignedOrg.icon}
                              </div>
                              <h4 className="font-fun font-bold text-xs text-white mt-1.5 leading-tight">
                                {assignedOrg.name}
                              </h4>
                              <span className="text-[10px] text-teal-300 font-mono block">
                                {assignedOrg.biomassUnits}u biomasa
                              </span>
                            </div>
                          ) : (
                            <div className="my-auto text-center py-4">
                              <div className="w-10 h-10 rounded-full border border-dashed border-sky-400/60 mx-auto flex items-center justify-center text-sky-300 text-lg">
                                +
                              </div>
                              <span className="text-[11px] text-sky-300/80 font-fun font-medium block mt-2">
                                {selectedOrganismId ? 'Clic para ubicar' : 'Ranura Vacía'}
                              </span>
                            </div>
                          )}

                          <div className="pt-1 border-t border-white/10 text-[10px] text-slate-300 font-medium truncate">
                            {slot.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'pyramid' && (
                <div className="space-y-3 max-w-lg mx-auto py-2">
                  <h4 className="text-center font-fun font-bold text-xs text-teal-200">
                    Estructura Piramidal de Energía (Ley del 10% de Lindeman)
                  </h4>
                  <div className="space-y-2">
                    {mission.slots
                      .slice()
                      .reverse()
                      .map((slot, idx) => {
                        const assignedId = placedOrganisms[slot.id];
                        const assignedOrg = mission.availableOrganisms.find((o) => o.id === assignedId);
                        const widths = ['w-1/3', 'w-1/2', 'w-3/4', 'w-full'];
                        const widthClass = widths[idx % widths.length];

                        return (
                          <div
                            key={slot.id}
                            className={`${widthClass} mx-auto bg-teal-800/60 border border-teal-400/40 rounded-xl p-2.5 flex items-center justify-between text-xs transition`}
                          >
                            <span className="font-fun font-bold text-teal-200">
                              {slot.roleLabel.split(':')[0]}
                            </span>
                            <span className="font-fun font-bold text-white flex items-center gap-1.5">
                              {assignedOrg ? (
                                <>
                                  <span>{assignedOrg.icon}</span>
                                  <span>{assignedOrg.name}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic font-normal">Sin asignar</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {activeTab === 'facts' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {mission.availableOrganisms.map((org) => (
                    <div
                      key={org.id}
                      className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{org.icon}</span>
                        <div>
                          <h5 className="font-fun font-bold text-xs text-white">{org.name}</h5>
                          <span className="text-[10px] text-teal-400 italic">
                            {org.scientificName}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {org.scientificFact}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chamber Bottom Status Bar */}
            <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-teal-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                {feedbackType === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : feedbackType === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-teal-400 shrink-0" />
                )}
                <span className="text-xs text-slate-200 font-medium truncate">
                  {feedbackMessage}
                </span>
              </div>

              <button
                onClick={handleNarrateConcept}
                className="p-2 rounded-xl bg-teal-800/50 hover:bg-teal-700/60 text-teal-200 transition cursor-pointer shrink-0"
                title="Escuchar explicación científica"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Shelf of Available Organisms */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border-2 border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-fun font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🧫</span>
                <span>Laboratorio de Especies Marinas (Selecciona para Asignar)</span>
              </span>
              <button
                onClick={handleResetSlots}
                className="text-xs font-fun font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar Ranuras</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {mission.availableOrganisms.map((org) => {
                const isSelected = selectedOrganismId === org.id;
                const isPlaced = Object.values(placedOrganisms).includes(org.id);

                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      audio.playPop();
                      setSelectedOrganismId(isSelected ? null : org.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-300 -translate-y-0.5'
                        : isPlaced
                        ? 'border-slate-200 bg-slate-50/70 opacity-75'
                        : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/40'
                    }`}
                  >
                    <span className="text-3xl shrink-0">{org.icon}</span>
                    <div className="overflow-hidden">
                      <h4 className="font-fun font-bold text-xs text-slate-900 truncate">
                        {org.name}
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                        {org.roleLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {org.biomassUnits}u
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Mission Controls & Real Learning Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Action Launch Panel */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border-3 border-emerald-300 shadow-xl space-y-4">
            <h3 className="font-fun font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Control de Simulación</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleSimulateEcosystem}
                disabled={isSimulating}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-fun font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Simulando Red Trófica...' : 'Simular Ciclo Ecológico'}</span>
              </button>

              {isSuccess && mission.id < ECOSYSTEM_MISSIONS.length && (
                <button
                  onClick={handleNextLevel}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer animate-pulse"
                >
                  <span>Avanzar al Nivel {mission.id + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Scientific Tip Card */}
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-fun font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tip Oceanográfico</span>
                </span>
                {!showHint && (
                  <button
                    onClick={() => {
                      audio.playPop();
                      setShowHint(true);
                      setHintsUsedCount((c) => c + 1);
                    }}
                    className="text-[10px] text-emerald-700 underline font-semibold cursor-pointer"
                  >
                    Ver Pista
                  </button>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                {showHint ? mission.conceptTip : 'Consulta la pista si necesitas ayuda con el orden trófico.'}
              </p>
            </div>

            {/* Environmental Impact Note */}
            <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200 space-y-1">
              <span className="text-[11px] font-fun font-bold text-sky-900 block">
                Factor de Estrés Ambiental:
              </span>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                {mission.environmentalCondition.impactTip}
              </p>
            </div>

            {/* Session Stats */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Intentos: {attemptsCount}</span>
              <span>Pistas: {hintsUsedCount}</span>
              <span>Nivel: {mission.id}/6</span>
            </div>
          </div>

          {/* Success Banner if Completed */}
          {isSuccess && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-3xl shadow-lg border-2 border-emerald-300 space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 font-fun font-black text-sm">
                <Award className="w-5 h-5 text-amber-300" />
                <span>¡Maestría en Biología Marina!</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                Has demostrado comprender cómo fluye la energía y cómo cada organismo mantiene el equilibrio del planeta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
