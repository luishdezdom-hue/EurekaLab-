/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Student, NavigationSection } from '../types';
import {
  assistantService,
  ChatMessage,
  Conversation,
  AssistantContext,
} from '../services/assistantService';
import { audio } from '../services/audioService';
import {
  Bot,
  X,
  Send,
  Plus,
  History,
  Sparkles,
  Volume2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Maximize2,
  Minimize2,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface AssistantChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  currentSection: NavigationSection;
  activeGame?: 'math' | 'code' | 'reading' | 'science' | 'circuits' | 'duel' | null;
  activeLevelId?: number;
  onNavigate?: (section: NavigationSection) => void;
}

export const AssistantChatModal: React.FC<AssistantChatModalProps> = ({
  isOpen,
  onClose,
  student,
  currentSection,
  activeGame,
  activeLevelId,
  onNavigate,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations on mount or when student changes
  useEffect(() => {
    if (!student) return;
    const loaded = assistantService.getConversations(student.id);
    setConversations(loaded);

    if (loaded.length > 0) {
      setActiveConversation(loaded[0]);
    } else {
      const newConv = assistantService.createNewConversation(student, {
        activeGame: activeGame || undefined,
      });
      setConversations([newConv]);
      setActiveConversation(newConv);
    }
  }, [student?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages, isOpen, isLoading]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build context object for Gemini API
  const getContext = (): AssistantContext => {
    const gameNames: Record<string, string> = {
      math: 'Balanza de Fracciones',
      code: 'Algoritmos en Cuadrícula',
      reading: 'Templo de Comprensión Lectora',
      science: 'Laboratorio Bio-Marino',
      circuits: 'Circuito Lógico Submarino',
      duel: 'Duelo Amistoso PvP',
    };

    return {
      studentName: student.name,
      grade: student.grade || '4to de Primaria',
      currentSection,
      activeGame: activeGame ? `${gameNames[activeGame] || activeGame} (Nivel ${activeLevelId || 1})` : null,
      gameLevel: activeLevelId,
      coins: student.coins,
      studentProgress: student.progress,
    };
  };

  // Start a new conversation
  const handleStartNewConversation = () => {
    audio.playPop();
    const newConv = assistantService.createNewConversation(student, {
      activeGame: activeGame ? `${activeGame} Nivel ${activeLevelId || 1}` : undefined,
    });
    setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
    setActiveConversation(newConv);
    setShowHistorySidebar(false);
  };

  // Select an existing conversation from history
  const handleSelectConversation = (conv: Conversation) => {
    audio.playPop();
    setActiveConversation(conv);
    setShowHistorySidebar(false);
  };

  // Delete a conversation
  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    audio.playPop();
    const updated = assistantService.deleteConversation(student.id, convId);
    setConversations(updated);

    if (activeConversation?.id === convId) {
      if (updated.length > 0) {
        setActiveConversation(updated[0]);
      } else {
        const fresh = assistantService.createNewConversation(student);
        setConversations([fresh]);
        setActiveConversation(fresh);
      }
    }
  };

  // Send prompt to assistant
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || !activeConversation) return;

    audio.playPop();
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update conversation with user message
    const updatedMessages = [...activeConversation.messages, userMsg];
    let updatedTitle = activeConversation.title;
    if (activeConversation.messages.length <= 1) {
      // Set short title based on first user query
      updatedTitle = trimmed.length > 28 ? `${trimmed.substring(0, 25)}...` : trimmed;
    }

    const convWithUser: Conversation = {
      ...activeConversation,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setActiveConversation(convWithUser);
    assistantService.saveConversation(student.id, convWithUser);
    setConversations((prev) =>
      [convWithUser, ...prev.filter((c) => c.id !== convWithUser.id)]
    );

    setIsLoading(true);

    try {
      const context = getContext();
      const response = await assistantService.sendMessage(
        trimmed,
        activeConversation.messages,
        context
      );

      audio.playCharacterInteract();

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        role: 'model',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
      };

      const finalConv: Conversation = {
        ...convWithUser,
        messages: [...updatedMessages, botMsg],
        updatedAt: Date.now(),
      };

      setActiveConversation(finalConv);
      assistantService.saveConversation(student.id, finalConv);
      setConversations((prev) =>
        [finalConv, ...prev.filter((c) => c.id !== finalConv.id)]
      );
    } catch (err: any) {
      console.error('Error generating assistant response:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: 'Lo siento, hubo un problema al conectar con el servidor de inteligencia artificial. Por favor intenta de nuevo en unos segundos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      const convWithError: Conversation = {
        ...convWithUser,
        messages: [...updatedMessages, errorMsg],
        updatedAt: Date.now(),
      };

      setActiveConversation(convWithError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-sky-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white/95 backdrop-blur-md border-3 border-sky-300 shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-full sm:w-[94vw] max-w-5xl h-[92vh]'
            : 'w-full sm:w-[540px] md:w-[620px] h-[85vh] sm:h-[620px]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white px-4 py-3 flex items-center justify-between shadow-md select-none shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-xs">
              <span className="text-2xl animate-float-bob">🤖</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-fun font-black text-sm sm:text-base leading-tight tracking-wide">
                  EurekaBot AI
                </h3>
                <span className="text-[9px] bg-emerald-400 text-slate-900 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tutor Inteligente
                </span>
              </div>
              <p className="text-[11px] text-sky-100 font-medium">
                {activeGame ? `Enfocado en: ${activeGame}` : 'Asistente personalizado con razonamiento real'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New Conversation Button */}
            <button
              onClick={handleStartNewConversation}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-fun font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Iniciar Nueva Conversación"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva</span>
            </button>

            {/* Conversation History Toggle Button */}
            <button
              onClick={() => {
                audio.playPop();
                setShowHistorySidebar(!showHistorySidebar);
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-fun font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                showHistorySidebar
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Historial de Conversaciones"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Historial</span>
            </button>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:flex p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              title={isExpanded ? 'Restaurar tamaño' : 'Maximizar'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                audio.playPop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/15 hover:bg-rose-500 text-white transition cursor-pointer active:scale-95 ml-1"
              title="Cerrar Asistente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 flex items-center justify-between text-[11px] font-medium text-slate-600 select-none shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="font-bold text-sky-800">Contexto:</span>
            <span className="bg-white px-2 py-0.5 rounded-md border border-sky-200 text-slate-700">
              👤 {student.name} ({student.grade})
            </span>
            {activeGame && (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300 font-bold">
                🎮 {activeGame}
              </span>
            )}
            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 font-mono font-bold">
              🪙 {student.coins} Eurekas
            </span>
          </div>

          <div className="text-[10px] text-slate-400 hidden sm:block">
            Gemini 3.8 Flash • Respuestas en vivo
          </div>
        </div>

        {/* Body: Main Chat Area with optional History Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Conversation History Sidebar Drawer */}
          {showHistorySidebar && (
            <div className="absolute inset-y-0 left-0 w-64 sm:w-72 bg-white/95 backdrop-blur-md border-r-2 border-sky-200 z-20 flex flex-col p-3 shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-fun font-bold text-xs text-sky-950 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-sky-600" />
                  <span>Historial de Chats ({conversations.length})</span>
                </span>
                <button
                  onClick={() => setShowHistorySidebar(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleStartNewConversation}
                className="w-full py-2 px-3 mb-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-fun font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Conversación</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {conversations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Aún no tienes conversaciones guardadas.
                  </p>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    const dateFormatted = new Date(conv.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`group p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-fun font-bold text-xs truncate">
                            {conv.title || 'Conversación'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {dateFormatted} • {conv.messages.length} msgs
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 text-slate-400 rounded-lg transition"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Main Messages Container */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation?.messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[80%]">
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                          🤖
                        </div>
                      )}

                      <div
                        className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-xs'
                            : msg.isError
                            ? 'bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-tl-xs'
                            : 'bg-white border-2 border-sky-100 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}

                        <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5 text-[10px] opacity-75">
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => audio.speakText(msg.text)}
                              className="text-sky-600 hover:text-sky-900 transition flex items-center gap-0.5 font-bold cursor-pointer"
                              title="Escuchar respuesta con voz"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span className="text-[9px]">Escuchar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Follow-up Suggestion Chips from Gemini */}
                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-9 mt-1">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (sug.toLowerCase().includes('balanza') && onNavigate) {
                                onNavigate('games');
                              } else {
                                handleSendMessage(sug);
                              }
                            }}
                            className="text-[11px] font-fun font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs text-left"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing / Generating Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0 animate-pulse">
                    🤖
                  </div>
                  <div className="bg-white border-2 border-sky-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs text-slate-600 shadow-xs">
                    <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                    <span>EurekaBot está pensando tu explicación...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Predefined Quick Concept Starters (shown if few messages) */}
            {activeConversation && activeConversation.messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-white/70 overflow-x-auto flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  Ideas:
                </span>
                {[
                  '¿Por qué 2/4 equivale a 1/2?',
                  '¿Cómo evitar chocar en la cuadrícula?',
                  '¿Cómo resolver mi nivel actual?',
                  'Dame un ejemplo fácil de fracciones',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] font-fun font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 border border-slate-200 rounded-xl px-2.5 py-1 whitespace-nowrap transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Input Form */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  disabled={isLoading}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregúntale a EurekaBot sobre fracciones, algoritmos, lectura..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white text-xs sm:text-sm text-slate-900 outline-none transition disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 text-white font-fun font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Enviar</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
