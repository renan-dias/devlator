'use client';
import React, { useState, useEffect } from 'react';
import { FaTrash, FaComments, FaPlus, FaClock } from 'react-icons/fa';

export interface ChatSession {
  id: string;
  name: string;
  date: string;
  messages: ChatMessage[];
  lastMessage: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  context: string[];
}

interface ChatSessionManagerProps {
  currentMessages: ChatMessage[];
  onLoadSession: (messages: ChatMessage[]) => void;
  onNewSession: () => void;
}

const SESSIONS_KEY = 'devlator-chat-sessions';
const CURRENT_SESSION_KEY = 'devlator-current-session';

export default function ChatSessionManager({ 
  currentMessages, 
  onLoadSession, 
  onNewSession 
}: ChatSessionManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSessions();
    const savedSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    setCurrentSessionId(savedSessionId);
  }, []);

  useEffect(() => {
    // Auto-salvar a sessão atual quando as mensagens mudam
    if (currentMessages.length > 0) {
      saveCurrentSession();
    }
  }, [currentMessages]);

  const loadSessions = () => {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (data) {
        setSessions(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const saveSessions = (newSessions: ChatSession[]) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const generateSessionName = (messages: ChatMessage[]): string => {
    if (messages.length === 0) return 'Nova conversa';
    
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    const words = firstUserMessage.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words || 'Conversa sem título';
  };

  const saveCurrentSession = () => {
    if (currentMessages.length === 0) return;

    const sessionId = currentSessionId || `session-${Date.now()}`;
    const sessionName = generateSessionName(currentMessages);
    const lastMessage = currentMessages[currentMessages.length - 1]?.content.substring(0, 50) + '...' || '';

    const newSession: ChatSession = {
      id: sessionId,
      name: sessionName,
      date: new Date().toLocaleDateString('pt-BR'),
      messages: currentMessages,
      lastMessage
    };

    const existingSessions = sessions.filter(s => s.id !== sessionId);
    const newSessions = [newSession, ...existingSessions].slice(0, 10); // Manter apenas 10 sessões

    saveSessions(newSessions);
    
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    localStorage.setItem(CURRENT_SESSION_KEY, session.id);
    onLoadSession(session.messages);
    setShowHistory(false);
  };

  const deleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      localStorage.removeItem(CURRENT_SESSION_KEY);
      onNewSession();
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    localStorage.removeItem(CURRENT_SESSION_KEY);
    onNewSession();
    setShowHistory(false);
  };

  const clearAllHistory = () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico de conversas?')) {
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);
      setSessions([]);
      setCurrentSessionId(null);
      onNewSession();
    }
  };

  return (
    <div className="relative">
      {/* Botão de histórico */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 px-3 py-2 bg-[#44475a] border border-[#6272a4] rounded-lg text-[#f8f8f2] hover:bg-[#6272a4] transition-all text-sm"
      >
        <FaComments />
        Histórico ({sessions.length})
      </button>

      {/* Painel de histórico */}
      {showHistory && (
        <div className="absolute top-12 left-0 w-80 max-h-96 bg-[#44475a] border border-[#6272a4] rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-[#6272a4] flex items-center justify-between">
            <h3 className="text-[#bd93f9] font-bold">Conversas Salvas</h3>
            <div className="flex gap-2">
              <button
                onClick={createNewSession}
                className="p-1 text-[#50fa7b] hover:bg-[#50fa7b]/20 rounded"
                title="Nova conversa"
              >
                <FaPlus size={12} />
              </button>
              <button
                onClick={clearAllHistory}
                className="p-1 text-[#ff5555] hover:bg-[#ff5555]/20 rounded"
                title="Apagar tudo"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>

          {/* Lista de sessões */}
          <div className="max-h-80 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-[#6272a4]">
                <FaComments className="mx-auto mb-2 text-2xl" />
                <p className="text-sm">Nenhuma conversa salva</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border-b border-[#6272a4]/30 hover:bg-[#6272a4]/20 transition-all cursor-pointer ${
                    currentSessionId === session.id ? 'bg-[#bd93f9]/20' : ''
                  }`}
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#f8f8f2] font-medium text-sm truncate">
                        {session.name}
                      </h4>
                      <p className="text-[#6272a4] text-xs mt-1 truncate">
                        {session.lastMessage}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <FaClock className="text-[#f1fa8c] text-xs" />
                        <span className="text-[#f1fa8c] text-xs">{session.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-1 text-[#ff5555] hover:bg-[#ff5555]/20 rounded ml-2"
                      title="Apagar conversa"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
