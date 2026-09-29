"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCalculator, FaPaperPlane, FaPlus, FaRobot, FaTimes, FaTrash, FaUser } from "react-icons/fa";
import ChatContextSelector, { type ChatExtras } from "./ChatContextSelector";
import RichText from "./RichText";
import {
  deleteSession,
  loadSessions,
  sessionTitle,
  upsertSession,
  type ChatMessage,
  type ChatSession,
} from "@/lib/chat-sessions";
import { formatBRL } from "@/lib/market-data";
import { STORAGE_KEYS, readJSON, type ChatContext } from "@/lib/storage";
import { useAnimatedFavicon } from "@/lib/useAnimatedFavicon";

const SUGGESTIONS_WITH_PROJECT = [
  "Esse preço está justo para o mercado?",
  "Como justificar esse valor para o cliente?",
  "Como dividir em fases para caber no orçamento?",
  "Quais riscos podem estourar o prazo?",
];

const SUGGESTIONS = [
  "Quanto cobrar por uma landing page com formulário?",
  "Qual valor-hora para um dev pleno em React?",
  "Como cobrar manutenção mensal de um sistema?",
  "Vale mais cobrar por hora ou por projeto?",
];

const newSession = (project: ChatContext | null = null): ChatSession => ({
  id: crypto.randomUUID(),
  title: project?.name ?? "Nova conversa",
  updatedAt: Date.now(),
  messages: [],
  project,
});

export default function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [extras, setExtras] = useState<ChatExtras>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useAnimatedFavicon(loading, "Devinho pensando…");

  useEffect(() => {
    const all = loadSessions();
    setSessions(all);
    const params = new URLSearchParams(window.location.search);
    const byId = params.get("sessao") && all.find((s) => s.id === params.get("sessao"));
    if (byId) {
      setSession(byId);
    } else if (params.get("contexto") === "calculadora") {
      const project = readJSON<ChatContext | null>(STORAGE_KEYS.chatContext, null);
      // Reaproveita a conversa existente dessa estimativa, se houver.
      const existing = project?.id ? all.find((s) => s.project?.id === project.id) : undefined;
      setSession(existing ? { ...existing, project } : newSession(project));
    } else {
      setSession(newSession());
    }
    window.history.replaceState(null, "", "/chat");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.messages.length, loading]);

  const persist = useCallback((s: ChatSession) => {
    setSession(s);
    if (s.messages.length) {
      upsertSession(s);
      setSessions(loadSessions());
    }
  }, []);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || !session || loading) return;
    setError("");
    setInput("");

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, timestamp: Date.now() };
    const withUser: ChatSession = {
      ...session,
      messages: [...session.messages, userMsg],
      updatedAt: Date.now(),
    };
    withUser.title = sessionTitle(withUser.messages, withUser.project);
    persist(withUser);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: session.messages.map(({ role, content }) => ({ role, content })),
          project: session.project,
          extras,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "Falha no chat");
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "bot", content: data.reply, timestamp: Date.now() };
      persist({ ...withUser, messages: [...withUser.messages, botMsg], updatedAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNew = () => {
    setSession(newSession());
    setExtras({});
    setShowSessions(false);
  };

  const removeSession = (id: string) => {
    deleteSession(id);
    setSessions(loadSessions());
    if (session?.id === id) startNew();
  };

  if (!session) return <div className="h-[70dvh] animate-pulse rounded-2xl bg-panel/50" aria-label="Carregando" />;

  const project = session.project;
  const suggestions = project ? SUGGESTIONS_WITH_PROJECT : SUGGESTIONS;

  const sessionList = (
    <div className="flex h-full flex-col">
      <button onClick={startNew} className="btn-secondary w-full !py-2">
        <FaPlus aria-hidden /> Nova conversa
      </button>
      <ul className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {sessions.map((s) => (
          <li key={s.id} className="group flex items-center">
            <button
              onClick={() => {
                setSession(s);
                setExtras({});
                setShowSessions(false);
              }}
              className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                s.id === session.id ? "bg-panel-2 text-fg" : "text-muted hover:bg-panel hover:text-fg"
              }`}
            >
              {s.title}
            </button>
            <button
              onClick={() => removeSession(s.id)}
              className="p-2 text-subtle opacity-0 transition hover:text-red focus:opacity-100 group-hover:opacity-100"
              aria-label={`Excluir conversa ${s.title}`}
            >
              <FaTrash className="text-xs" aria-hidden />
            </button>
          </li>
        ))}
        {sessions.length === 0 && <li className="px-3 py-2 text-xs text-subtle">Suas conversas aparecem aqui.</li>}
      </ul>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block" aria-label="Conversas">{sessionList}</aside>

      {showSessions && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setShowSessions(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in border-r border-line bg-panel p-4" aria-label="Conversas">
            <button onClick={() => setShowSessions(false)} className="btn-ghost mb-2 !p-2" aria-label="Fechar">
              <FaTimes aria-hidden />
            </button>
            {sessionList}
          </aside>
        </div>
      )}

      <section className="card flex h-[calc(100dvh-9rem)] min-h-[480px] flex-col overflow-hidden" aria-label="Chat com o Devinho">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-purple to-pink text-bg">
              <FaRobot aria-hidden />
            </span>
            <div>
              <h1 className="font-semibold leading-tight">Devinho</h1>
              <p className="text-xs text-subtle">Consultor de precificação · IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project && (
              <Link href={project.id ? `/calculadora?id=${project.id}` : "/calculadora"} className="chip max-w-[220px] hover:text-fg">
                <FaCalculator className="shrink-0 text-green" aria-hidden />
                <span className="truncate">{project.name} · {formatBRL(project.result.price.recommended)}</span>
              </Link>
            )}
            <button onClick={() => setShowSessions(true)} className="btn-ghost !px-3 !py-1.5 text-xs lg:hidden">
              Conversas
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
          {session.messages.length === 0 && (
            <div className="mx-auto flex max-w-lg flex-col items-center py-8 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-purple/15 text-2xl text-purple">
                <FaRobot aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Oi! Sou o Devinho.</h2>
              <p className="mt-2 text-sm text-muted">
                {project
                  ? `Tenho aqui a sua estimativa de ${project.result.projectLabel.toLowerCase()} (${formatBRL(project.result.price.recommended)}). Vamos refinar?`
                  : "Pergunte sobre preços, valor-hora, propostas ou negociação. Anexe um design, site ou requisitos para respostas mais precisas."}
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="card p-3 text-left text-sm text-muted transition hover:border-purple/50 hover:text-fg">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {session.messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${
                  m.role === "user" ? "bg-panel-2 text-muted" : "bg-purple/15 text-purple"
                }`}
                aria-hidden
              >
                {m.role === "user" ? <FaUser /> : <FaRobot />}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "rounded-tr-sm bg-purple text-bg" : "rounded-tl-sm border border-line bg-bg-soft text-muted"
                }`}
              >
                <span className="sr-only">{m.role === "user" ? "Você disse:" : "Devinho disse:"}</span>
                {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <RichText text={m.content} />}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple/15 text-purple" aria-hidden>
                <FaRobot />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-bg-soft px-4 py-3" aria-label="Devinho está digitando">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-purple" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red/40 bg-red/10 px-4 py-3 text-sm text-red">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-line p-3 sm:p-4">
          <ChatContextSelector extras={extras} onChange={setExtras} onError={setError} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor="chat-input" className="sr-only">Mensagem</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Pergunte sobre preço, prazo, proposta…"
              className="input max-h-40 resize-none"
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} className="btn-primary h-[50px] !px-4" aria-label="Enviar">
              <FaPaperPlane aria-hidden />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
