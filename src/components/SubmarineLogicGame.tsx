import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CircuitMission, LogicGateType, Student } from '../types';
import { CIRCUIT_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import { GameButton } from './ui/GameButton';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lightbulb,
  Lock,
  ArrowRight,
  Volume2,
  Table,
  Sparkles,
  Award,
  Play,
  Activity,
  Sliders,
  Check,
  X,
} from 'lucide-react';

interface SubmarineLogicGameProps {
  student: Student;
  onStudentUpdated: () => void;
  initialLevelId?: number;
}

export const SubmarineLogicGame: React.FC<SubmarineLogicGameProps> = ({
  student,
  onStudentUpdated,
  initialLevelId,
}) => {
  // Current unlocked level for student in Circuitos (defaults to 1)
  const unlockedLevel = student.progress?.circuitos || 1;

  // Active level state (only unlocked levels accessible)
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      return initialLevelId;
    }
    return Math.min(unlockedLevel, CIRCUIT_MISSIONS.length);
  });

  useEffect(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      setCurrentLevelId(initialLevelId);
    }
  }, [initialLevelId, unlockedLevel]);

  const mission: CircuitMission =
    CIRCUIT_MISSIONS.find((m) => m.id === currentLevelId) || CIRCUIT_MISSIONS[0];

  // Dynamic input switch states (user can toggle them to experiment with truth tables)
  const [inputStates, setInputStates] = useState<Record<string, boolean>>({});

  // Installed logic gates in sockets: { gateSlot_0: 'AND', gateSlot_1: 'OR' }
  const [installedGates, setInstalledGates] = useState<Record<string, LogicGateType | null>>({});

  // Selected gate chip from shelf
  const [selectedGateChip, setSelectedGateChip] = useState<LogicGateType | null>(null);

  // Runtime simulation state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [currentOutput, setCurrentOutput] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Instala las compuertas lógicas en el circuito para energizar el subsistema.'
  );
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');

  // Pedagogical metrics
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showTruthTable, setShowTruthTable] = useState<boolean>(false);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize input states and sockets whenever mission changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    const initialInputs: Record<string, boolean> = {};
    mission.inputs.forEach((input) => {
      initialInputs[input.id] = input.value;
    });
    setInputStates(initialInputs);

    const initialGates: Record<string, LogicGateType | null> = {};
    for (let i = 0; i < mission.gateSlotsCount; i++) {
      initialGates[`gate_${i}`] = null;
    }
    setInstalledGates(initialGates);

    setSelectedGateChip(null);
    setIsTesting(false);
    setCurrentOutput(null);
    setIsSuccess(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setAttemptsCount(0);
    setStartTime(Date.now());
    setStatusType('info');
    setStatusMessage(
      'Instala las compuertas lógicas en el circuito para energizar el subsistema.'
    );
  }, [mission]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Compute logic gate output helper
  const evaluateGate = (gate: LogicGateType, inA: boolean, inB?: boolean): boolean => {
    switch (gate) {
      case 'AND':
        return inA && (inB ?? false);
      case 'OR':
        return inA || (inB ?? false);
      case 'NOT':
        return !inA;
      case 'XOR':
        return (inA || (inB ?? false)) && !(inA && (inB ?? false));
      default:
        return false;
    }
  };

  // Compute full circuit output with current installed gates and inputs
  const computeCircuitOutput = (): boolean | null => {
    const gate0 = installedGates['gate_0'];
    if (!gate0) return null;

    if (mission.gateSlotsCount === 1) {
      if (gate0 === 'NOT') {
        const inA = inputStates[mission.inputs[0]?.id] ?? false;
        return evaluateGate('NOT', inA);
      }
      const inA = inputStates[mission.inputs[0]?.id] ?? false;
      const inB = inputStates[mission.inputs[1]?.id] ?? false;
      return evaluateGate(gate0, inA, inB);
    }

    if (mission.gateSlotsCount === 2) {
      const gate1 = installedGates['gate_1'];
      if (!gate1) return null;

      // Mission 4: (in0 GATE0 in1) GATE1 in2
      if (mission.id === 4) {
        const in0 = inputStates[mission.inputs[0]?.id] ?? false;
        const in1 = inputStates[mission.inputs[1]?.id] ?? false;
        const in2 = inputStates[mission.inputs[2]?.id] ?? false;
        const intermediate = evaluateGate(gate0, in0, in1);
        return evaluateGate(gate1, intermediate, in2);
      }

      // Mission 6: (in0 GATE0 in1) GATE1 (NOT in2)
      if (mission.id === 6) {
        const in0 = inputStates[mission.inputs[0]?.id] ?? false;
        const in1 = inputStates[mission.inputs[1]?.id] ?? false;
        const in2 = inputStates[mission.inputs[2]?.id] ?? false;
        const intermediateA = evaluateGate(gate0, in0, in1);
        const intermediateB = !in2; // Inverted overload signal
        return evaluateGate(gate1, intermediateA, intermediateB);
      }
    }

    return null;
  };

  // Toggle sensor switch
  const handleToggleInput = (inputId: string) => {
    audio.playPieceDrop();
    setInputStates((prev) => ({
      ...prev,
      [inputId]: !prev[inputId],
    }));
  };

  // Assign chip to socket
  const handleAssignGateToSocket = (slotKey: string) => {
    if (!selectedGateChip) return;
    audio.playPieceDrop();
    setInstalledGates((prev) => ({
      ...prev,
      [slotKey]: selectedGateChip,
    }));
    setSelectedGateChip(null);
  };

  const handleRemoveGateFromSocket = (slotKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audio.playPop();
    setInstalledGates((prev) => ({
      ...prev,
      [slotKey]: null,
    }));
  };

  // Test the circuit
  const handleTestCircuit = () => {
    if (isTesting) return;

    // Check if all gate sockets are filled
    const allSocketsFilled = Object.values(installedGates).every((g) => g !== null);
    if (!allSocketsFilled) {
      audio.playMismatch();
      setStatusType('error');
      setStatusMessage('Faltan compuertas lógicas por instalar en los zócalos del circuito.');
      return;
    }

    setIsTesting(true);
    audio.playRobotStep();
    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    setTimeout(() => {
      setIsTesting(false);
      const computed = computeCircuitOutput();
      setCurrentOutput(computed);

      // Verify that the logic circuit satisfies the truth table conditions
      let allPassed = true;

      // Verify current condition
      if (computed !== mission.targetOutput) {
        allPassed = false;
      }

      // Check against truth table rules for structural correctness
      for (const row of mission.truthTable) {
        let testOut: boolean = false;
        const g0 = installedGates['gate_0']!;

        if (mission.gateSlotsCount === 1) {
          if (g0 === 'NOT') {
            const inA = Object.values(row.inputs)[0] ?? false;
            testOut = evaluateGate('NOT', inA);
          } else {
            const inKeys = Object.keys(row.inputs);
            const inA = row.inputs[inKeys[0]] ?? false;
            const inB = row.inputs[inKeys[1]] ?? false;
            testOut = evaluateGate(g0, inA, inB);
          }
        } else if (mission.gateSlotsCount === 2) {
          const g1 = installedGates['gate_1']!;
          const inKeys = Object.keys(row.inputs);
          if (mission.id === 4) {
            const inA = row.inputs[inKeys[0]] ?? false;
            const inB = row.inputs[inKeys[1]] ?? false;
            const inC = row.inputs[inKeys[2]] ?? false;
            testOut = evaluateGate(g1, evaluateGate(g0, inA, inB), inC);
          } else if (mission.id === 6) {
            const inA = row.inputs[inKeys[0]] ?? false;
            const inB = row.inputs[inKeys[1]] ?? false;
            const inC = row.inputs[inKeys[2]] ?? false;
            testOut = evaluateGate(g1, evaluateGate(g0, inA, inB), !inC);
          }
        }

        if (testOut !== row.expected) {
          allPassed = false;
          break;
        }
      }

      if (allPassed) {
        audio.playBalanceSuccess();
        audio.playActivityComplete();
        audio.playVictoryFanfare();
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
        });

        setIsSuccess(true);
        setStatusType('success');
        setStatusMessage(
          `¡Circuito restaurado con éxito! ${mission.subsystemName} ha entrado en funcionamiento continuo.`
        );

        // Calculate real mastery score
        const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
        let masteryScore = 100;
        if (newAttempts > 2) masteryScore -= (newAttempts - 2) * 8;
        if (hintsUsedCount > 0) masteryScore -= hintsUsedCount * 10;
        if (masteryScore < 75) masteryScore = 75;

        storage.recordProgress(student.id, 'circuitos', mission.id, {
          score: 100,
          attempts: newAttempts,
          hintsUsed: hintsUsedCount,
          timeSpentSeconds: elapsedSeconds,
          realLearningMastery: masteryScore,
        });

        onStudentUpdated();

        if (mission.id < CIRCUIT_MISSIONS.length) {
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleNextLevel();
          }, 3000);
        }
      } else {
        audio.playMismatch();
        setStatusType('error');
        setStatusMessage(
          'La compuerta elegida no cumple la condición lógica. Revisa la tabla de verdad y reintenta.'
        );
      }
    }, 600);
  };

  const handleNextLevel = () => {
    if (mission.id < CIRCUIT_MISSIONS.length) {
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

  const handleNarrateConcept = () => {
    audio.playPop();
    audio.speak(`${mission.title}. ${mission.objective}. ${mission.learningConcept}`);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-indigo-300 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-100/60 via-sky-50/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-black font-fun uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pensamiento Computacional • Lógica Digital</span>
              </span>
              <span className="text-[11px] font-bold font-fun px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Grado {mission.grade}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Misión {mission.id} de {CIRCUIT_MISSIONS.length}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-fun text-slate-900 tracking-tight flex items-center gap-2">
              <span>⚡</span>
              <span>{mission.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Subsistema: <strong className="text-indigo-900">{mission.subsystemName}</strong>
            </p>
          </div>

          {/* Level Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CIRCUIT_MISSIONS.map((m) => {
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
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400 -translate-y-0.5'
                      : isCompleted
                      ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  title={isLocked ? `Bloqueado (Supera el Nivel ${m.id - 1})` : m.title}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    m.id
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Story context bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <p className="text-slate-600 font-medium max-w-2xl leading-relaxed">
            📖 <em>"{mission.storyContext}"</em>
          </p>

          <button
            onClick={() => {
              audio.playPop();
              setShowTruthTable(!showTruthTable);
            }}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-fun font-bold text-xs rounded-xl border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showTruthTable ? 'Ocultar Tabla' : 'Ver Tabla de Verdad'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Circuit Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: Cybernetic Circuit Board (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-6 border-3 border-indigo-500/50 shadow-2xl relative overflow-hidden text-white min-h-[440px] flex flex-col justify-between">
            {/* Motherboard Grid Lines Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Circuit Board Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-fun font-bold uppercase tracking-wider text-indigo-200">
                  Panel Eléctrico Submarino • Nautilus Logic Board v4.2
                </span>
              </div>

              {/* Voltage & Logic State readout */}
              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-indigo-500/40 text-xs font-mono">
                <span className="text-slate-400">Salida:</span>
                <span
                  className={`font-black ${
                    currentOutput === true
                      ? 'text-emerald-400'
                      : currentOutput === false
                      ? 'text-rose-400'
                      : 'text-amber-300'
                  }`}
                >
                  {currentOutput === true ? '1 (ACTIVO)' : currentOutput === false ? '0 (INACTIVO)' : 'STANDBY'}
                </span>
              </div>
            </div>

            {/* Motherboard Wiring schematic */}
            <div className="relative z-10 my-4 flex flex-col md:flex-row items-center justify-between gap-6 py-4">
              {/* 1. INPUT TERMINALS (Left side) */}
              <div className="space-y-3 w-full md:w-auto">
                <span className="text-[10px] font-fun uppercase tracking-wider text-sky-300 block font-bold mb-1">
                  Entradas / Sensores:
                </span>
                {mission.inputs.map((input) => {
                  const state = inputStates[input.id] ?? false;

                  return (
                    <div
                      key={input.id}
                      onClick={() => handleToggleInput(input.id)}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                        state
                          ? 'border-emerald-400 bg-emerald-950/60 shadow-md shadow-emerald-500/20'
                          : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{input.icon}</span>
                        <div>
                          <h4 className="font-fun font-bold text-xs text-white leading-tight">
                            {input.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block">
                            {state ? 'Señal Alta (1)' : 'Señal Baja (0)'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Switch toggle */}
                      <div
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                          state ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-800">
                          {state ? '1' : '0'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Glowing Wire Conduit from inputs to sockets */}
              <div className="hidden md:flex flex-col items-center justify-center text-indigo-400 text-lg opacity-70">
                <span>━━━━►</span>
                <span className="text-[10px] font-mono text-indigo-300">PULSO</span>
              </div>

              {/* 2. LOGIC GATE SOCKETS (Center) */}
              <div className="space-y-4 w-full md:w-auto">
                <span className="text-[10px] font-fun uppercase tracking-wider text-indigo-300 block font-bold mb-1 text-center">
                  Zócalos de Compuertas Lógicas:
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  {Object.keys(installedGates).map((slotKey, idx) => {
                    const gate = installedGates[slotKey];

                    return (
                      <div
                        key={slotKey}
                        onClick={() => handleAssignGateToSocket(slotKey)}
                        className={`w-36 h-36 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-between p-3 relative ${
                          isTesting
                            ? 'border-indigo-400 bg-indigo-500/20 scale-105 ring-2 ring-indigo-400'
                            : gate
                            ? 'border-indigo-400 bg-indigo-950/80 shadow-lg shadow-indigo-500/25'
                            : 'border-dashed border-indigo-400/50 bg-indigo-950/40 hover:bg-indigo-900/40'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between text-[10px] font-mono text-indigo-300">
                          <span>SOCKET {idx + 1}</span>
                          {gate && !isSuccess && (
                            <button
                              onClick={(e) => handleRemoveGateFromSocket(slotKey, e)}
                              className="text-rose-400 hover:text-rose-200 font-bold p-0.5 rounded cursor-pointer"
                              title="Retirar compuerta"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {gate ? (
                          <div className="text-center my-auto animate-in zoom-in-75 duration-200">
                            <span className="text-2xl font-black font-code text-indigo-200 block">
                              {gate}
                            </span>
                            <span className="text-[10px] font-fun font-bold text-teal-300">
                              {gate === 'AND'
                                ? '∧ Conjunción'
                                : gate === 'OR'
                                ? '∨ Disyunción'
                                : gate === 'NOT'
                                ? '¬ Inversor'
                                : '⊕ Exclusiva'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center my-auto py-2">
                            <div className="w-8 h-8 rounded-full border border-dashed border-indigo-400/60 mx-auto flex items-center justify-center text-indigo-300 text-sm">
                              +
                            </div>
                            <span className="text-[10px] text-indigo-300/80 font-fun block mt-1">
                              {selectedGateChip ? 'Clic para instalar' : 'Zócalo Libre'}
                            </span>
                          </div>
                        )}

                        <span className="text-[9px] text-slate-400 font-mono">
                          {gate ? 'Chip Acoplado' : 'Requiere Compuerta'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glowing Wire Conduit from socket to output */}
              <div className="hidden md:flex flex-col items-center justify-center text-emerald-400 text-lg opacity-70">
                <span>━━━━►</span>
                <span className="text-[10px] font-mono text-emerald-300">SALIDA</span>
              </div>

              {/* 3. SUBSYSTEM OUTPUT TARGET (Right side) */}
              <div className="w-full md:w-48 text-center space-y-2">
                <span className="text-[10px] font-fun uppercase tracking-wider text-emerald-300 block font-bold mb-1">
                  Subsistema Objetivo:
                </span>

                <div
                  className={`p-4 rounded-3xl border-2 transition-all duration-300 ${
                    currentOutput === true
                      ? 'border-emerald-400 bg-emerald-950/80 shadow-lg shadow-emerald-500/30'
                      : 'border-slate-700 bg-slate-900/80'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-2 transition-all duration-300 ${
                      currentOutput === true
                        ? 'bg-emerald-500/30 text-emerald-300 animate-pulse-glow'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {currentOutput === true ? '⚡' : '🔒'}
                  </div>
                  <h4 className="font-fun font-bold text-xs text-white">
                    {mission.subsystemName}
                  </h4>
                  <span
                    className={`text-[10px] font-mono font-bold block mt-1 ${
                      currentOutput === true ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {mission.targetOutputLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Truth Table Modal / Drawer */}
            {showTruthTable && (
              <div className="relative z-10 bg-slate-900/95 border border-indigo-400/40 rounded-2xl p-4 my-2 text-xs space-y-2 animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-fun font-bold text-indigo-300 flex items-center gap-1.5">
                    <Table className="w-4 h-4" />
                    <span>Tabla de Verdad del Subsistema</span>
                  </h4>
                  <button
                    onClick={() => setShowTruthTable(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="text-slate-400 border-b border-slate-700">
                      <tr>
                        {Object.keys(mission.truthTable[0].inputs).map((key) => (
                          <th key={key} className="p-1.5">
                            {key}
                          </th>
                        ))}
                        <th className="p-1.5 text-right">Salida Esperada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {mission.truthTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-950/40">
                          {Object.values(row.inputs).map((val, i) => (
                            <td key={i} className="p-1.5 text-slate-300">
                              {val ? '1' : '0'}
                            </td>
                          ))}
                          <td className="p-1.5 text-right font-bold text-emerald-400">
                            {row.expected ? '1 (ACTIVA)' : '0 (APAGADA)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Status Feedback Bar */}
            <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                {statusType === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : statusType === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <Activity className="w-5 h-5 text-indigo-400 shrink-0" />
                )}
                <span className="text-xs text-slate-200 font-medium truncate">
                  {statusMessage}
                </span>
              </div>

              <button
                onClick={handleNarrateConcept}
                className="p-2 rounded-xl bg-indigo-800/50 hover:bg-indigo-700/60 text-indigo-200 transition cursor-pointer shrink-0"
                title="Escuchar audio de la misión"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Logic Gates Toolkit Shelf */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border-2 border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-fun font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🧰</span>
                <span>Caja de Compuertas Lógicas (Selecciona un chip para acoplarlo)</span>
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                Disponibles: {mission.availableGates.join(', ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['AND', 'OR', 'NOT', 'XOR'] as LogicGateType[])
                .filter((gate) => mission.availableGates.includes(gate))
                .map((gate) => {
                  const isSelected = selectedGateChip === gate;

                  return (
                    <button
                      key={gate}
                      onClick={() => {
                        audio.playPop();
                        setSelectedGateChip(isSelected ? null : gate);
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400 -translate-y-0.5'
                          : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-code font-black text-indigo-900 text-sm shrink-0">
                        {gate === 'AND' ? '∧' : gate === 'OR' ? '∨' : gate === 'NOT' ? '¬' : '⊕'}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-fun font-black text-xs text-slate-900">
                          Compuerta {gate}
                        </h4>
                        <span className="text-[10px] text-indigo-700 font-semibold block truncate">
                          {gate === 'AND'
                            ? 'Solo 1 si ambas son 1'
                            : gate === 'OR'
                            ? '1 si al menos una es 1'
                            : gate === 'NOT'
                            ? 'Invierte la señal'
                            : '1 solo si son diferentes'}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT: Controls & Educational Mastery Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Action Launch Panel */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border-3 border-indigo-300 shadow-xl space-y-4">
            <h3 className="font-fun font-bold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Simulador de Corriente</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleTestCircuit}
                disabled={isTesting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-fun font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isTesting ? 'Verificando Circuito...' : 'Testear Circuito Eléctrico'}</span>
              </button>

              {isSuccess && mission.id < CIRCUIT_MISSIONS.length && (
                <button
                  onClick={handleNextLevel}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-fun font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer animate-pulse"
                >
                  <span>Avanzar al Nivel {mission.id + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Pedagogical Hint Card */}
            <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-fun font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pista de Ingeniería</span>
                </span>
                {!showHint && (
                  <button
                    onClick={() => {
                      audio.playPop();
                      setShowHint(true);
                      setHintsUsedCount((c) => c + 1);
                    }}
                    className="text-[10px] text-indigo-700 underline font-semibold cursor-pointer"
                  >
                    Ver Pista
                  </button>
                )}
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                {showHint ? mission.hint : 'Consulta la pista si necesitas ayuda con el comportamiento de la compuerta.'}
              </p>
            </div>

            {/* Computational Concept Card */}
            <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200 space-y-1">
              <span className="text-[11px] font-fun font-bold text-sky-900 block">
                Concepto Computacional:
              </span>
              <p className="text-[11px] text-sky-800 leading-relaxed font-mono">
                {mission.learningConcept}
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
            <div className="bg-gradient-to-r from-indigo-600 to-sky-600 text-white p-4 rounded-3xl shadow-lg border-2 border-indigo-300 space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 font-fun font-black text-sm">
                <Award className="w-5 h-5 text-amber-300" />
                <span>¡Maestría en Pensamiento Computacional!</span>
              </div>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                Has resuelto el desafío con lógica booleana rigurosa, demostrando comprensión de cómo funcionan las computadoras reales.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
