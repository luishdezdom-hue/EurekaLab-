/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, NavigationSection } from '../../types';
import { audio } from '../../services/audioService';
import { adminService } from '../../services/adminService';
import {
  GraduationCap,
  BookOpen,
  Scale,
  Grid,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Volume2,
  ChevronRight,
  X,
  FolderArchive,
  Download,
  ExternalLink,
  FileText,
} from 'lucide-react';

interface LessonsSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
  onGoToGame: (subject: 'math' | 'code' | 'reading') => void;
}

interface Lesson {
  id: string;
  subject: 'math' | 'code' | 'reading';
  grade: string;
  title: string;
  subtitle: string;
  estimatedTime: string;
  summary: string;
  fullContent: string[];
  keyConcept: string;
  example: string;
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const LessonsSection: React.FC<LessonsSectionProps> = ({
  student,
  onNavigate,
  onGoToGame,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'math' | 'code' | 'reading'>('all');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const lessons: Lesson[] = [
    {
      id: 'les_math_1',
      subject: 'math',
      grade: '3ro - 4to',
      title: '¿Qué es una Fracción y cómo funciona?',
      subtitle: 'Partes iguales de un todo',
      estimatedTime: '4 min',
      summary: 'Una fracción expresa una o varias partes iguales en que se ha dividido una unidad o cantidad.',
      fullContent: [
        'Imagina una pizza entera o una barra de energía submarina. Si la divides en 4 partes exactamente iguales, cada parte es 1/4.',
        'El NUMERADOR (el número de arriba) indica cuántas partes tomamos o tenemos.',
        'El DENOMINADOR (el número de abajo) indica en cuántas partes iguales se dividió el total.',
        'Regla de oro: No puedes comparar fracciones si las partes no son del mismo tamaño.',
      ],
      keyConcept: 'El denominador divide; el numerador cuenta cuántas partes tienes.',
      example: 'Si tienes 2/4 de una perla, tienes 2 pedazos de 4 posibles.',
      quizQuestion: {
        question: 'En la fracción 3/8, ¿qué representa el número 8?',
        options: [
          'Las partes que nos hemos comido.',
          'El total de partes iguales en que se dividió la unidad.',
          'La suma de las partes.',
        ],
        correctIndex: 1,
        explanation: '¡Exacto! El denominador (8) indica el número total de partes iguales.',
      },
    },
    {
      id: 'les_math_2',
      subject: 'math',
      grade: '4to - 5to',
      title: 'El Secreto de las Fracciones Equivalentes',
      subtitle: 'Diferentes números, misma cantidad real',
      estimatedTime: '5 min',
      summary: 'Descubre por qué 1/2 pesa exactamente lo mismo en la balanza que 2/4 o que 4/8.',
      fullContent: [
        'Dos fracciones son equivalentes cuando representan la misma cantidad o valor numérico, aunque sus números sean distintos.',
        'En nuestra Balanza de Fracciones, si colocas 1 bloque de 1/2 en el platillo izquierdo, necesitarás exactamente 2 bloques de 1/4 en el derecho para nivelarla.',
        '¿Por qué? Porque 1/4 + 1/4 = 2/4, y 2/4 simplificado es igual a 1/2.',
        'Del mismo modo, 4 piezas de 1/8 equivalen a 2 de 1/4 y a 1 de 1/2.',
      ],
      keyConcept: 'Multiplicar o dividir numerador y denominador por el mismo número conserva el valor.',
      example: '1/2 = 2/4 = 4/8 = 0.5 (Cincuenta por ciento).',
      quizQuestion: {
        question: '¿Cuántas piezas de 1/4 necesitas para equilibrar una pieza de 1/2?',
        options: ['1 pieza', '2 piezas', '4 piezas'],
        correctIndex: 1,
        explanation: '¡Excelente! 2 piezas de 1/4 forman 2/4, que equivale exactamente a 1/2.',
      },
    },
    {
      id: 'les_code_1',
      subject: 'code',
      grade: '3ro - 4to',
      title: '¿Qué es un Algoritmo y el Pensamiento Lógico?',
      subtitle: 'Instrucciones ordenadas paso a paso',
      estimatedTime: '4 min',
      summary: 'Un algoritmo es una serie ordenada y precisa de pasos para resolver un problema o alcanzar una meta.',
      fullContent: [
        'Las computadoras y los robots no pueden "adivinar" lo que piensas. Necesitan que les des instrucciones paso por paso en el orden correcto.',
        'Si le dices a un robot que AVANCE antes de GIRAR hacia la puerta abierta, chocará contra la pared.',
        'El orden de los factores altera el resultado: Secuencia lógica = Éxito.',
        'La depuración (o "debugging") consiste en revisar tu código con calma cuando algo falla para encontrar el paso equivocado.',
      ],
      keyConcept: 'Un algoritmo debe ser claro, finito y ordenado secuencialmente.',
      example: 'Receta para cruzar: 1. Mirar izquierda, 2. Mirar derecha, 3. Avanzar.',
      quizQuestion: {
        question: '¿Qué ocurre si colocas el bloque AVANZAR hacia un asteroide?',
        options: [
          'La nave lo atraviesa mágicamente.',
          'La nave colisiona porque sigue la orden sin razonar.',
          'El asteroide se mueve solo.',
        ],
        correctIndex: 1,
        explanation: '¡Así es! Las máquinas ejecutan las instrucciones al pie de la letra, por eso debemos planificar la ruta antes de ejecutar.',
      },
    },
    {
      id: 'les_code_2',
      subject: 'code',
      grade: '5to - 6to',
      title: 'Bucles, Giros y Eficiencia Algorítmica',
      subtitle: 'Hacer más con menos bloques',
      estimatedTime: '5 min',
      summary: 'Aprende a diseñar trayectorias limpias calculando giros de 90 grados y optimizando comandos.',
      fullContent: [
        'En la cuadrícula espacial de EDUQUEST, girar a la izquierda rota tu orientación 90° en sentido antihorario.',
        'Girar a la derecha rota 90° en sentido horario.',
        'Un buen programador no solo busca que el programa funcione, busca que sea eficiente: alcanzar la meta con el menor número de bloques posibles.',
        'Antes de presionar "Ejecutar Código", recorre mentalmente la cuadrícula con tu dedo imaginario.',
      ],
      keyConcept: 'La eficiencia significa resolver el problema con la menor cantidad de pasos necesarios.',
      example: 'Avanzar 3 casillas es mejor que avanzar, girar, girar y avanzar.',
      quizQuestion: {
        question: 'Si tu nave apunta al Norte y ejecutas GIRAR A LA DERECHA, ¿hacia dónde apuntará?',
        options: ['Al Sur', 'Al Este', 'Al Oeste'],
        correctIndex: 1,
        explanation: '¡Correcto! Un giro a la derecha de 90° desde el Norte orienta la nave hacia el Este.',
      },
    },
    {
      id: 'les_read_1',
      subject: 'reading',
      grade: '3ro - 4to',
      title: 'Las 3 Llaves de la Lectura: Literal, Inferencial y Crítica',
      subtitle: 'Comprender a fondo lo que leemos',
      estimatedTime: '6 min',
      summary: 'Aprende a diferenciar la información explícita de las deducciones y la opinión fundamentada.',
      fullContent: [
        '1. Nivel LITERAL: La respuesta está escrita exactamente en el texto. Solo debes localizarla (¿Quién?, ¿Dónde?, ¿Cuándo?).',
        '2. Nivel INFERENCIAL: La respuesta no está escrita directamente, pero el autor te da pistas para deducirla (¿Por qué sucedió?, ¿Qué siente el personaje?).',
        '3. Nivel CRÍTICO: Evalúas el texto con tu propio juicio. ¿Estás de acuerdo con la decisión del protagonista? ¿Qué valores se transmiten?',
        'Para convertirte en un Maestro Lector, debes usar las tres llaves en cada lectura.',
      ],
      keyConcept: 'Literal = lo que dice; Inferencial = lo que insinúa; Crítico = lo que opinas con argumentos.',
      example: '"Tenía un paraguas empapado" -> Inferencia: afuera está lloviendo.',
      quizQuestion: {
        question: 'Si el texto dice "Sofía tiritaba y se abrochó su grueso abrigo", ¿qué inferencia es correcta?',
        options: ['Hace mucho frío.', 'Es verano y hace calor.', 'Sofía está en la playa.'],
        correctIndex: 0,
        explanation: '¡Muy bien! Deducimos que hace frío a partir de las pistas de tiritar y usar un abrigo grueso.',
      },
    },
  ];

  const filteredLessons =
    selectedSubject === 'all'
      ? lessons
      : lessons.filter((l) => l.subject === selectedSubject);

  const handleOpenLesson = (lesson: Lesson) => {
    audio.playPop();
    setActiveLesson(lesson);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleCloseModal = () => {
    setActiveLesson(null);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (index: number) => {
    audio.playPop();
    setSelectedQuizAnswer(index);
  };

  const handleVerifyQuiz = () => {
    if (selectedQuizAnswer === null || !activeLesson) return;
    setQuizSubmitted(true);
    if (selectedQuizAnswer === activeLesson.quizQuestion.correctIndex) {
      audio.playBalanceSuccess();
    } else {
      audio.playBuzzer();
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              📚
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 font-fun block">
                Sección 6 • Centro Teórico Conceptual
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300">
                Academia EDUQUEST
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-fun text-slate-900 leading-tight">
              Academia o Lecciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Aprende los fundamentos conceptuales de matemáticas, algoritmos y lectura antes de entrar a la arena de juegos.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-sky-200 max-w-fit">
        <button
          onClick={() => {
            audio.playPop();
            setSelectedSubject('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer ${
            selectedSubject === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
          }`}
        >
          Todas las Lecciones
        </button>
        <button
          onClick={() => {
            audio.playPop();
            setSelectedSubject('math');
          }}
          className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
            selectedSubject === 'math'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Matemáticas</span>
        </button>
        <button
          onClick={() => {
            audio.playPop();
            setSelectedSubject('code');
          }}
          className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
            selectedSubject === 'code'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Algoritmos</span>
        </button>
        <button
          onClick={() => {
            audio.playPop();
            setSelectedSubject('reading');
          }}
          className={`px-3 py-1.5 rounded-xl font-fun font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
            selectedSubject === 'reading'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-rose-900 hover:bg-rose-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lectura</span>
        </button>
      </div>

      {/* Lessons List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => handleOpenLesson(lesson)}
            className="p-5 rounded-3xl bg-white/95 border-2 border-slate-200 hover:border-blue-400 shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    lesson.subject === 'math'
                      ? 'bg-emerald-100 text-emerald-800'
                      : lesson.subject === 'code'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {lesson.subject === 'math'
                    ? 'Matemáticas'
                    : lesson.subject === 'code'
                    ? 'Algoritmos'
                    : 'Lectura'}
                </span>

                <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
                  ⏱️ {lesson.estimatedTime}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-blue-700 font-bold block">
                  {lesson.grade} • {lesson.subtitle}
                </span>
                <h3 className="font-fun font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-snug line-clamp-2">
                  {lesson.summary}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-blue-900 font-medium">
                  {lesson.keyConcept}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Leer Lección Completa</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Materiales y Recursos Autorizados */}
      {(() => {
        const mySections = adminService.getSectionsForStudent(student.id);
        const allMaterials = mySections.flatMap((sec) =>
          adminService
            .getMaterials(sec.id)
            .filter((m) => m.status === 'published')
            .map((m) => ({ ...m, sectionName: sec.name, sectionIcon: sec.icon }))
        );

        if (allMaterials.length === 0) return null;

        return (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-3 border-amber-200/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-fun block">
                    Recursos Pedagógicos Autorizados
                  </span>
                  <h3 className="text-base font-black text-slate-900 font-fun">
                    Materiales y Guías de mi Sección
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-fun">
                {allMaterials.length} documentos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-100/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-900 font-fun px-2 py-0.5 rounded-lg bg-amber-200/60 flex items-center gap-1">
                        <span>{mat.sectionIcon}</span>
                        <span className="truncate max-w-[140px]">{mat.sectionName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{mat.sizeLabel}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 font-fun leading-tight mb-1">
                      {mat.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {mat.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {mat.type.toUpperCase()}
                    </span>

                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 font-fun"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar / Abrir</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Interactive Lesson Reader Modal */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-3 border-blue-200 space-y-5 animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 font-fun block">
                  Lección Conceptual • Grado {activeLesson.grade}
                </span>
                <h2 className="text-lg sm:text-2xl font-black font-fun text-slate-900">
                  {activeLesson.title}
                </h2>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reading Content */}
            <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
              {activeLesson.fullContent.map((paragraph, idx) => (
                <p key={idx} className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                  {paragraph}
                </p>
              ))}

              <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase text-amber-900 block font-fun">
                    Ejemplo Práctico Eureka
                  </span>
                  <span className="text-xs text-amber-950 font-medium">
                    {activeLesson.example}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkpoint Mini Quiz */}
            <div className="p-4 bg-sky-50 rounded-2xl border-2 border-sky-200 space-y-3">
              <span className="text-xs font-bold uppercase text-sky-900 font-fun block flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>Comprueba tu Comprensión</span>
              </span>

              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {activeLesson.quizQuestion.question}
              </p>

              <div className="space-y-2">
                {activeLesson.quizQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center justify-between ${
                      selectedQuizAnswer === i
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedQuizAnswer === i && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleVerifyQuiz}
                  disabled={selectedQuizAnswer === null}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-fun font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Verificar Respuesta
                </button>
              ) : (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    selectedQuizAnswer === activeLesson.quizQuestion.correctIndex
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {activeLesson.quizQuestion.explanation}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-fun font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cerrar Lección
              </button>

              <button
                onClick={() => {
                  handleCloseModal();
                  onGoToGame(activeLesson.subject);
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fun font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span>¡Poner a Prueba en los Juegos!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
