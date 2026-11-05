/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Student } from '../types';
import { storage } from '../services/storageService';
import { audio } from '../services/audioService';
import {
  Swords,
  Users,
  KeyRound,
  Sparkles,
  Trophy,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bot,
  Zap,
  Flame,
  Award,
  Shield,
  HelpCircle,
  Radio,
} from 'lucide-react';

interface FriendlyDuelArenaProps {
  student: Student;
  onStudentUpdated: () => void;
  onBackToArcade: () => void;
}

interface PlayerInfo {
  studentId: string;
  name: string;
  avatarIcon: string;
  score: number;
}

interface RoundResultData {
  studentId: string;
  name: string;
  answerIndex: number | null;
  isCorrect: boolean;
  earnedPoints: number;
  totalScore: number;
}

export const FriendlyDuelArena: React.FC<FriendlyDuelArenaProps> = ({
  student,
  onStudentUpdated,
  onBackToArcade,
}) => {
  // Connection & Room state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [matchCategory, setMatchCategory] = useState<'math' | 'logic' | 'mixed'>('mixed');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Match flow: 'lobby' | 'queue' | 'room_waiting' | 'starting' | 'in_round' | 'round_result' | 'game_over'
  const [matchStatus, setMatchStatus] = useState<
    'lobby' | 'queue' | 'room_waiting' | 'starting' | 'in_round' | 'round_result' | 'game_over'
  >('lobby');

  // Players in match
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [opponentAnswered, setOpponentAnswered] = useState<boolean>(false);

  // Round data
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    category: string;
    categoryLabel: string;
    icon: string;
    question: string;
    options: string[];
    timeLimitSeconds: number;
  } | null>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [roundResult, setRoundResult] = useState<{
    correctIndex: number;
    explanation: string;
    results: RoundResultData[];
    isLastRound: boolean;
  } | null>(null);

  // Final match results
  const [gameOverData, setGameOverData] = useState<{
    winner: { studentId: string; name: string; avatarIcon: string } | null;
    isTie: boolean;
    finalScores: PlayerInfo[];
    rewards: {
      winnerBonusXp: number;
      winnerCoins: number;
      participantBonusXp: number;
      participantCoins: number;
    };
  } | null>(null);

  const [hasClaimedRewards, setHasClaimedRewards] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Derive avatar icon for current student
  const studentAvatarIcon =
    student.avatar.characterType === 'robot'
      ? '🤖'
      : student.avatar.characterType === 'girl'
      ? '👧'
      : '👦';

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      setErrorMessage(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'queue_waiting') {
          setMatchStatus('queue');
        } else if (data.type === 'room_created') {
          setRoomCode(data.roomCode);
          setPlayers(data.players || []);
          setMatchStatus('room_waiting');
        } else if (data.type === 'match_found') {
          setRoomCode(data.roomCode);
          setPlayers(data.players || []);
          setMatchStatus('starting');
          audio.playPop();
        } else if (data.type === 'round_start') {
          setCurrentRound(data.round);
          setTotalRounds(data.totalRounds);
          setCurrentQuestion(data.question);
          setSelectedOption(null);
          setOpponentAnswered(false);
          setRoundResult(null);
          setSecondsLeft(data.question.timeLimitSeconds || 15);
          setPlayers(data.scores || []);
          setMatchStatus('in_round');
          audio.playPop();
        } else if (data.type === 'timer_tick') {
          setSecondsLeft(data.secondsLeft);
        } else if (data.type === 'player_answered') {
          if (data.studentId !== student.id) {
            setOpponentAnswered(true);
            audio.playPop();
          }
        } else if (data.type === 'round_result') {
          setRoundResult(data);
          setMatchStatus('round_result');

          const myResult = data.results.find((r: RoundResultData) => r.studentId === student.id);
          if (myResult?.isCorrect) {
            audio.playGemSparkle();
          } else {
            audio.playMismatch();
          }

          // Update local player scores
          setPlayers((prev) =>
            prev.map((p) => {
              const res = data.results.find((r: RoundResultData) => r.studentId === p.studentId);
              return res ? { ...p, score: res.totalScore } : p;
            })
          );
        } else if (data.type === 'game_over') {
          setGameOverData(data);
          setMatchStatus('game_over');

          const isWinner = data.winner && data.winner.studentId === student.id;
          if (isWinner) {
            audio.playVictoryFanfare();
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#f43f5e', '#f59e0b', '#10b981', '#0284c7'],
            });
          } else {
            audio.playActivityComplete();
          }
        } else if (data.type === 'error') {
          setErrorMessage(data.message);
          audio.playMismatch();
        } else if (data.type === 'player_left') {
          setErrorMessage('Tu oponente se ha desconectado del duelo.');
        }
      } catch (e) {
        console.warn('Error parsing WS message:', e);
      }
    };

    socket.onerror = () => {
      setIsConnected(false);
      setErrorMessage('Error al conectar con el servidor de duelos.');
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    setWs(socket);
    wsRef.current = socket;

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'leave_room' }));
      }
      socket.close();
    };
  }, [student.id]);

  // Award rewards to student profile on game over
  useEffect(() => {
    if (matchStatus === 'game_over' && gameOverData && !hasClaimedRewards) {
      const isWinner = gameOverData.winner?.studentId === student.id;
      const earnedXp = isWinner
        ? gameOverData.rewards.winnerBonusXp
        : gameOverData.rewards.participantBonusXp;
      const earnedCoins = isWinner
        ? gameOverData.rewards.winnerCoins
        : gameOverData.rewards.participantCoins;

      storage.awardDuelRewards(student.id, earnedXp, earnedCoins);
      onStudentUpdated();
      setHasClaimedRewards(true);
    }
  }, [matchStatus, gameOverData, hasClaimedRewards, student.id]);

  // Actions
  const handleJoinQueue = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    audio.playPop();
    setErrorMessage(null);
    setHasClaimedRewards(false);
    ws.send(
      JSON.stringify({
        type: 'join_matchmaking',
        studentId: student.id,
        name: student.name,
        avatarIcon: studentAvatarIcon,
        category: matchCategory,
      })
    );
  };

  const handleCreateRoom = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    audio.playPop();
    setErrorMessage(null);
    setHasClaimedRewards(false);
    ws.send(
      JSON.stringify({
        type: 'create_room',
        studentId: student.id,
        name: student.name,
        avatarIcon: studentAvatarIcon,
        category: matchCategory,
      })
    );
  };

  const handleJoinRoomByCode = () => {
    const code = joinCodeInput.trim();
    if (!code || !ws || ws.readyState !== WebSocket.OPEN) return;
    audio.playPop();
    setErrorMessage(null);
    setHasClaimedRewards(false);
    ws.send(
      JSON.stringify({
        type: 'join_room',
        roomCode: code,
        studentId: student.id,
        name: student.name,
        avatarIcon: studentAvatarIcon,
      })
    );
  };

  const handleStartWithSparringBot = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    audio.playPop();
    setErrorMessage(null);
    setHasClaimedRewards(false);
    ws.send(
      JSON.stringify({
        type: 'start_with_sparring_bot',
        studentId: student.id,
        name: student.name,
        avatarIcon: studentAvatarIcon,
        category: matchCategory,
      })
    );
  };

  const handleSubmitAnswer = (optionIndex: number) => {
    if (selectedOption !== null || !roomCode || !ws || matchStatus !== 'in_round') return;
    setSelectedOption(optionIndex);
    audio.playPop();

    ws.send(
      JSON.stringify({
        type: 'submit_answer',
        roomCode,
        studentId: student.id,
        answerIndex: optionIndex,
        timeRemaining: secondsLeft,
      })
    );
  };

  const handleRematch = () => {
    if (!ws || !roomCode) return;
    audio.playPop();
    setHasClaimedRewards(false);
    ws.send(
      JSON.stringify({
        type: 'rematch',
        roomCode,
        studentId: student.id,
      })
    );
  };

  const handleBackToLobby = () => {
    if (ws && roomCode) {
      ws.send(JSON.stringify({ type: 'leave_room' }));
    }
    audio.playPop();
    setRoomCode(null);
    setMatchStatus('lobby');
    setGameOverData(null);
    setRoundResult(null);
    setHasClaimedRewards(false);
  };

  // Find me and opponent
  const me = players.find((p) => p.studentId === student.id) || {
    studentId: student.id,
    name: student.name,
    avatarIcon: studentAvatarIcon,
    score: 0,
  };

  const opponent = players.find((p) => p.studentId !== student.id) || {
    studentId: 'opp_waiting',
    name: 'Esperando rival...',
    avatarIcon: '👤',
    score: 0,
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Banner Navigation */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-rose-200 shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            if (ws) ws.close();
            onBackToArcade();
          }}
          className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-950 font-fun font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Volver al Arcade de Juegos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-fun font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-rose-600" />
            <span>Duelo Amistoso en Vivo</span>
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isConnected
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {isConnected ? '● Conectado (WS)' : '○ Conectando...'}
          </span>
        </div>
      </div>

      {/* Error banner if any */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs font-bold text-rose-800 flex items-center justify-between animate-in fade-in">
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-600 hover:text-rose-900 underline font-fun"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: DUEL LOBBY (Matchmaking, Room Code, Sparring)
          ========================================================================= */}
      {matchStatus === 'lobby' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-3 border-rose-200/90 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-600 text-white text-3xl shadow-lg animate-float-bob">
              ⚔️
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-fun text-slate-900 tracking-tight">
              Arena de Duelo Amistoso
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Desafía a tus compañeros de clase en tiempo real. Responde rápido desafíos de fracciones, lógica espacial y algoritmos para ganar XP adicional y monedas Eureka.
            </p>
          </div>

          {/* Category Selector */}
          <div className="max-w-md mx-auto space-y-1.5 text-center">
            <span className="text-xs font-bold font-fun text-slate-700 uppercase tracking-wider block">
              Tipo de Desafío:
            </span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              {[
                { id: 'mixed', label: '🌟 Mixto', desc: 'Todo' },
                { id: 'math', label: '⚖️ Matemáticas', desc: 'Fracciones' },
                { id: 'logic', label: '🚀 Lógica', desc: 'Algoritmos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    audio.playPop();
                    setMatchCategory(cat.id as any);
                  }}
                  className={`py-2 px-2 rounded-xl font-fun font-bold text-xs transition cursor-pointer ${
                    matchCategory === cat.id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <span className="block">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 1. Quick Match */}
            <div className="bg-gradient-to-b from-rose-50 to-white border-2 border-rose-300 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-xs mb-3">
                  ⚡
                </div>
                <h3 className="font-fun font-black text-slate-900 text-base">
                  Partida Rápida
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Busca automáticamente a cualquier compañero conectado en la red del aula para jugar al instante.
                </p>
              </div>

              <button
                disabled={!isConnected}
                onClick={handleJoinQueue}
                className="mt-4 w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-fun font-bold text-xs rounded-2xl shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Buscar Rival en Vivo</span>
              </button>
            </div>

            {/* 2. Create Private Room */}
            <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs mb-3">
                  🔑
                </div>
                <h3 className="font-fun font-black text-slate-900 text-base">
                  Crear Sala Privada
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Genera un código de 4 dígitos para compartir con un amigo y jugar juntos en otra pestaña o dispositivo.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  disabled={!isConnected}
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-fun font-bold text-xs rounded-2xl shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Crear Código de Sala</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="Código (ej. 4821)"
                    className="flex-1 px-3 py-1.5 text-center font-mono font-bold text-xs rounded-xl border border-slate-300 bg-white uppercase outline-none focus:border-amber-500"
                  />
                  <button
                    disabled={joinCodeInput.trim().length !== 4 || !isConnected}
                    onClick={handleJoinRoomByCode}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-fun font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Unirse
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Instant Sparring Bot */}
            <div className="bg-gradient-to-b from-sky-50 to-white border-2 border-sky-300 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-xl shadow-xs mb-3">
                  🤖
                </div>
                <h3 className="font-fun font-black text-slate-900 text-base">
                  Sparring Inmediato
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  ¿No hay compañeros en línea en este momento? Enfréntate al bot de entrenamiento escolar sin esperas.
                </p>
              </div>

              <button
                disabled={!isConnected}
                onClick={handleStartWithSparringBot}
                className="mt-4 w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white font-fun font-bold text-xs rounded-2xl shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Jugar Ahora con Bot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: WAITING IN QUEUE OR WAITING FOR CODE TO JOIN
          ========================================================================= */}
      {(matchStatus === 'queue' || matchStatus === 'room_waiting') && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border-3 border-rose-200/90 shadow-xl text-center space-y-6 max-w-lg mx-auto">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 text-rose-600 text-4xl shadow-inner">
            <Radio className="w-10 h-10 animate-pulse text-rose-600" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black font-fun text-slate-900">
              {matchStatus === 'queue' ? 'Buscando oponente en el aula...' : 'Esperando a tu compañero...'}
            </h3>
            {roomCode && (
              <div className="mt-3 p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl">
                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">
                  Comparte este código con tu amigo:
                </span>
                <span className="font-mono text-3xl font-black text-amber-900 tracking-widest">
                  {roomCode}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              El duelo comenzará automáticamente tan pronto como ambos jugadores estén listos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartWithSparringBot}
              className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-fun font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Jugar con Bot Sparring</span>
            </button>

            <button
              onClick={handleBackToLobby}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: MATCH STARTING COUNTDOWN
          ========================================================================= */}
      {matchStatus === 'starting' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 border-3 border-rose-300 shadow-2xl text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-200">
          <span className="text-5xl animate-bounce inline-block">⚔️</span>
          <h2 className="text-2xl font-black font-fun text-slate-900">
            ¡Duelo Encontrado!
          </h2>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-3xl shadow-sm mx-auto">
                {me.avatarIcon}
              </div>
              <span className="font-fun font-black text-sm text-slate-800 mt-2 block">
                {me.name} (Tú)
              </span>
            </div>

            <span className="font-fun font-black text-2xl text-rose-500 animate-pulse">
              VS
            </span>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl shadow-sm mx-auto">
                {opponent.avatarIcon}
              </div>
              <span className="font-fun font-black text-sm text-slate-800 mt-2 block">
                {opponent.name}
              </span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 font-fun">
            Preparando Ronda 1 de {totalRounds}... ¡Listos en sus marcas!
          </p>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: ACTIVE ROUND ARENA (Live Questions & Opponent Status)
          ========================================================================= */}
      {(matchStatus === 'in_round' || matchStatus === 'round_result') && currentQuestion && (
        <div className="space-y-4">
          {/* Top Scoreboard: Player 1 (You) vs Player 2 (Opponent) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-3 border-rose-200/90 shadow-xl grid grid-cols-12 gap-3 items-center">
            {/* Player 1 (You) */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white shrink-0">
                {me.avatarIcon}
              </div>
              <div className="min-w-0">
                <span className="font-fun font-black text-xs sm:text-sm text-slate-900 block truncate">
                  {me.name} <span className="text-[10px] text-sky-700 font-bold">(Tú)</span>
                </span>
                <span className="font-mono font-extrabold text-base sm:text-xl text-sky-600">
                  {me.score} pts
                </span>
                {selectedOption !== null && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full block w-max mt-0.5">
                    ✓ ¡Respondido!
                  </span>
                )}
              </div>
            </div>

            {/* Center: Timer & Round */}
            <div className="col-span-2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-fun font-black text-slate-500 uppercase tracking-wider">
                Ronda {currentRound}/{totalRounds}
              </span>
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-black text-base shadow-sm border-2 transition-colors ${
                  secondsLeft <= 5
                    ? 'bg-rose-500 text-white border-rose-600 animate-ping'
                    : secondsLeft <= 8
                    ? 'bg-amber-400 text-slate-900 border-amber-500'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-400'
                }`}
              >
                {secondsLeft}
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="col-span-5 flex items-center justify-end gap-3 text-right">
              <div className="min-w-0">
                <span className="font-fun font-black text-xs sm:text-sm text-slate-900 block truncate">
                  {opponent.name}
                </span>
                <span className="font-mono font-extrabold text-base sm:text-xl text-rose-600">
                  {opponent.score} pts
                </span>
                {opponentAnswered ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                    ✓ ¡Respondido!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    Pensando...
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-white shrink-0">
                {opponent.avatarIcon}
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-3 border-sky-200/90 shadow-xl space-y-6 relative overflow-hidden">
            {/* Category tag */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-fun font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 flex items-center gap-1.5">
                <span>{currentQuestion.icon}</span>
                <span>{currentQuestion.categoryLabel}</span>
              </span>

              <span className="text-xs font-mono font-bold text-slate-400">
                +100 pts base • +bono por velocidad
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-2xl font-black font-fun text-slate-900 leading-snug">
              {currentQuestion.question}
            </h3>

            {/* 4 Interactive Answer Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {currentQuestion.options.map((optionText, idx) => {
                const isSelectedByMe = selectedOption === idx;
                const isRoundOver = matchStatus === 'round_result' && roundResult;
                const isCorrect = isRoundOver && roundResult.correctIndex === idx;
                const isWrongSelection = isRoundOver && isSelectedByMe && !isCorrect;

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null || matchStatus !== 'in_round'}
                    onClick={() => handleSubmitAnswer(idx)}
                    className={`p-4 rounded-2xl border-2 text-left font-fun font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-98 ${
                      isCorrect
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-300/50 scale-[1.02]'
                        : isWrongSelection
                        ? 'bg-rose-500 border-rose-600 text-white shadow-md'
                        : isSelectedByMe
                        ? 'bg-sky-600 border-sky-700 text-white shadow-md ring-2 ring-sky-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-black ${
                          isCorrect || isSelectedByMe || isWrongSelection
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                    {isWrongSelection && <XCircle className="w-5 h-5 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Round Result Feedback Banner (shows during round_result review) */}
            {matchStatus === 'round_result' && roundResult && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 animate-in fade-in space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-fun font-bold text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Explicación Conceptual:</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {roundResult.explanation}
                </p>
                <div className="pt-1 text-[11px] text-amber-800 font-mono font-bold">
                  Siguiente ronda en camino... ⏱️
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: GAME OVER & REWARDS PODIUM
          ========================================================================= */}
      {matchStatus === 'game_over' && gameOverData && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border-3 border-rose-200/90 shadow-2xl text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-500 text-white text-4xl shadow-xl animate-float-bob">
            🏆
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-fun block">
              Duelo Completado • Resultados Finales
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-fun text-slate-900 mt-1">
              {gameOverData.isTie
                ? '¡Empate Épico de Sabiduría!'
                : gameOverData.winner?.studentId === student.id
                ? '¡Victoria Magistral!'
                : `¡Buen Desempeño!`
              }
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {gameOverData.isTie
                ? 'Ambos jugadores demostraron un razonamiento matemático y lógico impecable.'
                : gameOverData.winner?.studentId === student.id
                ? `Has ganado el duelo demostrando gran velocidad y dominio conceptual.`
                : `Tu oponente ${gameOverData.winner?.name} se llevó la victoria por poco. ¡Gran esfuerzo!`
              }
            </p>
          </div>

          {/* Scores Breakdown Box */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {gameOverData.finalScores.map((p) => {
              const isWinner = gameOverData.winner?.studentId === p.studentId;
              const isMe = p.studentId === student.id;

              return (
                <div
                  key={p.studentId}
                  className={`p-3 rounded-2xl border ${
                    isWinner
                      ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-300/50'
                      : 'bg-white/60 border-slate-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{p.avatarIcon}</div>
                  <div className="font-fun font-black text-xs text-slate-900 truncate">
                    {p.name} {isMe && '(Tú)'}
                  </div>
                  <div className="font-mono font-black text-lg text-rose-600 mt-0.5">
                    {p.score} pts
                  </div>
                  {isWinner && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full inline-block mt-1">
                      🥇 Ganador
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bonus Experience & Coins Claim Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-around text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block font-fun">
                Experiencia Ganada
              </span>
              <span className="font-fun font-black text-lg sm:text-xl text-emerald-700 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                +{gameOverData.winner?.studentId === student.id
                  ? gameOverData.rewards.winnerBonusXp
                  : gameOverData.rewards.participantBonusXp}{' '}
                XP
              </span>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block font-fun">
                Monedas Eureka
              </span>
              <span className="font-fun font-black text-lg sm:text-xl text-amber-700 flex items-center justify-center gap-1">
                <span>🪙</span>
                +{gameOverData.winner?.studentId === student.id
                  ? gameOverData.rewards.winnerCoins
                  : gameOverData.rewards.participantCoins}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRematch}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-fun font-bold text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Revancha Inmediata</span>
            </button>

            <button
              onClick={handleBackToLobby}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Volver al Lobby de Duelos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
