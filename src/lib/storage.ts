import type { Answers } from "./questions";
import type { EstimateResult, Profile } from "./estimator";
import type { AiSetup } from "./ai-tools";
import type { HostingSelection } from "./hosting-data";

/** Todas as chaves ficam só no navegador do usuário (localStorage). */
export const STORAGE_KEYS = {
  profile: "devlator-profile",
  history: "devlator-estimates",
  draft: "devlator-draft",
  rateCalc: "devlator-rate-calc",
  chatContext: "devlator-chat-context",
  chatHistory: "devlator-chat-history",
  chatSessions: "devlator-chat-sessions",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado ou cota cheia: seguimos sem persistir.
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignora
  }
}

export interface AiAnalysis {
  source: "ai" | "offline";
  summary: string;
  suggestions: string[];
  risks: string[];
}

export interface EstimateRecord {
  id: string;
  createdAt: number;
  name: string;
  answers: Answers;
  profile: Profile;
  result: EstimateResult;
  analysis?: AiAnalysis;
  /** Ferramentas de IA escolhidas (ausente em estimativas antigas). */
  ai?: AiSetup | null;
  hosting?: HostingSelection;
}

const MAX_HISTORY = 50;

export const loadHistory = () =>
  readJSON<EstimateRecord[]>(STORAGE_KEYS.history, []).filter((r) => r?.result?.price);

export function saveToHistory(record: EstimateRecord) {
  const history = loadHistory().filter((r) => r.id !== record.id);
  writeJSON(STORAGE_KEYS.history, [record, ...history].slice(0, MAX_HISTORY));
}

export function updateHistoryRecord(id: string, patch: Partial<EstimateRecord>) {
  writeJSON(
    STORAGE_KEYS.history,
    loadHistory().map((r) => (r.id === id ? { ...r, ...patch } : r)),
  );
}

export function deleteFromHistory(id: string) {
  writeJSON(
    STORAGE_KEYS.history,
    loadHistory().filter((r) => r.id !== id),
  );
}

export interface ChatContext {
  id?: string;
  name: string;
  answers: Answers;
  result: EstimateResult;
  analysis?: AiAnalysis;
}
