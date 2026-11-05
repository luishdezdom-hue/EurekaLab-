/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getRandomDuelQuestions, DuelQuestion } from './src/data/duelQuestions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI SDK with User-Agent as required by AI Studio guidelines
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Assistant Chat API
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    const studentName = context.studentName || 'Estudiante';
    const currentGrade = context.grade || 'Primaria';
    const currentSection = context.currentSection || 'Inicio';
    const activeGame = context.activeGame || null;
    const coins = context.coins ?? 0;
    const progress = context.studentProgress ? JSON.stringify(context.studentProgress) : 'No disponible';

    const systemInstruction = `Eres EurekaBot, el asistente virtual y tutor inteligente con inteligencia artificial de EurekaLab (plataforma educativa gamificada para niños y niñas de primaria en 3ro, 4to, 5to y 6to grado).

TU PERSONALIDAD:
- Eres cálido, entusiasta, paciente, motivador y divertido. Usas un lenguaje claro, accesible y pedagógico adecuado para niños y niñas de primaria.
- Te encanta celebrar los logros y el esfuerzo del estudiante.
- Usas emojis amigables y educativos (🤖, 💡, 🚀, ⚖️, 💎, 🌊, 🐠, ⭐).
- Empleas el MÉTODO SOCRÁTICO: no te limites a dar la respuesta final sin pensar; explica el concepto, proporciona ejemplos de la vida real (rebanadas de pizza, cajas de juguetes, pasos de baile, viajes espaciales) y plantea preguntas reflexivas que ayuden al estudiante a razonar por sí mismo.
- Cuando el estudiante tenga dificultades, sé comprensivo, divide el problema en pasos pequeños y anímalo a intentarlo de nuevo.

CONTEXTO ACTUAL DEL ESTUDIANTE:
- Nombre: ${studentName}
- Grado escolar: ${currentGrade}
- Sección actual: ${currentSection}
- Juego activo: ${activeGame ? activeGame : 'Ninguno en este momento'}
- Monedas Eureka: ${coins}
- Progreso de niveles: ${progress}

CONOCIMIENTO INTEGRADO DE EUREKALAB:
1. "Balanza de Fracciones": Los estudiantes equilibran un plato meta usando piezas fraccionarias (1/2, 1/4, 1/8, 1/3, 1/6, 3/4, 5/8, 2/3, 5/6, 7/8). Explica por qué dos cuartos hacen un medio, o cómo cuatro octavos equivalen a dos cuartos con la metáfora de partir chocolates o barras de energía.
2. "Algoritmos en Cuadrícula": Guiar una nave espacial en una cuadrícula 5x4 con coordenadas (0,0 a 4,3) evitando obstáculos hasta llegar a la casilla de meta (🏁) y recoger la gema de energía (💎). Comandos: 'Avanzar 1 Paso', 'Girar Izquierda' (90° antihorario), 'Girar Derecha' (90° horario), 'Recoger Gema'.
3. "Templo de Comprensión Lectora": Preguntas literales (datos explícitos en el texto), inferenciales (conectar pistas que no están escritas directamente) y críticas (emitir un juicio reflexivo o ecológico sobre el océano y la ciencia).
4. "Laboratorio Bio-Marino": Cadenas y redes tróficas marinas, organismos productores (fitoplancton, algas), consumidores primarios (krill, erizos), secundarios, superdepredadores (tiburones) y descomponedores, así como la regla del 10% de transferencia de biomasa de Lindeman.
5. "Circuito Lógico Submarino": Compuertas lógicas booleanas AND (ambas entradas deben ser 1), OR (al menos una entrada en 1), NOT (invierte la señal 0 a 1 o 1 a 0), XOR (solo una de las dos es 1).
6. "Duelo Amistoso": Modalidad multijugador PvP en tiempo real sobre WebSockets donde dos estudiantes compiten respondiendo desafíos rápidos de matemáticas y lógica por puntos de experiencia (XP) y Eurekas adicionales.

INSTRUCCIONES DE FORMATO:
- Responde siempre en español.
- Respuestas directas, pedagógicas y bien estructuradas (2 a 4 párrafos o listas con viñetas cuando sea útil).
- Al final de tu mensaje, añade una línea que empiece exactamente con "SUGERENCIAS:" con 2 o 3 opciones cortas de preguntas de seguimiento separadas por punto y coma (;). Ejemplo:
SUGERENCIAS: ¿Me das un ejemplo con 1/4?; ¿Cómo giro mi nave sin chocar?; Quiero ir a practicar en la Balanza`;

    // Format chat history for Gemini contents
    const contents: any[] = [];

    // Add prior history messages (max last 10 messages for context)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const h of recentHistory) {
      if (h && h.text) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(h.text) }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Multi-model resilient strategy to handle transient 503/429 spikes smoothly
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Candidate model ${modelName} failed, trying next fallback:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      if (lastError) throw lastError;
      throw new Error('No se recibió texto del modelo.');
    }

    const replyRaw = response.text || '¡Hola! Estoy listo para ayudarte a aprender y resolver cualquier duda.';

    // Extract SUGERENCIAS if present
    let replyText = replyRaw;
    let suggestions: string[] = [];

    const sugIndex = replyRaw.indexOf('SUGERENCIAS:');
    if (sugIndex !== -1) {
      replyText = replyRaw.substring(0, sugIndex).trim();
      const sugPart = replyRaw.substring(sugIndex + 'SUGERENCIAS:'.length).trim();
      suggestions = sugPart
        .split(';')
        .map((s: string) => s.trim().replace(/^[-•*]\s*/, ''))
        .filter((s: string) => s.length > 0 && s.length < 80);
    }

    if (suggestions.length === 0) {
      suggestions = [
        '¿Puedes darme un ejemplo paso a paso?',
        '¿Cómo puedo superar este nivel?',
        'Explícame este concepto con una analogía',
      ];
    }

    return res.json({
      reply: replyText,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return res.status(500).json({
      error: 'Error al comunicarse con el asistente virtual.',
      details: error?.message || String(error),
      fallbackReply:
        '¡Hola! He tenido un pequeño inconveniente de conexión, pero puedo ayudarte a repasar las fracciones, los algoritmos de la cuadrícula o la comprensión lectora. ¿En qué puedo ayudarte hoy?',
      suggestions: [
        '¿Por qué 2/4 es igual a 1/2?',
        '¿Cómo planifico una ruta en la cuadrícula?',
        '¿Cómo identifico una pregunta inferencial?',
      ],
    });
  }
});

