/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Student, NavigationSection, SectionActivity, SchoolSection, ActivitySubmission } from '../../types';
import { audio } from '../../services/audioService';
import { storage } from '../../services/storageService';
import { adminService } from '../../services/adminService';
import {
  CheckSquare,
  ArrowLeft,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Scale,
  Grid,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Paperclip,
  FileCheck2,
  Layers,
  X,
} from 'lucide-react';

interface EvaluacionesSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onStudentUpdated: () => void;
}

interface TestQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AssessmentTest {
  id: string;
  subject: 'matematicas' | 'algoritmos' | 'lectura';
  title: string;
  description: string;
  durationMinutes: number;
  rewardCoins: number;
  questions: TestQuestion[];
}

export const EvaluacionesSection: React.FC<EvaluacionesSectionProps> = ({
  student,
  onNavigate,
  onStudentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'assignments'>('diagnostics');
  const [activeTest, setActiveTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [earnedScore, setEarnedScore] = useState<number>(0);

  // Student Section Assignments state
  const assignedSections = adminService.getSectionsForStudent(student.id);
  const [submittingActivity, setSubmittingActivity] = useState<SectionActivity | null>(null);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [submissionFeedbackToast, setSubmissionFeedbackToast] = useState<string | null>(null);

  const tests: AssessmentTest[] = [
    {
      id: 'test_math',
      subject: 'matematicas',
      title: 'Diagnóstico de Fracciones y Equivalencias',
      description: 'Evalúa tu capacidad para comparar fracciones, identificar equivalencias y resolver balanzas sin adivinar.',
      durationMinutes: 5,
      rewardCoins: 40,
      questions: [
        {
          question: '¿Cuál de las siguientes fracciones es equivalente a 1/2?',
          options: ['2/3', '2/4', '3/5', '1/4'],
          correctIndex: 1,
          explanation: '2/4 simplificado dividiendo numerador y denominador entre 2 da exactamente 1/2.',
        },
        {
          question: 'Si en un platillo de la balanza colocas 3/4, ¿cuál combinación la equilibra?',
          options: ['1/2 + 1/4', '1/8 + 1/8', '1/4 + 1/4', '1/2 + 1/2'],
          correctIndex: 0,
          explanation: '1/2 equivale a 2/4. Al sumarle 1/4 obtenemos 3/4 exactos.',
        },
        {
          question: 'En la fracción 4/8, ¿qué fracción irreductible representa?',
          options: ['1/4', '1/2', '3/4', '2/8'],
          correctIndex: 1,
          explanation: '4/8 es exactamente la mitad, es decir 1/2.',
        },
      ],
    },
    {
      id: 'test_code',
      subject: 'algoritmos',
      title: 'Evaluación de Lógica y Secuencias Algorítmicas',
      description: 'Mide tu habilidad para diseñar secuencias de pasos precisos, prever colisiones y calcular giros de 90°.',
      durationMinutes: 5,
      rewardCoins: 40,
      questions: [
        {
          question: 'Una nave está orientada al Este. Si gira 90° a la izquierda, ¿hacia dónde mirará?',
          options: ['Al Sur', 'Al Norte', 'Al Oeste', 'Al Este'],
          correctIndex: 1,
          explanation: 'Desde el Este, girar 90° en sentido antihorario (izquierda) orienta la nave hacia el Norte.',
        },
        {
          question: '¿Qué es una condición o decisión en un algoritmo?',
          options: [
            'Una instrucción que se ejecuta siempre sin importar nada.',
            'Un bloque que comprueba si ocurre algo (por ejemplo: "Si hay un obstáculo enfrente, gira").',
            'Un fallo en la computadora.',
            'Un sonido del juego.',
          ],
          correctIndex: 1,
          explanation: 'Las condiciones permiten tomar decisiones según el estado del entorno.',
        },
        {
          question: 'Para llegar a una meta a 3 pasos de distancia en línea recta, ¿cuál es el algoritmo más eficiente?',
          options: [
            'Avanzar, Girar izquierda, Girar derecha, Avanzar, Avanzar.',
            'Avanzar 3 veces consecutivas.',
            'Girar 360 grados y avanzar 1 vez.',
            'Retroceder 3 veces.',
          ],
          correctIndex: 1,
          explanation: 'La eficiencia consiste en alcanzar el objetivo con la menor cantidad de pasos necesarios.',
        },
      ],
    },
    {
      id: 'test_reading',
      subject: 'lectura',
      title: 'Prueba de Comprensión Lectora y Pensamiento Crítico',
      description: 'Demuestra tu destreza para extraer datos literales, deducir intenciones del autor y opinar críticamente.',
      durationMinutes: 6,
      rewardCoins: 40,
      questions: [
        {
          question: '¿Qué diferencia a una pregunta inferencial de una pregunta literal?',
          options: [
            'La literal requiere adivinar y la inferencial no.',
            'La literal se encuentra explícitamente en el texto; la inferencial se deduce a partir de pistas.',
            'La inferencial es más corta.',
            'No tienen ninguna diferencia.',
          ],
          correctIndex: 1,
          explanation: 'Las inferencias conectan pistas del texto con el conocimiento previo del lector.',
        },
        {
          question: 'Si un personaje "guarda silencio y aprieta los puños al escuchar una mentira", ¿qué puedes inferir?',
          options: [
            'Que tiene mucho sueño.',
            'Que siente frustración o enojo contenido ante el engaño.',
            'Que está alegre.',
            'Que tiene hambre.',
          ],
          correctIndex: 1,
          explanation: 'El lenguaje corporal descrito indica molestia o indignación.',
        },
        {
          question: '¿Cuál es el propósito del nivel crítico de lectura?',
          options: [
            'Copiar el texto sin errores ortográficos.',
            'Emitir un juicio valorativo y fundamentado sobre el contenido y las ideas del autor.',
            'Contar cuántas palabras tiene el cuento.',
            'Leer lo más rápido posible.',
          ],
          correctIndex: 1,
          explanation: 'El nivel crítico desarrolla el criterio propio evaluando argumentos y valores.',
        },
      ],
    },
  ];

  const handleStartTest = (test: AssessmentTest) => {
    audio.playPop();
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setTestCompleted(false);
    setEarnedScore(0);
  };

  const handleSelectOption = (optionIndex: number) => {
    audio.playPop();
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      audio.playPop();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      let correct = 0;
      activeTest.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correct++;
        }
      });
      const score = Math.round((correct / activeTest.questions.length) * 100);
      setEarnedScore(score);
      setTestCompleted(true);

      // Save to student history and grant rewards
      const currentLevel = student.progress[activeTest.subject] || 1;
      storage.recordProgress(
        student.id,
        activeTest.subject,
        currentLevel,
        {
          score,
          attempts: 1,
          hintsUsed: 0,
          timeSpentSeconds: 120,
          realLearningMastery: score,
        }
      );

      if (score >= 70) {
        audio.playBalanceSuccess();
        student.coins += activeTest.rewardCoins;
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#10b981', '#f59e0b'],
        });
      } else {
        audio.playBuzzer();
      }

      onStudentUpdated();
    }
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingActivity || !submissionText.trim()) return;

    adminService.submitActivityByStudent({
      activityId: submittingActivity.id,
      sectionId: submittingActivity.sectionId,
      studentId: student.id,
      studentName: `${student.name} ${student.lastName}`,
      answerText: submissionText.trim(),
    });

    audio.playBalanceSuccess();
    setSubmissionFeedbackToast('¡Tarea enviada con éxito a tu profesor!');
    setTimeout(() => setSubmissionFeedbackToast(null), 4000);
    setSubmittingActivity(null);
    setSubmissionText('');
    onStudentUpdated();
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Toast */}
      {submissionFeedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-teal-400/40 text-xs font-bold font-fun animate-in slide-in-from-top-2">
          {submissionFeedbackToast}
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              📝
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 font-fun block">
                Sección 7 • Evaluación Formativa y Tareas Escolares
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-300">
                Medición del Aprendizaje Real
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Evaluaciones y Tareas de mi Sección
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Pruebas conceptuales y actividades asignadas directamente por tus docentes para tu aula escolar.
            </p>
          </div>
        </div>

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

      {/* Sub-tabs: Pruebas Formativas vs Tareas de mi Sección */}
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border-2 border-teal-200/70 shadow-xs max-w-md">
        <button
          onClick={() => {
            audio.playPop();
            setActiveTab('diagnostics');
            setActiveTest(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-fun transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Pruebas Diagnósticas ({tests.length})</span>
        </button>

        <button
          onClick={() => {
            audio.playPop();
            setActiveTab('assignments');
            setActiveTest(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-fun transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Tareas de mi Sección</span>
        </button>
      </div>

      {/* TAB 1: PRUEBAS DIAGNÓSTICAS */}
      {activeTab === 'diagnostics' && (
        activeTest ? (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-3 border-teal-200/90 shadow-xl max-w-2xl mx-auto space-y-5">
            {!testCompleted ? (
              <>
                {/* Test Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-700 font-fun uppercase tracking-wider">
                      {activeTest.title}
                    </span>
                    <div className="text-sm font-semibold text-slate-600">
                      Pregunta {currentQuestionIndex + 1} de {activeTest.questions.length}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTest(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar Test
                  </button>
                </div>

                {/* Question Text */}
                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200">
                  <p className="text-base font-bold text-slate-900 font-fun leading-snug">
                    {activeTest.questions[currentQuestionIndex].question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {activeTest.questions[currentQuestionIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full text-left p-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer border-2 flex items-center justify-between ${
                        selectedAnswers[currentQuestionIndex] === i
                          ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedAnswers[currentQuestionIndex] === i && (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer action */}
                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-fun font-bold text-sm shadow-md transition cursor-pointer active:scale-95"
                  >
                    {currentQuestionIndex < activeTest.questions.length - 1
                      ? 'Siguiente Pregunta →'
                      : 'Finalizar Evaluación'}
                  </button>
                </div>
              </>
            ) : (
              /* Results Screen */
              <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  {earnedScore >= 70 ? '🎉' : '📖'}
                </div>

                <div>
                  <h2 className="text-2xl font-black font-fun text-slate-900">
                    {earnedScore >= 70 ? '¡Excelente Dominio Real!' : 'Buen Intento de Aprendizaje'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    {earnedScore >= 70
                      ? `Has demostrado un dominio conceptual del ${earnedScore}%. ¡Recompensa acreditada a tu cuenta!`
                      : `Obtuviste ${earnedScore}%. Te recomendamos revisar la sección de Academia o consultar con tu Tutor Inteligente.`}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Puntaje de Dominio Real:</span>
                    <span className="font-mono text-base text-teal-700">{earnedScore}%</span>
                  </div>
                  {earnedScore >= 70 && (
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                      <span>Eurekas Ganadas:</span>
                      <span className="font-mono text-base">+{activeTest.rewardCoins} 🪙</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => handleStartTest(activeTest)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Repetir Test</span>
                  </button>

                  <button
                    onClick={() => setActiveTest(null)}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-fun font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Volver a Evaluaciones
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Test Selection Cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border-3 border-teal-200/90 shadow-xl flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                      {test.subject === 'matematicas'
                        ? 'Matemáticas'
                        : test.subject === 'algoritmos'
                        ? 'Algoritmos'
                        : 'Lectura'}
                    </span>

                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      +{test.rewardCoins} 🪙
                    </span>
                  </div>

                  <div>
                    <h3 className="font-fun font-bold text-lg text-slate-900 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{test.questions.length} Preguntas Formativas</span>
                    <span>⏱️ ~{test.durationMinutes} minutos</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleStartTest(test)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-fun font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Iniciar Evaluación Formativa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: TAREAS Y ACTIVIDADES DE MI SECCIÓN */}
      {activeTab === 'assignments' && (
        <div className="space-y-5">
          {assignedSections.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 text-center border-3 border-teal-200/90 shadow-xl space-y-3">
              <span className="text-4xl">🏝️</span>
              <h3 className="text-lg font-black text-slate-900 font-fun">
                Aún no tienes una sección escolar asignada
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Tu profesor o tutor escolar te asignará a tu aula (ej. 4to Grado A • Arrecife Coralino). Mientras tanto, puedes continuar resolviendo las pruebas diagnósticas y lecciones generales.
              </p>
            </div>
          ) : (
            assignedSections.map((sec) => {
              const secActivities = adminService.getActivities(sec.id);
              const submissions = adminService.getSubmissions();

              return (
                <div
                  key={sec.id}
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-teal-200/90 shadow-xl space-y-4"
                >
                  {/* Section Title Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2 bg-teal-50 rounded-2xl border border-teal-200">{sec.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider font-fun block">
                          Mi Aula Asignada • {sec.grade} Primaria
                        </span>
                        <h2 className="text-lg font-black text-slate-900 font-fun">
                          {sec.name}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                          Docente: {sec.teacherName}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 font-fun self-start sm:self-auto">
                      {secActivities.length} actividades disponibles
                    </span>
                  </div>

                  {/* Section Activities Roster */}
                  <div className="space-y-3">
                    {secActivities.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 font-fun text-xs">
                        No hay actividades pendientes en esta sección por el momento.
                      </div>
                    ) : (
                      secActivities.map((act) => {
                        const mySub = submissions.find(
                          (s) => s.activityId === act.id && s.studentId === student.id
                        );

                        return (
                          <div
                            key={act.id}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-teal-300 transition space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase font-fun">
                                    {act.subject}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                                    {act.points} pts
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 font-fun mt-1">
                                  {act.title}
                                </h3>
                              </div>

                              {/* Status Pill */}
                              <div>
                                {mySub?.status === 'graded' ? (
                                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black font-fun flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Calificado: {mySub.score}/100</span>
                                  </span>
                                ) : mySub?.status === 'submitted' ? (
                                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-fun flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Entregado • En revisión</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold font-fun">
                                    Por entregar
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              {act.instructions}
                            </p>

                            {/* Dates and Attachments */}
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1 text-rose-600 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                Fecha límite: {act.dueDate}
                              </span>
                              {act.attachments && act.attachments.length > 0 && (
                                <div className="flex items-center gap-2">
                                  {act.attachments.map((att) => (
                                    <a
                                      key={att.id}
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-teal-700 hover:underline flex items-center gap-0.5 font-bold"
                                    >
                                      <Paperclip className="w-3 h-3" />
                                      <span>{att.name}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Teacher Feedback Box if graded */}
                            {mySub?.feedback && (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                                <strong className="font-fun block mb-0.5 text-emerald-800">
                                  Observación de tu profesor ({sec.teacherName}):
                                </strong>
                                {mySub.feedback}
                              </div>
                            )}

                            {/* Action to submit */}
                            {mySub?.status !== 'graded' && (
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => {
                                    audio.playPop();
                                    setSubmittingActivity(act);
                                    setSubmissionText(mySub?.answerText || '');
                                  }}
                                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-fun font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{mySub ? 'Actualizar mi Entrega' : 'Entregar Tarea'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: ENTREGAR TAREA POR EL ESTUDIANTE */}
      {submittingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-teal-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 font-fun flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-600" />
                <span>Entregar Actividad</span>
              </h3>
              <button
                onClick={() => setSubmittingActivity(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="space-y-3 mt-4">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase font-fun block">
                  Actividad
                </span>
                <div className="text-sm font-bold text-slate-900 font-fun">
                  {submittingActivity.title}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {submittingActivity.instructions}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-fun">
                  Tu Respuesta o Solución
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe cómo resolviste el reto o pega tu solución aquí..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingActivity(null)}
                  className="px-3.5 py-2 text-xs font-bold font-fun text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold font-fun bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar a mi Profesor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
