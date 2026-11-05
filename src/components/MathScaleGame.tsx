/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ScaleMission, Student } from '../types';
import { SCALE_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import {
  Check,
  RotateCcw,
  Lightbulb,
  Lock,
  ArrowRight,
  Volume2,
} from 'lucide-react';

interface MathScaleGameProps {
  student: Student;
  onStudentUpdated: () => void;
  initialLevelId?: number;
}

export const MathScaleGame: React.FC<MathScaleGameProps> = ({
  student,
  onStudentUpdated,
  initialLevelId,
}) => {
  // Current unlocked level for student
  const unlockedLevel = student.progress.matematicas || 1;

  // Active mission state (can only view unlocked or previously completed missions)
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      return initialLevelId;
    }
    if (initialLevelId) return initialLevelId;
    return Math.min(Math.max(unlockedLevel, 1), SCALE_MISSIONS.length);
  });

  useEffect(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      setCurrentLevelId(initialLevelId);
    }
  }, [initialLevelId, unlockedLevel]);

  const mission: ScaleMission =
    SCALE_MISSIONS.find((m) => m.id === currentLevelId) || SCALE_MISSIONS[0];

  // Placed pieces on right plate: array of piece objects
  const [placedPieces, setPlacedPieces] = useState<
    { id: string; label: string; value: number; color: string; pieceIndex: number }[]
  >([]);

  // Remaining counts for available pieces
  const [inventory, setInventory] = useState<Record<string, number>>({});

  // Feedback state
  const [statusText, setStatusText] = useState<string>('Falta peso a la derecha');
  const [balanceStatus, setBalanceStatus] = useState<'under' | 'balanced' | 'over'>('under');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [feedbackExplanation, setFeedbackExplanation] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCheckingError, setIsCheckingError] = useState<boolean>(false);

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize inventory whenever current mission changes
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    const initialInv: Record<string, number> = {};
    mission.availablePieces.forEach((p) => {
      initialInv[p.item.id] = p.initialCount;
    });
    setInventory(initialInv);
    setPlacedPieces([]);
    setStatusText('Falta peso a la derecha');
    setBalanceStatus('under');
    setIsSuccess(false);
    setFeedbackExplanation(null);
    setShowHint(false);
    setHintsUsedCount(0);
    setAttemptsCount(0);
    setStartTime(Date.now());
    setIsCheckingError(false);
  }, [mission]);

  // Clean up auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  // Compute total weight on right plate
  const targetWeight = mission.targetFraction.value;
  const currentRightWeight = placedPieces.reduce((sum, p) => sum + p.value, 0);

  // Calculate physical scale tilt angle (clamp between -18deg and +18deg)
  // Negative angle tilts down to the left (underweight on right), positive tilts down to the right
  const diff = currentRightWeight - targetWeight;
  const tiltAngle = Math.max(-18, Math.min(18, diff * 32));

  // Update status label dynamically as weights change
  useEffect(() => {
    const roundedTarget = Number(targetWeight.toFixed(4));
    const roundedRight = Number(currentRightWeight.toFixed(4));

    if (roundedRight === 0) {
      setStatusText('Falta peso a la derecha');
      setBalanceStatus('under');
    } else if (roundedRight < roundedTarget - 0.001) {
      setStatusText('Falta peso a la derecha');
      setBalanceStatus('under');
    } else if (Math.abs(roundedRight - roundedTarget) < 0.001) {
      setStatusText('¡Equilibrio perfecto logrado!');
      setBalanceStatus('balanced');
    } else {
      setStatusText('¡Exceso de peso a la derecha!');
      setBalanceStatus('over');
    }
  }, [currentRightWeight, targetWeight]);

  // Handle placing a piece
  const handleAddPiece = (pieceItem: ScaleMission['availablePieces'][0]['item']) => {
    if (isSuccess) return;
    if ((inventory[pieceItem.id] || 0) <= 0) return;

    audio.playPieceDrop();

    // Decrement inventory
    setInventory((prev) => ({
      ...prev,
      [pieceItem.id]: (prev[pieceItem.id] || 1) - 1,
    }));

    // Add to right plate
    setPlacedPieces((prev) => [
      ...prev,
      {
        id: pieceItem.id,
        label: pieceItem.label,
        value: pieceItem.value,
        color: pieceItem.color,
        pieceIndex: Date.now() + Math.random(),
      },
    ]);
  };

  // Handle removing a piece from the right plate
  const handleRemovePiece = (indexToRemove: number) => {
    if (isSuccess) return;
    const removed = placedPieces[indexToRemove];
    if (!removed) return;

    audio.playPop();

    // Increment inventory back
    setInventory((prev) => ({
      ...prev,
      [removed.id]: (prev[removed.id] || 0) + 1,
    }));

    // Remove from placed array
    setPlacedPieces((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Reset current plate
  const handleResetPlate = () => {
    audio.playPop();
    const initialInv: Record<string, number> = {};
    mission.availablePieces.forEach((p) => {
      initialInv[p.item.id] = p.initialCount;
    });
    setInventory(initialInv);
    setPlacedPieces([]);
    setFeedbackExplanation(null);
  };

  // Check balance and record real pedagogical learning metrics
  const handleCheckBalance = () => {
    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    const roundedTarget = Number(targetWeight.toFixed(4));
    const roundedRight = Number(currentRightWeight.toFixed(4));
    const isBalanced = Math.abs(roundedRight - roundedTarget) < 0.001;

    if (isBalanced) {
      audio.playBalanceSuccess();
      audio.playActivityComplete();
      audio.playVictoryFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'],
      });

      setIsSuccess(true);
      setIsCheckingError(false);
      setFeedbackExplanation(
        `¡Excelente trabajo! ${mission.explanation} Has demostrado la equivalencia exacta de ${mission.targetFraction.label}.`
      );

      // Measure real learning mastery
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      let masteryScore = 100;
      if (newAttempts > 2) masteryScore -= (newAttempts - 2) * 8;
      if (hintsUsedCount > 0) masteryScore -= hintsUsedCount * 12;
      if (masteryScore < 72) masteryScore = 72;

      // Record to permanent student database
      storage.recordProgress(student.id, 'matematicas', mission.id, {
        score: 100,
        attempts: newAttempts,
        hintsUsed: hintsUsedCount,
        timeSpentSeconds: elapsedSeconds,
        realLearningMastery: masteryScore,
      });

      onStudentUpdated();

      // Automatically advance to the next level
      if (mission.id < SCALE_MISSIONS.length) {
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
        autoTimerRef.current = setTimeout(() => {
          handleNextLevel();
        }, 2200);
      }
    } else {
      audio.playMismatch();
      setIsCheckingError(true);
      setTimeout(() => setIsCheckingError(false), 500);

      if (roundedRight < roundedTarget) {
        setFeedbackExplanation(
          `La balanza sigue inclinada. Tu plato suma ${roundedRight.toFixed(2)}, pero necesitas alcanzar ${roundedTarget.toFixed(2)}. ¡Agrega más piezas equivalentes!`
        );
      } else {
        setFeedbackExplanation(
          `Has superado el peso objetivo. Tu plato suma ${roundedRight.toFixed(2)}, sobrepasando la meta de ${roundedTarget.toFixed(2)}. Haz clic en alguna pieza del plato para retirarla.`
        );
      }
    }
  };

  // Advance to next mission
  const handleNextLevel = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (currentLevelId < SCALE_MISSIONS.length) {
      audio.playPop();
      setCurrentLevelId(currentLevelId + 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3.5">
      {/* 
        TOP MISSION SELECTOR STRIP: Matches the clean level progression 
      */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-emerald-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-fun font-bold text-slate-800 text-sm sm:text-base">
            Misiones de Balanza (1 al {SCALE_MISSIONS.length}):
          </span>
          <span className="text-[11px] font-fun font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {mission.title}
          </span>
        </div>

        {/* Level pills 1 to N */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {SCALE_MISSIONS.map((m) => {
            const isCompleted = student.history.some(
              (h) => h.subject === 'matematicas' && h.level === m.id && h.completed
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
                    ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
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
        MAIN GAME CARD: Exact syntax and layout from Image 2
      */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-sky-200/90 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* 
          PHYSICAL MECHANICAL SCALE (Exact syntax from Image 2)
          - Floating indicator bubble right over pivot: "Falta peso a la derecha"
          - Tilting dark beam with pivot circle
          - Left plate: "Plato Izquierdo", green fraction pill (1/2), "Total: 0.5"
          - Right plate: "Tu Plato (Derecho)", "Haz clic en las piezas...", "Total: 0"
        */}
        <div className="relative w-full h-72 sm:h-80 flex flex-col items-center justify-start overflow-hidden pt-2">
          {/* Top Indicator Bubble right above pivot: "Falta peso a la derecha" (from Image 2) */}
          <div className="z-30 mb-2">
            <div className="px-4 py-1 rounded-full bg-slate-100/95 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs">
              {statusText}
            </div>
          </div>

          {/* Central Stand and Wide Base */}
          <div className="absolute bottom-6 flex flex-col items-center z-10 pointer-events-none">
            {/* Orange circular pivot joint right under beam center */}
            <div className="w-7 h-7 rounded-full bg-[#f59e0b] border-2 border-[#1e293b] shadow-sm z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#1e293b]" />
            </div>
            {/* Center Pillar */}
            <div className="w-4 h-28 bg-[#1e293b] rounded-t-xs" />
            {/* Wide Base at bottom */}
            <div className="w-36 h-4 bg-[#1e293b] rounded-t-sm shadow-md" />
          </div>

          {/* Rotating Scale Beam with animated CSS transform */}
          <div
            className={`absolute top-14 sm:top-16 w-full flex items-center justify-between transition-transform duration-500 ease-out z-20 origin-center ${
              isCheckingError ? 'animate-shake' : ''
            }`}
            style={{ transform: `rotate(${tiltAngle}deg)` }}
          >
            {/* The metallic dark Beam Bar */}
            <div className="absolute inset-x-8 sm:inset-x-12 h-3 bg-[#1e293b] rounded-full shadow-md -z-10" />

            {/* LEFT PLATE (Plato Izquierdo - Target Fraction, from Image 2) */}
            <div className="w-44 sm:w-52 -ml-2 sm:-ml-4 flex flex-col items-center transform transition-transform duration-500 origin-top">
              {/* Hanging cords from beam */}
              <div className="w-0.5 h-16 bg-[#1e293b]" />

              {/* White Plate Card matching Image 2 */}
              <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-lg flex flex-col items-center text-center">
                <span className="text-xs font-bold text-slate-700">
                  Plato Izquierdo
                </span>
                <div className="my-1.5 px-4 py-1 rounded-full bg-[#10b981] text-white font-fun font-black text-lg shadow-xs">
                  {mission.targetFraction.label}
                </div>
                <span className="text-xs font-mono font-medium text-slate-500">
                  Total: {mission.targetFraction.value.toFixed(mission.targetFraction.value % 1 === 0 ? 0 : (mission.targetFraction.value === 0.5 ? 1 : 2))}
                </span>
              </div>
            </div>

            {/* RIGHT PLATE (Tu Plato (Derecho) - Student's Plate, from Image 2) */}
            <div className="w-44 sm:w-52 -mr-2 sm:-mr-4 flex flex-col items-center transform transition-transform duration-500 origin-top">
              {/* Hanging cords from beam */}
              <div className="w-0.5 h-16 bg-[#1e293b]" />

              {/* White Plate Card with amber border matching Image 2 */}
              <div className="w-full bg-white border-2 border-[#fbbf24] rounded-2xl p-4 shadow-lg flex flex-col items-center text-center min-h-[120px] justify-between">
                <span className="text-xs font-bold text-[#b45309]">
                  Tu Plato (Derecho)
                </span>

                {placedPieces.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic font-medium my-2 leading-tight">
                    Haz clic en las piezas de abajo para agregarlas
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1 justify-center my-1.5 max-h-16 overflow-y-auto w-full py-0.5">
                    {placedPieces.map((p, idx) => (
                      <button
                        key={p.pieceIndex}
                        onClick={() => handleRemovePiece(idx)}
                        title="Haz clic para quitar"
                        className="px-2 py-0.5 text-xs font-fun font-bold text-white rounded-lg shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.label.replace('Pieza ', '')} ✕
                      </button>
                    ))}
                  </div>
                )}

                <div className="w-full flex items-center justify-between text-xs font-mono font-medium text-slate-600 mt-1">
                  <span>
                    Total: {currentRightWeight === 0 ? '0' : currentRightWeight.toFixed(2)}
                  </span>
                  {placedPieces.length > 0 && !isSuccess && (
                    <button
                      onClick={handleResetPlate}
                      className="text-[10px] text-slate-400 hover:text-rose-600 underline font-bold cursor-pointer"
                    >
                      Vaciar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 
          VISUALIZADOR DE FRACCIONES EQUIVALENTES (from Image 2)
          Text: "Visualizador de Fracciones Equivalentes: 0.5 vs 0.00"
          Bar with: "Meta: 1/2 gema" "balanza"
        */}
        <div className="pt-2 flex flex-col items-center">
          <div className="text-xs sm:text-sm font-bold text-slate-700 mb-2 font-fun">
            Visualizador de Fracciones Equivalentes:{' '}
            <span className="font-mono text-emerald-600 font-black">
              {targetWeight.toFixed(targetWeight === 0.5 ? 1 : 2)}
            </span>{' '}
            vs{' '}
            <span
              className={`font-mono font-black ${
                balanceStatus === 'balanced'
                  ? 'text-emerald-600'
                  : balanceStatus === 'over'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {currentRightWeight.toFixed(2)}
            </span>
          </div>

          {/* The Progress Bar with "Meta: 1/2 gema" pill */}
          <div className="relative w-full max-w-lg h-7 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex items-center p-0.5">
            {/* Left red/rose target badge */}
            <div className="z-10 px-3 py-0.5 rounded-full bg-[#f43f5e] text-white font-fun font-bold text-[11px] shadow-xs shrink-0 select-none">
              Meta: {mission.targetFraction.label} gema
            </div>

            {/* Target marker notch */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-600 z-10"
              style={{ left: `${Math.min(targetWeight * 100, 100)}%` }}
            />

            {/* Dynamic fill bar with text "balanza" */}
            <div
              className={`h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-bold text-white select-none ${
                balanceStatus === 'balanced'
                  ? 'bg-emerald-500'
                  : balanceStatus === 'over'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(Math.max(currentRightWeight * 100, 0), 100)}%` }}
            >
              {currentRightWeight > 0.25 && <span>balanza</span>}
            </div>
          </div>
        </div>

        {/* 
          PIEZAS DISPONIBLES (Exact syntax and card design from Image 2)
          "Piezas Disponibles (Haz clic para colocar):"
          Card 1: 1/8 | Pieza 1/8 Valor: 0.125 | x8
          Card 2: 1/4 | Pieza 1/4 Valor: 0.25  | x2
        */}
        <div className="pt-2">
          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-3 font-fun">
            Piezas Disponibles (Haz clic para colocar):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mission.availablePieces.map(({ item, initialCount }) => {
              const remaining = inventory[item.id] ?? initialCount;
              const isExhausted = remaining <= 0;

              return (
                <button
                  key={item.id}
                  disabled={isExhausted || isSuccess}
                  onClick={() => handleAddPiece(item)}
                  className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition shadow-xs ${
                    isExhausted
                      ? 'border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed'
                      : isSuccess
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-amber-300 hover:border-amber-400 bg-white hover:bg-amber-50/40 cursor-pointer active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Colored fraction pill square */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-fun font-black text-xs sm:text-sm text-white shadow-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.numerator}/{item.denominator}
                    </div>

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800 font-fun">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Valor: {item.value.toFixed(item.denominator === 8 ? 3 : 2)}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500 ml-2">
                    ×{remaining}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback explanation text if available */}
        {feedbackExplanation && (
          <div
            className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium border flex items-start gap-2.5 animate-in fade-in ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{isSuccess ? '¡Correcto!' : 'Pista de peso:'}</p>
              <p className="mt-0.5">{feedbackExplanation}</p>
            </div>
          </div>
        )}

        {/* 
          BOTTOM ACTION ROW (from Image 2)
          Right: "✓ Comprobar Balanza"
        */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={handleResetPlate}
            disabled={placedPieces.length === 0 || isSuccess}
            className="text-xs font-fun font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>

          {!isSuccess ? (
            <button
              onClick={handleCheckBalance}
              disabled={placedPieces.length === 0}
              className={`py-2.5 px-6 rounded-xl font-fun font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95 ${
                placedPieces.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#10b981] hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Comprobar Balanza</span>
            </button>
          ) : (
            currentLevelId < SCALE_MISSIONS.length && (
              <button
                onClick={handleNextLevel}
                className="py-2.5 px-6 rounded-xl font-fun font-bold text-xs sm:text-sm bg-[#059669] hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition cursor-pointer animate-bounce"
              >
                <span>Siguiente Nivel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
