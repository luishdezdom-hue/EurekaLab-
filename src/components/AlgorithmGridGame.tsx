/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GridMission, Student, AlgorithmCommand } from '../types';
import { GRID_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import {
  Play,
  RotateCcw,
  RotateCw,
  ArrowUp,
  Gem,
  Lightbulb,
  Volume2,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';

interface AlgorithmGridGameProps {
  student: Student;
  onStudentUpdated: () => void;
  initialLevelId?: number;
}

export const AlgorithmGridGame: React.FC<AlgorithmGridGameProps> = ({
  student,
  onStudentUpdated,
  initialLevelId,
}) => {
  // Current unlocked level for student (1 to 10)
  const unlockedLevel = student.progress.algoritmos || 1;

  // Active level state (only <= unlockedLevel can be accessed)
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      return initialLevelId;
    }
    // Default to level 5 if unlocked, or current unlocked level
    if (initialLevelId) return initialLevelId;
    return Math.min(Math.max(unlockedLevel, 1), GRID_MISSIONS.length);
  });

  useEffect(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      setCurrentLevelId(initialLevelId);
    }
  }, [initialLevelId, unlockedLevel]);

  const mission: GridMission =
    GRID_MISSIONS.find((m) => m.id === currentLevelId) || GRID_MISSIONS[0];

  // Program sequence built by child
  const [programSequence, setProgramSequence] = useState<AlgorithmCommand[]>([]);

  // Simulation runtime state
  const [robotPos, setRobotPos] = useState<{ x: number; y: number; dir: number }>({
    x: mission.startPos.x,
    y: mission.startPos.y,
    dir: mission.startPos.dir,
  });

  const [hasCollectedGem, setHasCollectedGem] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Simulación reiniciada. Listo para ejecutar código.'
  );
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Pedagogical metrics
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset simulation whenever mission changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    resetSimulation();
    setProgramSequence([]);
    setIsSuccess(false);
    setShowHint(false);
    setHintsUsedCount(0);
    setAttemptsCount(0);
    setStartTime(Date.now());
  }, [mission]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  const resetSimulation = () => {
    if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsRunning(false);
    setActiveStepIndex(-1);
    setRobotPos({
      x: mission.startPos.x,
      y: mission.startPos.y,
      dir: mission.startPos.dir,
    });
    setHasCollectedGem(false);
    setStatusMessage('Simulación reiniciada. Listo para ejecutar código.');
    setStatusType('info');
  };

  // Add command to program
  const handleAddCommand = (cmd: AlgorithmCommand) => {
    if (isRunning || isSuccess) return;
    if (programSequence.length >= mission.maxBlocks) {
      audio.playMismatch();
      setStatusMessage(`Límite de bloques alcanzado (${mission.maxBlocks} máx.)`);
      setStatusType('error');
      return;
    }

    audio.playPop();
    setProgramSequence((prev) => [...prev, cmd]);
    setStatusMessage('Bloque añadido a la secuencia.');
    setStatusType('info');
  };

  // Remove a command by index
  const handleRemoveCommand = (index: number) => {
    if (isRunning || isSuccess) return;
    audio.playPop();
    setProgramSequence((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all commands
  const handleClearAll = () => {
    if (isRunning) return;
    audio.playPop();
    setProgramSequence([]);
    resetSimulation();
  };

  // Step-by-step execution loop
  const handleExecute = () => {
    if (programSequence.length === 0 || isRunning) return;

    resetSimulation();
    setIsRunning(true);
    setStatusMessage('Ejecutando algoritmo paso a paso...');
    setStatusType('info');

    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    let curX = mission.startPos.x;
    let curY = mission.startPos.y;
    let curDir = mission.startPos.dir;
    let gemCollected = false;

    const stepIntervalMs = 450;

    programSequence.forEach((cmd, stepIndex) => {
      runTimeoutRef.current = setTimeout(() => {
        setActiveStepIndex(stepIndex);

        if (cmd === 'FORWARD') {
          // Grid coordinate logic:
          // dir 0 (East): x + 1, y
          // dir 90 (North): x, y - 1
          // dir 180 (West): x - 1, y
          // dir 270 (South): x, y + 1
          let nextX = curX;
          let nextY = curY;

          if (curDir === 0) nextX += 1;
          else if (curDir === 90) nextY -= 1;
          else if (curDir === 180) nextX -= 1;
          else if (curDir === 270) nextY += 1;

          // Boundary check (5x4 grid: x in 0..4, y in 0..3)
          if (nextX < 0 || nextX > 4 || nextY < 0 || nextY > 3) {
            audio.playMismatch();
            setIsRunning(false);
            setStatusMessage('¡Alerta! La nave intentó salir de los límites de la cuadrícula.');
            setStatusType('error');
            return;
          }

          // Obstacle check
          const hitObstacle = mission.obstacles.some((o) => o.x === nextX && o.y === nextY);
          if (hitObstacle) {
            audio.playMismatch();
            setIsRunning(false);
            setStatusMessage('¡Impacto con un obstáculo! Revisa tu secuencia de giros y avance.');
            setStatusType('error');
            return;
          }

          curX = nextX;
          curY = nextY;
          audio.playRobotStep();
          setRobotPos({ x: curX, y: curY, dir: curDir });
        } else if (cmd === 'TURN_LEFT') {
          // Counter-clockwise: 0 -> 90 -> 180 -> 270 -> 0
          curDir = (curDir + 90) % 360;
          audio.playRobotTurn();
          setRobotPos({ x: curX, y: curY, dir: curDir });
        } else if (cmd === 'TURN_RIGHT') {
          // Clockwise: 0 -> 270 -> 180 -> 90 -> 0
          curDir = (curDir - 90 + 360) % 360;
          audio.playRobotTurn();
          setRobotPos({ x: curX, y: curY, dir: curDir });
        } else if (cmd === 'COLLECT_GEM') {
          if (curX === mission.gemPos.x && curY === mission.gemPos.y) {
            gemCollected = true;
            setHasCollectedGem(true);
            audio.playGemSparkle();
            setStatusMessage('¡Gema recolectada con éxito! Continúa hacia la meta.');
          } else {
            audio.playMismatch();
            setStatusMessage('Comando Recoger Gema ejecutado en una casilla sin gemas.');
            setStatusType('error');
          }
        }

        // Final step validation
        if (stepIndex === programSequence.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setActiveStepIndex(-1);

            const isAtGoal = curX === mission.goalPos.x && curY === mission.goalPos.y;

            if (isAtGoal && gemCollected) {
              audio.playBalanceSuccess();
              audio.playActivityComplete();
              audio.playVictoryFanfare();
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b'],
              });

              setIsSuccess(true);
              setStatusType('success');

              // Calculate real learning mastery
              const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
              let masteryScore = 100;
              if (newAttempts > 2) masteryScore -= (newAttempts - 2) * 8;
              if (hintsUsedCount > 0) masteryScore -= hintsUsedCount * 12;
              if (programSequence.length > mission.maxBlocks) masteryScore -= 10;
              if (masteryScore < 75) masteryScore = 75;

              storage.recordProgress(student.id, 'algoritmos', mission.id, {
                score: 100,
                attempts: newAttempts,
                hintsUsed: hintsUsedCount,
                timeSpentSeconds: elapsedSeconds,
                realLearningMastery: masteryScore,
              });

              onStudentUpdated();

              if (mission.id < GRID_MISSIONS.length) {
                setStatusMessage(
                  `¡Misión cumplida! Algoritmo ejecutado con éxito. Pasando a Misión ${mission.id + 1}...`
                );
                if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = setTimeout(() => {
                  handleNextLevel();
                }, 2200);
              } else {
                setStatusMessage('¡Misión cumplida! ¡Has superado todas las misiones algorítmicas!');
              }
            } else if (!gemCollected) {
              audio.playMismatch();
              setStatusMessage('Llegaste a la meta, pero olvidaste usar el bloque "Recoger Gema".');
              setStatusType('error');
            } else {
              audio.playMismatch();
              setStatusMessage('Recolectaste la gema, pero la nave no llegó a la casilla de meta.');
              setStatusType('error');
            }
          }, 300);
        }
      }, stepIndex * stepIntervalMs);
    });
  };

  const handleNextLevel = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (currentLevelId < GRID_MISSIONS.length) {
      audio.playPop();
      setCurrentLevelId(currentLevelId + 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3.5">
      {/* 
        TOP HEADER: Exact syntax and styling from Image 1:
        "Misiones Algorítmicas (1 al 10): Consecutivos (1 -> 2 -> 3...)"
        Buttons: 1✓ 2✓ 3✓ 4✓ 5 (active) 6🔒 7🔒 8🔒 9🔒 10🔒
      */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-sky-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-fun font-bold text-slate-800 text-sm sm:text-base">
            Misiones Algorítmicas (1 al 10):
          </span>
          <span className="text-[11px] font-fun font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            Consecutivos (1 → 2 → 3...)
          </span>
        </div>

        {/* Level buttons 1 to 10 */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {GRID_MISSIONS.map((m) => {
            const isCompleted = student.history.some(
              (h) => h.subject === 'algoritmos' && h.level === m.id && h.completed
            );
            const isAccessible = m.id <= unlockedLevel;
            const isCurrent = m.id === currentLevelId;

            return (
              <button
                key={m.id}
                disabled={!isAccessible}
                onClick={() => {
                  audio.playPop();
                  setCurrentLevelId(m.id);
                }}
                className={`relative px-2.5 py-1 rounded-xl font-fun font-bold text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer min-w-[34px] ${
                  isCurrent
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : isAccessible
                    ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{m.id}</span>
                {isCompleted ? (
                  <span className="text-emerald-600 font-black text-[10px]">✓</span>
                ) : !isAccessible ? (
                  <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        OBJECTIVE CARD BANNER: Exact syntax from Image 1:
        "🎯 Objetivo: Navega a través de un estrecho pasillo entre obstáculos espaciales."
      */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-sky-200/90 rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-800 text-xs sm:text-sm font-fun">
          <span className="text-lg">🎯</span>
          <span className="font-black text-slate-900">Objetivo:</span>
          <span className="text-slate-700 font-semibold">{mission.objective}</span>
        </div>

        {/* Audio narration button */}
        <button
          onClick={() =>
            audio.speakText(`Misión algorítmica número ${mission.id}: ${mission.objective}`)
          }
          className="text-sky-600 hover:text-sky-800 p-1.5 rounded-lg hover:bg-sky-50 transition cursor-pointer"
          title="Escuchar objetivo"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* 
        MAIN GAME ARENA: 2 Columns
        Left: The 5x4 Grid Container
        Right: Bloques de Comando & Secuencia del Programa
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: The 5x4 Grid Arena (Slate dark styling matching Image 1) */}
        <div className="lg:col-span-7 bg-[#131b2e] border-2 border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col justify-between">
          <div>
            {/* The 5x4 Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 aspect-[5/4] w-full">
              {[0, 1, 2, 3].flatMap((y) =>
                [0, 1, 2, 3, 4].map((x) => {
                  const isRobotHere = robotPos.x === x && robotPos.y === y;
                  const isObstacle = mission.obstacles.some((o) => o.x === x && o.y === y);
                  const isGemHere = mission.gemPos.x === x && mission.gemPos.y === y && !hasCollectedGem;
                  const isGoalHere = mission.goalPos.x === x && mission.goalPos.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative aspect-square rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center select-none ${
                        isRobotHere
                          ? 'bg-cyan-950/40 border-2 border-cyan-400 ring-4 ring-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.5)] z-20'
                          : isGoalHere
                          ? 'bg-emerald-950/50 border-2 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : isObstacle
                          ? 'bg-[#1e2538] border border-slate-700/60'
                          : 'bg-[#1a233a]/80 border border-slate-800 hover:bg-[#202b46]'
                      }`}
                    >
                      {/* Coordinate label in top-left: 0,0 1,0 ... */}
                      <span className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-500/90 select-none">
                        {x},{y}
                      </span>

                      {/* Obstacle Representation matching Image 1: Slate rounded box with hollow inner square */}
                      {isObstacle && (
                        <div className="w-3/5 h-3/5 rounded-xl bg-[#28334d] border-2 border-slate-600/70 flex items-center justify-center shadow-xs">
                          <div className="w-1/2 h-1/2 border-2 border-slate-500/80 rounded-sm" />
                        </div>
                      )}

                      {/* Collectible Gem (when not at goal or when collected) */}
                      {isGemHere && !isGoalHere && !isRobotHere && (
                        <div className="animate-bounce">
                          <span className="text-xl sm:text-2xl filter drop-shadow">💎</span>
                        </div>
                      )}

                      {/* Goal Flag only */}
                      {isGoalHere && !isGemHere && !isRobotHere && (
                        <div>
                          <span className="text-xl sm:text-2xl">🏁</span>
                        </div>
                      )}

                      {/* Goal & Gem tile combined matching Image 1 (Checkered flag + Diamond at 4,2) */}
                      {isGoalHere && isGemHere && !isRobotHere && (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg sm:text-xl">🏁</span>
                          <span className="text-lg sm:text-xl animate-pulse">💎</span>
                        </div>
                      )}

                      {/* Robot / Rover Vehicle facing movement direction */}
                      {isRobotHere && (
                        <div
                          className="transition-transform duration-300 ease-out select-none flex items-center justify-center"
                          style={{
                            transform: `rotate(${-robotPos.dir + 90}deg)`,
                          }}
                        >
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyan-400 border-2 border-white flex items-center justify-center shadow-md">
                            <span className="text-base sm:text-lg transform -rotate-90">🚀</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Simulation Status Bar below grid (exact syntax from Image 1) */}
          <div
            className={`mt-4 py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm font-fun font-bold border transition-colors ${
              statusType === 'error'
                ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                : statusType === 'success'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 animate-pulse'
                : 'bg-[#1a233a] border-slate-700 text-slate-300'
            }`}
          >
            {statusMessage}
          </div>
        </div>

        {/* Right Column: Command Blocks & Program Sequence Builder */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md border-2 border-sky-200/90 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header: Bloques de Comando: 0 / 8 bloques (matching Image 1) */}
            <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-fun">
              <span className="font-black text-slate-800">Bloques de Comando:</span>
              <span className="font-mono text-slate-500 font-semibold">
                {programSequence.length} / {mission.maxBlocks} bloques
              </span>
            </div>

            {/* 4 Tactile Command Buttons with Exact Labels and Colors from Image 1 */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {/* Blue: Avanzar 1 Paso */}
              <button
                disabled={isRunning || isSuccess}
                onClick={() => handleAddCommand('FORWARD')}
                className="py-3 px-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-fun font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
                <span>Avanzar 1 Paso</span>
              </button>

              {/* Orange: Girar Izquierda */}
              <button
                disabled={isRunning || isSuccess}
                onClick={() => handleAddCommand('TURN_LEFT')}
                className="py-3 px-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white font-fun font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>Girar Izquierda</span>
              </button>

              {/* Orange: Girar Derecha */}
              <button
                disabled={isRunning || isSuccess}
                onClick={() => handleAddCommand('TURN_RIGHT')}
                className="py-3 px-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white font-fun font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className="w-4 h-4 stroke-[3]" />
                <span>Girar Derecha</span>
              </button>

              {/* Green: Recoger Gema */}
              <button
                disabled={isRunning || isSuccess}
                onClick={() => handleAddCommand('COLLECT_GEM')}
                className="py-3 px-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-fun font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Gem className="w-4 h-4 stroke-[2.5]" />
                <span>Recoger Gema</span>
              </button>
            </div>

            {/* Program Sequence Area (matching Image 1) */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-fun">
                SECUENCIA DEL PROGRAMA:
              </span>

              <div className="min-h-36 max-h-52 overflow-y-auto p-3 bg-white/70 border-2 border-dashed border-slate-200 rounded-2xl flex flex-wrap content-start gap-1.5">
                {programSequence.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center w-full py-8 font-medium">
                    Haz clic en los bloques arriba para construir tu algoritmo.
                  </p>
                ) : (
                  programSequence.map((cmd, idx) => {
                    const isCurrentExecuting = activeStepIndex === idx;

                    return (
                      <button
                        key={idx}
                        disabled={isRunning}
                        onClick={() => handleRemoveCommand(idx)}
                        title="Haz clic para quitar este bloque"
                        className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
                          isCurrentExecuting
                            ? 'ring-4 ring-rose-400 scale-105 bg-rose-500 text-white animate-pulse'
                            : cmd === 'FORWARD'
                            ? 'bg-[#0284c7] text-white hover:bg-sky-600'
                            : cmd === 'TURN_LEFT' || cmd === 'TURN_RIGHT'
                            ? 'bg-[#f59e0b] text-white hover:bg-amber-600'
                            : 'bg-[#059669] text-white hover:bg-emerald-700'
                        }`}
                      >
                        <span className="opacity-80 text-[10px]">{idx + 1}.</span>
                        <span>
                          {cmd === 'FORWARD'
                            ? 'Avanzar 1 Paso'
                            : cmd === 'TURN_LEFT'
                            ? 'Girar Izquierda'
                            : cmd === 'TURN_RIGHT'
                            ? 'Girar Derecha'
                            : 'Recoger Gema'}
                        </span>
                        {!isRunning && <span className="text-[10px] opacity-75 font-mono ml-0.5">✕</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Action Footer: Borrar todo and Ejecutar Algoritmo (matching Image 1) */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              disabled={programSequence.length === 0 || isRunning}
              onClick={handleClearAll}
              className="text-xs font-fun font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Borrar todo</span>
            </button>

            {!isSuccess ? (
              <button
                disabled={programSequence.length === 0 || isRunning}
                onClick={handleExecute}
                className={`py-2.5 px-5 rounded-xl font-fun font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer active:scale-95 ${
                  programSequence.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isRunning
                    ? 'bg-sky-400 text-white cursor-wait'
                    : 'bg-[#0284c7] hover:bg-sky-600 text-white shadow-md'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Ejecutando...' : 'Ejecutar Algoritmo'}</span>
              </button>
            ) : (
              currentLevelId < GRID_MISSIONS.length && (
                <button
                  onClick={handleNextLevel}
                  className="py-2.5 px-5 rounded-xl font-fun font-bold text-xs sm:text-sm bg-[#059669] hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition cursor-pointer animate-bounce"
                >
                  <span>Siguiente Nivel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
