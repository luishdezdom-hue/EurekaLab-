/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DuelQuestion {
  id: string;
  category: 'math' | 'logic';
  categoryLabel: string;
  icon: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timeLimitSeconds: number;
}

export const DUEL_QUESTIONS_BANK: DuelQuestion[] = [
  // MATEMÁTICAS (Fracciones, Balanza, Proporciones)
  {
    id: 'math_1',
    category: 'math',
    categoryLabel: 'Balanza de Fracciones',
    icon: '⚖️',
    question: '¿Cuántas piezas de 1/8 necesitas en la balanza para equilibrar exactamente una pieza de 1/2?',
    options: ['2 piezas', '4 piezas', '6 piezas', '8 piezas'],
    correctIndex: 1,
    explanation: '4 piezas de 1/8 suman 4/8, que simplificado (dividiendo entre 4) equivale a 1/2.',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_2',
    category: 'math',
    categoryLabel: 'Fracciones Equivalentes',
    icon: '🍰',
    question: 'Si una barra de energía submarina se divide en 4 partes y tomas 2, ¿a qué fracción simple equivale?',
    options: ['1/4', '1/2', '3/4', '2/3'],
    correctIndex: 1,
    explanation: '2/4 es exactamente la mitad de la barra: 2 dividido entre 4 es igual a 1/2 (0.50).',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_3',
    category: 'math',
    categoryLabel: 'Balanza de Pesos',
    icon: '⚖️',
    question: 'En el plato izquierdo hay 3/4. ¿Qué combinación en el plato derecho lo equilibra a la perfección?',
    options: ['1/2 + 1/4', '1/8 + 1/4', '1/2 + 1/2', '1/4 + 1/8'],
    correctIndex: 0,
    explanation: '1/2 equivale a 2/4. Sumando 2/4 + 1/4 obtenemos exactamente 3/4.',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_4',
    category: 'math',
    categoryLabel: 'Comparación Numérica',
    icon: '🔢',
    question: '¿Cuál de las siguientes fracciones es MAYOR que 1/2?',
    options: ['1/4', '3/8', '5/8', '2/6'],
    correctIndex: 2,
    explanation: 'Como 1/2 equivale a 4/8, la fracción 5/8 tiene más octavos y por tanto es mayor.',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_5',
    category: 'math',
    categoryLabel: 'Proporciones en Base 6',
    icon: '⚖️',
    question: '¿A cuántos sextos equivale una pieza de 1/3 en la balanza marina?',
    options: ['1/6', '2/6', '3/6', '4/6'],
    correctIndex: 1,
    explanation: 'Multiplicando numerador y denominador por 2: (1 × 2) / (3 × 2) = 2/6.',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_6',
    category: 'math',
    categoryLabel: 'Suma Fraccionaria',
    icon: '➕',
    question: '¿Cuál es el resultado de sumar: 1/8 + 1/8 + 1/8 + 1/8 + 1/8?',
    options: ['5/8', '5/40', '1/2', '3/4'],
    correctIndex: 0,
    explanation: 'Al tener el mismo denominador, solo sumas los numeradores: 1+1+1+1+1 = 5/8.',
    timeLimitSeconds: 15,
  },
  {
    id: 'math_7',
    category: 'math',
    categoryLabel: 'El Entero Completo',
    icon: '🎯',
    question: 'Si en el plato tienes 1/2 y 1/4, ¿cuánto peso te falta para completar 1 entero (1.0)?',
    options: ['1/4', '1/8', '1/2', '3/8'],
    correctIndex: 0,
    explanation: '1/2 (2/4) + 1/4 = 3/4. Para llegar a 4/4 (1 entero) falta exactamente 1/4.',
    timeLimitSeconds: 15,
  },

  // LÓGICA Y ALGORITMOS (Pensamiento Computacional, Cuadrícula, Compuertas)
  {
    id: 'logic_1',
    category: 'logic',
    categoryLabel: 'Coordenadas Espaciales',
    icon: '🚀',
    question: 'La nave está en la casilla (1, 2) mirando al Este (+X). Si ejecuta "Avanzar 1 Paso", ¿a dónde llega?',
    options: ['(2, 2)', '(1, 3)', '(1, 1)', '(0, 2)'],
    correctIndex: 0,
    explanation: 'Moverse hacia el Este aumenta la coordenada X en 1, manteniendo Y constante: (2, 2).',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_2',
    category: 'logic',
    categoryLabel: 'Orientación y Giros',
    icon: '🔄',
    question: 'Tu rover espacial mira al Norte. Si hace dos giros seguidos a la izquierda (90° + 90°), ¿hacia dónde apunta?',
    options: ['Al Sur', 'Al Este', 'Al Oeste', 'Al Norte'],
    correctIndex: 0,
    explanation: 'Girar 180° (dos giros de 90° a la izquierda) invierte la dirección por completo: Norte pasa a Sur.',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_3',
    category: 'logic',
    categoryLabel: 'Compuertas Booleanas',
    icon: '⚡',
    question: 'En un circuito submarino con compuerta AND, ¿cuándo se enciende la luz de paso (1)?',
    options: [
      'Solo cuando AMBAS entradas son 1',
      'Si al menos una entrada es 1',
      'Cuando ambas entradas son 0',
      'Siempre que haya energía',
    ],
    correctIndex: 0,
    explanation: 'La compuerta AND (Y) es estricta: requiere que TODAS sus entradas sean verdaderas (1) para dar 1.',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_4',
    category: 'logic',
    categoryLabel: 'Inversión Lógica',
    icon: '🔌',
    question: 'Una compuerta NOT invierte la señal. Si entra un 0 (Falso), ¿qué valor sale?',
    options: ['1 (Verdadero)', '0 (Falso)', 'Ninguno', '-1'],
    correctIndex: 0,
    explanation: 'El operador NOT (NO) convierte 0 en 1 y 1 en 0.',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_5',
    category: 'logic',
    categoryLabel: 'Compuerta OR',
    icon: '⚡',
    question: 'En una compuerta OR (O), si la entrada A es 1 y la entrada B es 0, ¿cuál es el resultado?',
    options: ['1 (Verdadero)', '0 (Falso)', 'Error de circuito', 'Indefinido'],
    correctIndex: 0,
    explanation: 'La compuerta OR solo necesita que al menos UNA de sus entradas sea 1 para emitir 1.',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_6',
    category: 'logic',
    categoryLabel: 'Secuencia Algorítmica',
    icon: '🧩',
    question: 'Si avanzas 4 casillas hacia el frente y luego retrocedes 1 casilla, ¿a cuántas casillas quedas del inicio?',
    options: ['3 casillas', '5 casillas', '4 casillas', '2 casillas'],
    correctIndex: 0,
    explanation: '4 pasos adelante menos 1 paso atrás = 3 casillas de desplazamiento neto.',
    timeLimitSeconds: 15,
  },
  {
    id: 'logic_7',
    category: 'logic',
    categoryLabel: 'Deducción Lógica',
    icon: '💡',
    question: 'Premisa: Todos los fitoplancton hacen fotosíntesis. La diatomea es fitoplancton. Por lo tanto...',
    options: [
      'La diatomea hace fotosíntesis',
      'La diatomea es un depredador ápice',
      'La diatomea no necesita luz',
      'No se puede deducir nada',
    ],
    correctIndex: 0,
    explanation: 'Por deducción silogística: si la diatomea pertenece al conjunto fitoplancton, hereda su propiedad fotosintética.',
    timeLimitSeconds: 15,
  },
];

export function getRandomDuelQuestions(category: 'math' | 'logic' | 'mixed', count = 5): DuelQuestion[] {
  let pool = [...DUEL_QUESTIONS_BANK];
  if (category === 'math') {
    pool = pool.filter((q) => q.category === 'math');
  } else if (category === 'logic') {
    pool = pool.filter((q) => q.category === 'logic');
  }

  // Shuffle pool using Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}