// =========================================================================
// WEBSOCKET REAL-TIME MULTIPLAYER DUEL SYSTEM (FRIENDLY DUEL)
// =========================================================================

interface DuelPlayer {
  ws: WebSocket | null;
  studentId: string;
  name: string;
  avatarIcon: string;
  score: number;
  currentAnswer: number | null;
  answerTimeSeconds: number | null;
  isBot?: boolean;
}

interface DuelRoom {
  roomCode: string;
  category: 'math' | 'logic' | 'mixed';
  players: Map<string, DuelPlayer>;
  status: 'waiting' | 'starting' | 'in_round' | 'round_result' | 'game_over';
  questions: DuelQuestion[];
  currentRound: number; // 0-indexed (0 to 4)
  totalRounds: number;
  roundTimer: NodeJS.Timeout | null;
  roundRemainingSeconds: number;
  timerInterval: NodeJS.Timeout | null;
}

const duelRooms = new Map<string, DuelRoom>();
const matchmakingQueue: { studentId: string; ws: WebSocket; name: string; avatarIcon: string; category: 'math' | 'logic' | 'mixed' }[] = [];

function generateRoomCode(): string {
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (duelRooms.has(code));
  return code;
}

function broadcastToRoom(room: DuelRoom, message: object) {
  const payload = JSON.stringify(message);
  room.players.forEach((player) => {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(payload);
    }
  });
}

