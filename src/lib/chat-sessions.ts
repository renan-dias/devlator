import { STORAGE_KEYS, readJSON, writeJSON, type ChatContext } from "./storage";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
  project?: ChatContext | null;
}

const MAX_SESSIONS = 30;

export const loadSessions = () =>
  readJSON<ChatSession[]>(STORAGE_KEYS.chatSessions, []).filter((s) => Array.isArray(s?.messages));

export function upsertSession(session: ChatSession) {
  const others = loadSessions().filter((s) => s.id !== session.id);
  writeJSON(STORAGE_KEYS.chatSessions, [session, ...others].slice(0, MAX_SESSIONS));
}

export function deleteSession(id: string) {
  writeJSON(
    STORAGE_KEYS.chatSessions,
    loadSessions().filter((s) => s.id !== id),
  );
}

export function sessionTitle(messages: ChatMessage[], project?: ChatContext | null) {
  const first = messages.find((m) => m.role === "user")?.content.trim();
  if (first) return first.length > 48 ? `${first.slice(0, 48)}…` : first;
  return project?.name ?? "Nova conversa";
}
