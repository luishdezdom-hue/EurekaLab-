/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  contextSummary?: string;
  messages: ChatMessage[];
}

export interface AssistantContext {
  studentName: string;
  grade: string;
  currentSection: string;
  activeGame?: string | null;
  gameLevel?: number;
  coins: number;
  studentProgress?: Record<string, number>;
}

class AssistantService {
  private getStorageKey(studentId: string): string {
    return `eurekalab_assistant_conversations_${studentId}`;
  }

  // Load all saved conversations for a student
  public getConversations(studentId: string): Conversation[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(studentId));
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return [];
    } catch (e) {
      console.warn('Error reading conversations from localStorage:', e);
      return [];
    }
  }

  // Save or update a conversation
  public saveConversation(studentId: string, conversation: Conversation): void {
    try {
      const convs = this.getConversations(studentId);
      const existingIdx = convs.findIndex((c) => c.id === conversation.id);
      conversation.updatedAt = Date.now();

      if (existingIdx !== -1) {
        convs[existingIdx] = conversation;
      } else {
        convs.unshift(conversation);
      }

      localStorage.setItem(this.getStorageKey(studentId), JSON.stringify(convs));
    } catch (e) {
      console.warn('Error saving conversation to localStorage:', e);
    }
  }

  // Delete a conversation
  public deleteConversation(studentId: string, conversationId: string): Conversation[] {
    try {
      const convs = this.getConversations(studentId).filter((c) => c.id !== conversationId);
      localStorage.setItem(this.getStorageKey(studentId), JSON.stringify(convs));
      return convs;
    } catch (e) {
      console.warn('Error deleting conversation from localStorage:', e);
      return [];
    }
  }

  // Create a new empty conversation with an introductory greeting
  public createNewConversation(
    student: Student,
    initialContext?: Partial<AssistantContext>
  ): Conversation {
    const contextName = initialContext?.activeGame
      ? `Ayuda en ${initialContext.activeGame}`
      : `Consulta con EurekaBot`;

    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: contextName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextSummary: initialContext?.activeGame || 'General',
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          role: 'model',
          text: `¡Hola, ${student.name}! 🤖 Soy EurekaBot, tu asistente inteligente de EurekaLab.

Puedo explicarte conceptos difíciles, darte ejemplos de la vida real (como partir pizzas para entender fracciones o planificar pasos para programar) y darte pistas cuando tengas dudas o te sientas atascado en algún nivel.

¿En qué puedo ayudarte hoy?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            '¿Por qué 2/4 es lo mismo que 1/2?',
            '¿Cómo planifico mi ruta en la cuadrícula sin chocar?',
            '¿Cómo sé si una pregunta es inferencial o literal?',
            '¡Ayúdame con el nivel que estoy jugando ahora!',
          ],
        },
      ],
    };

    this.saveConversation(student.id, newConv);
    return newConv;
  }

  // Send message to Gemini server-side endpoint
  public async sendMessage(
    message: string,
    history: ChatMessage[],
    context: AssistantContext
  ): Promise<{ reply: string; suggestions: string[] }> {
    try {
      const formattedHistory = history.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: formattedHistory,
          context,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();
      return {
        reply: data.reply || '¡Listo! He procesado tu consulta.',
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      };
    } catch (err: any) {
      console.error('AssistantService error:', err);
      // Helpful fallback response when offline or network fails
      return {
        reply: `¡Hola, ${context.studentName}! He tenido un pequeño inconveniente de conexión con el servidor de inteligencia artificial.

Sin embargo, puedo recordarte las estrategias clave:
• **Balanza de Fracciones:** Recuerda que dos cuartos (1/4 + 1/4) pesan exactamente lo mismo que un medio (1/2), y cuatro octavos (4 × 1/8) también hacen 1/2.
• **Cuadrícula de Algoritmos:** Cuenta las casillas antes de girar. 'Girar Izquierda' gira 90° en contra del reloj, y 'Girar Derecha' gira 90° a favor.
• **Comprensión Lectora:** Las preguntas inferenciales unen pistas del texto con tus conocimientos.

¡Intenta enviar tu mensaje de nuevo en unos segundos!`,
        suggestions: [
          '¿Me das un ejemplo con 1/4?',
          '¿Cómo giro mi nave sin chocar?',
          'Quiero ir a los juegos a practicar',
        ],
      };
    }
  }
}

export const assistantService = new AssistantService();