function startRound(room: DuelRoom) {
  if (room.currentRound >= room.totalRounds) {
    endGame(room);
    return;
  }

  room.status = 'in_round';
  const currentQuestion = room.questions[room.currentRound];
  room.roundRemainingSeconds = currentQuestion.timeLimitSeconds || 15;

  // Reset player answers for this round
  room.players.forEach((p) => {
    p.currentAnswer = null;
    p.answerTimeSeconds = null;
  });

  // Broadcast round start to all players
  broadcastToRoom(room, {
    type: 'round_start',
    round: room.currentRound + 1,
    totalRounds: room.totalRounds,
    question: {
      id: currentQuestion.id,
      category: currentQuestion.category,
      categoryLabel: currentQuestion.categoryLabel,
      icon: currentQuestion.icon,
      question: currentQuestion.question,
      options: currentQuestion.options,
      timeLimitSeconds: room.roundRemainingSeconds,
    },
    scores: Array.from(room.players.values()).map((p) => ({
      studentId: p.studentId,
      name: p.name,
      avatarIcon: p.avatarIcon,
      score: p.score,
    })),
  });

  // If a bot is playing, schedule bot answer
  const botPlayer = Array.from(room.players.values()).find((p) => p.isBot);
  if (botPlayer) {
    const botDelayMs = 3500 + Math.random() * 4500; // 3.5 to 8s
    setTimeout(() => {
      if (room.status === 'in_round' && botPlayer.currentAnswer === null) {
        // 80% accuracy for simulated peer
        const willBeCorrect = Math.random() < 0.8;
        const answer = willBeCorrect
          ? currentQuestion.correctIndex
          : (currentQuestion.correctIndex + 1) % currentQuestion.options.length;
        submitPlayerAnswer(room, botPlayer.studentId, answer, Math.max(1, room.roundRemainingSeconds - 4));
      }
    }, botDelayMs);
  }

  // Clear existing timers
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.roundTimer) clearTimeout(room.roundTimer);

  // Tick countdown timer
  room.timerInterval = setInterval(() => {
    room.roundRemainingSeconds -= 1;
    broadcastToRoom(room, {
      type: 'timer_tick',
      secondsLeft: room.roundRemainingSeconds,
    });

    if (room.roundRemainingSeconds <= 0) {
      if (room.timerInterval) clearInterval(room.timerInterval);
      resolveRound(room);
    }
  }, 1000);
}

function submitPlayerAnswer(room: DuelRoom, studentId: string, answerIndex: number, timeRemaining: number) {
  if (room.status !== 'in_round') return;

  const player = room.players.get(studentId);
  if (!player || player.currentAnswer !== null) return;

  player.currentAnswer = answerIndex;
  player.answerTimeSeconds = timeRemaining;

  // Notify everyone that player answered (without revealing the answer yet)
  broadcastToRoom(room, {
    type: 'player_answered',
    studentId,
    name: player.name,
  });

  // Check if all players in room answered
  const allAnswered = Array.from(room.players.values()).every((p) => p.currentAnswer !== null);
  if (allAnswered) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.roundTimer) clearTimeout(room.roundTimer);
    setTimeout(() => resolveRound(room), 600);
  }
}

function resolveRound(room: DuelRoom) {
  room.status = 'round_result';
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.roundTimer) clearTimeout(room.roundTimer);

  const currentQuestion = room.questions[room.currentRound];
  const roundResults: any[] = [];

  room.players.forEach((player) => {
    const isCorrect = player.currentAnswer === currentQuestion.correctIndex;
    let earnedPoints = 0;

    if (isCorrect) {
      // Base points + speed bonus
      const speedBonus = Math.round((player.answerTimeSeconds || 1) * 3.5);
      earnedPoints = 100 + speedBonus;
      player.score += earnedPoints;
    }

    roundResults.push({
      studentId: player.studentId,
      name: player.name,
      answerIndex: player.currentAnswer,
      isCorrect,
      earnedPoints,
      totalScore: player.score,
    });
  });

  broadcastToRoom(room, {
    type: 'round_result',
    round: room.currentRound + 1,
    correctIndex: currentQuestion.correctIndex,
    explanation: currentQuestion.explanation,
    results: roundResults,
    isLastRound: room.currentRound + 1 >= room.totalRounds,
  });

  // Next round after 4.5 seconds review
  setTimeout(() => {
    room.currentRound += 1;
    if (room.currentRound < room.totalRounds) {
      startRound(room);
    } else {
      endGame(room);
    }
  }, 4500);
}

