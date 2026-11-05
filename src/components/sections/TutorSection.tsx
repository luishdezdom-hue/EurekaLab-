/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Student, NavigationSection } from '../../types';
import { audio } from '../../services/audioService';
import {
  assistantService,
  ChatMessage,
  Conversation,
  AssistantContext,
} from '../../services/assistantService';
import {
  Bot,
  ArrowLeft,
  Send,
  Plus,
  History,
  Sparkles,
  Volume2,
  Trash2,
  Lightbulb,
  Loader2,
  Scale,
  Compass,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

interface TutorSectionProps {
  student: Student;
  onNavigate: (section: NavigationSection) => void;
}

export const TutorSection: React.FC<TutorSectionProps> = ({
  student,
  onNavigate,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMobileHistory, setShowMobileHistory] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    if (!student) return;
    const loaded = assistantService.getConversations(student.id);
    setConversations(loaded);

    if (loaded.length > 0) {
      setActiveConversation(loaded[0]);
    } else {
      const fresh = assistantService.createNewConversation(student, {
        activeGame: 'Tutor General',
      });
      setConversations([fresh]);
      setActiveConversation(fresh);
    }
  }, [student?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading]);

  const getContext = (): AssistantContext => {
    return {
      studentName: student.name,
      grade: student.grade || '4to de Primaria',
      currentSection: 'tutor',
      activeGame: 'Tutoría Conceptual EurekaLab',
      coins: student.coins,
      studentProgress: student.progress,
    };
  };

  const handleStartNewConversation = () => {
    audio.playPop();
    const newConv = assistantService.createNewConversation(student);
    setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)]);
    setActiveConversation(newConv);
    setShowMobileHistory(false);
  };

  const handleSelectConversation = (conv: Conversation) => {
    audio.playPop();
    setActiveConversation(conv);
    setShowMobileHistory(false);
  };

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

    const updatedMessages = [...activeConversation.messages, userMsg];
    let updatedTitle = activeConversation.title;
    if (activeConversation.messages.length <= 1) {
      updatedTitle = trimmed.length > 30 ? `${trimmed.substring(0, 27)}...` : trimmed;
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
        text: 'Hubo un error de conexión con el servicio de IA. Por favor, reintenta tu pregunta.',
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
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-3 border-sky-200/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-2xl">
              🤖
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 font-fun block">
                Sección 12 • Asistente Virtual IA
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Grounded en EurekaLab
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-fun text-slate-900 leading-tight">
              Tutor Inteligente EurekaBot
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Respuestas dinámicas impulsadas por IA, explicaciones con ejemplos de la vida real y guía paso a paso.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile history toggle */}
          <button
            onClick={() => {
              audio.playPop();
              setShowMobileHistory(!showMobileHistory);
            }}
            className="md:hidden px-3.5 py-2 rounded-2xl bg-sky-100 text-sky-800 font-fun font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Historial ({conversations.length})</span>
          </button>

          <button
            onClick={() => {
              audio.playPop();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-fun font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Inicio</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Chat Arena */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border-3 border-sky-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[640px]">
        {/* Left Column: Conversation History Sidebar (Desktop) */}
        <div
          className={`md:col-span-4 lg:col-span-3 border-r-2 border-sky-100 bg-sky-50/40 p-4 flex flex-col justify-between ${
            showMobileHistory
              ? 'block fixed inset-0 z-50 bg-white p-5'
              : 'hidden md:flex'
          }`}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header of Sidebar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-700" />
                <span className="font-fun font-black text-xs sm:text-sm text-slate-800">
                  Historial de Chats
                </span>
              </div>
              {showMobileHistory && (
                <button
                  onClick={() => setShowMobileHistory(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* New Conversation Button */}
            <button
              onClick={handleStartNewConversation}
              className="w-full py-2.5 px-3 mb-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-fun font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Conversación</span>
            </button>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  Sin conversaciones guardadas.
                </p>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  const dateStr = new Date(conv.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`group p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-white border-sky-400 text-sky-950 shadow-md ring-2 ring-sky-300'
                          : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <MessageSquare className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <p className="font-fun font-bold text-xs truncate">
                            {conv.title || 'Conversación'}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono ml-5">
                          {dateStr} • {conv.messages.length} msgs
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1.5 text-slate-400 rounded-lg transition"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Student Status Card at bottom of sidebar */}
          <div className="pt-3 border-t border-sky-100 mt-2 text-xs font-medium text-slate-600">
            <div className="bg-white p-2.5 rounded-2xl border border-sky-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-fun">{student.grade}</span>
              </div>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                🪙 {student.coins}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Chat Feed & Input */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between overflow-hidden bg-slate-50/40">
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeConversation?.messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[82%]">
                    {!isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-base shadow-xs shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-xs'
                          : msg.isError
                          ? 'bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-tl-xs'
                          : 'bg-white border-2 border-sky-100 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}

                      <div className="flex items-center justify-between gap-3 mt-2.5 pt-1.5 border-t border-black/5 text-[10px] opacity-75">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => audio.speakText(msg.text)}
                            className="text-sky-600 hover:text-sky-900 transition flex items-center gap-1 font-bold cursor-pointer"
                            title="Escuchar explicación con voz"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Escuchar Audio</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 ml-10">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (sug.toLowerCase().includes('balanza')) {
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

            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-base shadow-xs shrink-0 animate-pulse">
                  🤖
                </div>
                <div className="bg-white border-2 border-sky-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs text-slate-600 shadow-xs">
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                  <span>EurekaBot está formulando tu explicación pedagógica...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Concept Prompts */}
          {activeConversation && activeConversation.messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-200 bg-white/70 overflow-x-auto flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                Explorar:
              </span>
              {[
                '¿Por qué 2/4 es igual a 1/2?',
                '¿Cómo planifico mi ruta en la cuadrícula?',
                '¿Qué es una pregunta inferencial de lectura?',
                'Explícame la regla del 10% en el arrecife',
              ].map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(starter)}
                  className="text-[11px] font-fun font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 border border-slate-200 rounded-xl px-2.5 py-1 whitespace-nowrap transition cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                disabled={isLoading}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu pregunta o duda conceptual sobre matemáticas, algoritmos, lectura o ciencias..."
                className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white text-xs sm:text-sm text-slate-900 outline-none transition disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 text-white font-fun font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Consultar</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
