import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ReadingMission, Student } from '../types';
import { READING_MISSIONS } from '../data/missions';
import { audio } from '../services/audioService';
import { storage } from '../services/storageService';
import { GameButton } from './ui/GameButton';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';

interface ReadingComprehensionGameProps {
  student: Student;
  onStudentUpdated: () => void;
  initialLevelId?: number;
}

export const ReadingComprehensionGame: React.FC<ReadingComprehensionGameProps> = ({
  student,
  onStudentUpdated,
  initialLevelId,
}) => {
  const unlockedLevel = student.progress.lectura;
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      return initialLevelId;
    }
    return Math.min(unlockedLevel, READING_MISSIONS.length);
  });

  useEffect(() => {
    if (initialLevelId && initialLevelId <= unlockedLevel) {
      setCurrentLevelId(initialLevelId);
    }
  }, [initialLevelId, unlockedLevel]);

  const mission: ReadingMission =
    READING_MISSIONS.find((m) => m.id === currentLevelId) || READING_MISSIONS[0];

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);

  // Question answers state: questionId -> selectedIndex
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedResults, setCheckedResults] = useState<
    Record<string, { isCorrect: boolean; feedback: string }>
  >({});
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [hasCheckedError, setHasCheckedError] = useState<boolean>(false);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when level changes
  useEffect(() => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    audio.stopSpeech();
    setIsPlayingAudio(false);
    setActiveParagraphIndex(-1);
    setSelectedAnswers({});
    setCheckedResults({});
    setIsSuccess(false);
    setAttemptsCount(0);
    setStartTime(Date.now());
    setHasCheckedError(false);
  }, [mission]);

  // Clean up audio and timer on unmount
  useEffect(() => {
    return () => {
      audio.stopSpeech();
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Play audio narration of the entire reading text in high fidelity
  const handleToggleNarration = () => {
    if (isPlayingAudio) {
      audio.stopSpeech();
      setIsPlayingAudio(false);
      setActiveParagraphIndex(-1);
    } else {
      audio.playPop();
      setIsPlayingAudio(true);

      const fullText = `${mission.title}. ${mission.subtitle}. ${mission.textParagraphs.join(
        ' ... '
      )}`;

      audio.speakText(
        fullText,
        () => setIsPlayingAudio(true),
        () => {
          setIsPlayingAudio(false);
          setActiveParagraphIndex(-1);
        }
      );
    }
  };

  // Select an option
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSuccess) return;
    audio.playPop();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Check answers
  const handleCheckQuestions = () => {
    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    let allCorrect = true;
    const results: Record<string, { isCorrect: boolean; feedback: string }> = {};

    mission.questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected === q.correctIndex) {
        results[q.id] = {
          isCorrect: true,
          feedback: q.feedbackSuccess,
        };
      } else {
        allCorrect = false;
        results[q.id] = {
          isCorrect: false,
          feedback: q.feedbackRetry,
        };
      }
    });

    setCheckedResults(results);

    if (allCorrect) {
      audio.playBalanceSuccess();
      audio.playActivityComplete();
      audio.playVictoryFanfare();
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'],
      });

      setIsSuccess(true);
      setHasCheckedError(false);

      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      let masteryScore = 100;
      if (newAttempts > 2) masteryScore -= (newAttempts - 2) * 10;
      if (masteryScore < 75) masteryScore = 75;

      storage.recordProgress(student.id, 'lectura', mission.id, {
        score: 100,
        attempts: newAttempts,
        hintsUsed: 0,
        timeSpentSeconds: elapsedSeconds,
        realLearningMastery: masteryScore,
      });

      onStudentUpdated();

      if (mission.id < READING_MISSIONS.length) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNextLevel();
        }, 2200);
      }
    } else {
      audio.playMismatch();
      setHasCheckedError(true);
      setTimeout(() => setHasCheckedError(false), 500);
    }
  };

  const handleNextLevel = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (currentLevelId < READING_MISSIONS.length) {
      audio.playPop();
      setCurrentLevelId(currentLevelId + 1);
    }
  };

  const allQuestionsAnswered =
    mission.questions.length > 0 &&
    mission.questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top Mission Progression Selector */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-rose-200/90 rounded-3xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Módulo de Comunicación y Comprensión
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-sky-950 font-fun flex items-center gap-2">
              <span className="text-2xl">📖</span> Lectura Crítica y Audición de Alta Fidelidad
            </h2>
          </div>

          {/* High Fidelity Audio Narration Toggle Game Button */}
          <GameButton
            variant={isPlayingAudio ? 'danger' : 'reading'}
            size="sm"
            onClick={handleToggleNarration}
            icon={
              isPlayingAudio ? (
                <Square className="w-4 h-4 fill-white" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )
            }
          >
            <span>{isPlayingAudio ? 'Detener Narrador' : 'Narrar en Alta Fidelidad'}</span>
          </GameButton>
        </div>

        {/* Level pills with 3D tactile button feel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
            Lecturas:
          </span>
          {READING_MISSIONS.map((m) => {
            const isCompleted = student.history.some(
              (h) => h.subject === 'lectura' && h.level === m.id && h.completed
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
                className={`relative px-3.5 py-1.5 rounded-2xl font-fun font-bold text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/40 border-b-3 border-rose-800 -translate-y-0.5'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200 hover:-translate-y-0.5'
                    : isAccessible
                    ? 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                }`}
              >
                <span>Lectura {m.id}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                ) : !isAccessible ? (
                  <Lock className="w-3 h-3 text-slate-400" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout: Text Reader on Left, Questions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Story Reader */}
        <div className="lg:col-span-6 bg-white/95 backdrop-blur-md border-3 border-rose-200/90 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Story Header */}
            <div className="border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-rose-700 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Tiempo estimado: {mission.estimatedTime}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-fun text-slate-900 mt-1">
                {mission.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {mission.subtitle}
              </p>
            </div>

            {/* Story Paragraphs with reading typography */}
            <div className="space-y-3.5 text-slate-800 text-sm sm:text-base leading-relaxed max-h-[460px] overflow-y-auto pr-2">
              {mission.textParagraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    isPlayingAudio
                      ? 'bg-rose-50/70 border border-rose-200/60 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Audio Waveform Indicator */}
          {isPlayingAudio && (
            <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl border border-rose-200 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 font-fun">
                <span>🔊</span>
                <span>Narrando en Alta Fidelidad...</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-6 bg-rose-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Comprehension & Critical Analysis Questions */}
        <div className="lg:col-span-6 bg-white/95 backdrop-blur-md border-3 border-sky-200/90 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-sky-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide block">
                  Desafío Evaluativo
                </span>
                <h3 className="text-base sm:text-lg font-bold font-fun text-slate-900">
                  Preguntas de Comprensión y Reflexión
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-xl border border-sky-200">
                {Object.keys(selectedAnswers).length}/{mission.questions.length}
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-5 max-h-[440px] overflow-y-auto pr-1">
              {mission.questions.map((q, qIdx) => {
                const selected = selectedAnswers[q.id];
                const checked = checkedResults[q.id];

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      checked
                        ? checked.isCorrect
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-rose-300 bg-rose-50/50 animate-shake'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2.5">
                      <span className="w-6 h-6 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs font-fun">
                        {qIdx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 font-fun">
                        {q.question}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 mt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selected === optIdx;

                        return (
                          <button
                            key={optIdx}
                            disabled={isSuccess}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-b-4 border-b-sky-600 -translate-y-0.5 shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:-translate-y-0.5'
                            }`}
                          >
                            <span>{opt}</span>
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-sky-600 bg-sky-600 text-white text-[10px]'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && '✓'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation */}
                    {checked && (
                      <div
                        className={`mt-3 p-2.5 rounded-xl text-xs font-medium border flex items-start gap-2 animate-in fade-in ${
                          checked.isCorrect
                            ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                            : 'bg-rose-100/70 border-rose-300 text-rose-950'
                        }`}
                      >
                        {checked.isCorrect ? (
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span>{checked.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-sky-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              {allQuestionsAnswered
                ? '¡Todas las preguntas respondidas!'
                : 'Responde todas las preguntas para comprobar.'}
            </span>

            {!isSuccess ? (
              <GameButton
                variant="reading"
                size="md"
                disabled={!allQuestionsAnswered}
                onClick={handleCheckQuestions}
                isError={hasCheckedError}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                <span>Comprobar Respuestas</span>
              </GameButton>
            ) : (
              currentLevelId < READING_MISSIONS.length && (
                <GameButton
                  variant="success"
                  size="md"
                  onClick={handleNextLevel}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="animate-bounce"
                >
                  <span>Siguiente Lectura</span>
                </GameButton>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