function endGame(room: DuelRoom) {
  room.status = 'game_over';
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.roundTimer) clearTimeout(room.roundTimer);

  const playersList = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const winner = playersList[0];
  const isTie = playersList.length > 1 && playersList[0].score === playersList[1].score;

  broadcastToRoom(room, {
    type: 'game_over',
    winner: isTie ? null : { studentId: winner.studentId, name: winner.name, avatarIcon: winner.avatarIcon },
    isTie,
    finalScores: playersList.map((p) => ({
      studentId: p.studentId,
      name: p.name,
      avatarIcon: p.avatarIcon,
      score: p.score,
    })),
    rewards: {
      winnerBonusXp: 120,
      winnerCoins: 30,
      participantBonusXp: 50,
      participantCoins: 15,
    },
  });
}

function handleWebSocketConnection(ws: WebSocket) {
  let boundStudentId: string | null = null;
  let boundRoomCode: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'join_matchmaking') {
        const { studentId, name, avatarIcon = '🐬', category = 'mixed' } = msg;
        boundStudentId = studentId;

        // Check if there is someone in the queue with matching category or mixed
        const existingIdx = matchmakingQueue.findIndex(
          (q) => q.studentId !== studentId && (q.category === category || q.category === 'mixed' || category === 'mixed')
        );

        if (existingIdx !== -1) {
          const opponent = matchmakingQueue.splice(existingIdx, 1)[0];
          const roomCode = generateRoomCode();
          boundRoomCode = roomCode;

          const room: DuelRoom = {
            roomCode,
            category,
            players: new Map(),
            status: 'starting',
            questions: getRandomDuelQuestions(category, 5),
            currentRound: 0,
            totalRounds: 5,
            roundTimer: null,
            roundRemainingSeconds: 15,
            timerInterval: null,
          };

          room.players.set(opponent.studentId, {
            ws: opponent.ws,
            studentId: opponent.studentId,
            name: opponent.name,
            avatarIcon: opponent.avatarIcon,
            score: 0,
            currentAnswer: null,
            answerTimeSeconds: null,
          });

          room.players.set(studentId, {
            ws,
            studentId,
            name,
            avatarIcon,
            score: 0,
            currentAnswer: null,
            answerTimeSeconds: null,
          });

          duelRooms.set(roomCode, room);

          broadcastToRoom(room, {
            type: 'match_found',
            roomCode,
            category,
            players: Array.from(room.players.values()).map((p) => ({
              studentId: p.studentId,
              name: p.name,
              avatarIcon: p.avatarIcon,
              score: 0,
            })),
          });

          // Countdown to first round
          setTimeout(() => startRound(room), 2000);
        } else {
          // Add to queue
          matchmakingQueue.push({ studentId, ws, name, avatarIcon, category });
          ws.send(JSON.stringify({ type: 'queue_waiting', message: 'Buscando oponente en tiempo real...' }));
        }
      } else if (msg.type === 'create_room') {
        const { studentId, name, avatarIcon = '🐬', category = 'mixed' } = msg;
        boundStudentId = studentId;
        const roomCode = generateRoomCode();
        boundRoomCode = roomCode;

        const room: DuelRoom = {
          roomCode,
          category,
          players: new Map(),
          status: 'waiting',
          questions: getRandomDuelQuestions(category, 5),
          currentRound: 0,
          totalRounds: 5,
          roundTimer: null,
          roundRemainingSeconds: 15,
          timerInterval: null,
        };

        room.players.set(studentId, {
          ws,
          studentId,
          name,
          avatarIcon,
          score: 0,
          currentAnswer: null,
          answerTimeSeconds: null,
        });

        duelRooms.set(roomCode, room);

        ws.send(JSON.stringify({
          type: 'room_created',
          roomCode,
          category,
          players: Array.from(room.players.values()).map((p) => ({
            studentId: p.studentId,
            name: p.name,
            avatarIcon: p.avatarIcon,
            score: 0,
          })),
        }));
      } else if (msg.type === 'join_room') {
        const { studentId, name, avatarIcon = '🐬', roomCode } = msg;
        const room = duelRooms.get(roomCode);

        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'El código de sala no existe.' }));
          return;
        }

        if (room.players.size >= 2 && !room.players.has(studentId)) {
          ws.send(JSON.stringify({ type: 'error', message: 'La sala de duelo ya está completa.' }));
          return;
        }

        boundStudentId = studentId;
        boundRoomCode = roomCode;

        room.players.set(studentId, {
          ws,
          studentId,
          name,
          avatarIcon,
          score: 0,
          currentAnswer: null,
          answerTimeSeconds: null,
        });

        broadcastToRoom(room, {
          type: 'match_found',
          roomCode,
          category: room.category,
          players: Array.from(room.players.values()).map((p) => ({
            studentId: p.studentId,
            name: p.name,
            avatarIcon: p.avatarIcon,
            score: 0,
          })),
        });

        setTimeout(() => startRound(room), 2000);
      } else if (msg.type === 'start_with_sparring_bot') {
        const { studentId, name, avatarIcon = '🐬', category = 'mixed' } = msg;
        boundStudentId = studentId;

        // Remove from matchmaking queue if present
        const qIdx = matchmakingQueue.findIndex((q) => q.studentId === studentId);
        if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

        const roomCode = generateRoomCode();
        boundRoomCode = roomCode;

        const sparringNames = ['Alex Bot', 'Sofía Exploradora', 'Leo Naufrago', 'Maya Arrecife'];
        const sparringName = sparringNames[Math.floor(Math.random() * sparringNames.length)];

        const room: DuelRoom = {
          roomCode,
          category,
          players: new Map(),
          status: 'starting',
          questions: getRandomDuelQuestions(category, 5),
          currentRound: 0,
          totalRounds: 5,
          roundTimer: null,
          roundRemainingSeconds: 15,
          timerInterval: null,
        };

        room.players.set(studentId, {
          ws,
          studentId,
          name,
          avatarIcon,
          score: 0,
          currentAnswer: null,
          answerTimeSeconds: null,
        });

        room.players.set('bot_sparring_01', {
          ws: null,
          studentId: 'bot_sparring_01',
          name: sparringName,
          avatarIcon: '🤖',
          score: 0,
          currentAnswer: null,
          answerTimeSeconds: null,
          isBot: true,
        });

        duelRooms.set(roomCode, room);

        broadcastToRoom(room, {
          type: 'match_found',
          roomCode,
          category,
          players: Array.from(room.players.values()).map((p) => ({
            studentId: p.studentId,
            name: p.name,
            avatarIcon: p.avatarIcon,
            score: 0,
          })),
        });

        setTimeout(() => startRound(room), 2000);
      } else if (msg.type === 'submit_answer') {
        const { roomCode, studentId, answerIndex, timeRemaining } = msg;
        const room = duelRooms.get(roomCode);
        if (room) {
          submitPlayerAnswer(room, studentId, answerIndex, timeRemaining);
        }
      } else if (msg.type === 'rematch') {
        const { roomCode, studentId } = msg;
        const room = duelRooms.get(roomCode);
        if (room) {
          room.currentRound = 0;
          room.questions = getRandomDuelQuestions(room.category, 5);
          room.players.forEach((p) => {
            p.score = 0;
            p.currentAnswer = null;
            p.answerTimeSeconds = null;
          });
          startRound(room);
        }
      } else if (msg.type === 'leave_room') {
        if (boundRoomCode) {
          const room = duelRooms.get(boundRoomCode);
          if (room) {
            room.players.delete(boundStudentId || '');
            broadcastToRoom(room, {
              type: 'player_left',
              studentId: boundStudentId,
            });
            if (room.players.size === 0) {
              if (room.timerInterval) clearInterval(room.timerInterval);
              if (room.roundTimer) clearTimeout(room.roundTimer);
              duelRooms.delete(boundRoomCode);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    // Remove from queue
    const qIdx = matchmakingQueue.findIndex((q) => q.ws === ws);
    if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

    // Remove from room
    if (boundRoomCode) {
      const room = duelRooms.get(boundRoomCode);
      if (room && boundStudentId) {
        room.players.delete(boundStudentId);
        broadcastToRoom(room, {
          type: 'player_left',
          studentId: boundStudentId,
        });
        if (room.players.size === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          if (room.roundTimer) clearTimeout(room.roundTimer);
          duelRooms.delete(boundRoomCode);
        }
      }
    }
  });
}

// Start Express and WebSocket server
async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    handleWebSocketConnection(ws);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server with WebSockets listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
