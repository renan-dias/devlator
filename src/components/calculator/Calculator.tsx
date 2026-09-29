"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHistory, FaTimes, FaUserEdit } from "react-icons/fa";
import ProfileStep from "./ProfileStep";
import QuestionStep from "./QuestionStep";
import CalculatingStep from "./CalculatingStep";
import ResultView from "./ResultView";
import { fetchUsdBrl } from "./AiCostsSection";
import { defaultAiSetup, type AiSetup } from "@/lib/ai-tools";
import { defaultHostingSelection, type HostingSelection } from "@/lib/hosting-data";
import { DEFAULT_PROFILE, estimate, type Profile } from "@/lib/estimator";
import { REGIONS, SENIORITY, formatBRL } from "@/lib/market-data";
import { getApplicableQuestions, type Answers } from "@/lib/questions";
import {
  STORAGE_KEYS,
  loadHistory,
  readJSON,
  removeKey,
  saveToHistory,
  writeJSON,
  type AiAnalysis,
  type ChatContext,
  type EstimateRecord,
} from "@/lib/storage";
import { useAnimatedFavicon } from "@/lib/useAnimatedFavicon";

type Step = "loading" | "profile" | "quiz" | "calculating" | "result";

interface Draft {
  answers: Answers;
  index: number;
  editingId?: string | null;
}

const MIN_CALC_MS = 1900;

async function fetchAnalysis(answers: Answers, profile: Profile, ai: AiSetup | null): Promise<AiAnalysis | undefined> {
  try {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, profile, ai }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return undefined;
    return (await res.json()) as AiAnalysis;
  } catch {
    return undefined;
  }
}

export default function Calculator() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [record, setRecord] = useState<EstimateRecord | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const returnToResult = useRef(false);

  useAnimatedFavicon(step === "calculating");

  const questions = useMemo(() => getApplicableQuestions(answers), [answers]);

  // Carrega perfil, rascunho e (opcional) uma estimativa do histórico via ?id=
  useEffect(() => {
    const savedProfile = readJSON<Profile | null>(STORAGE_KEYS.profile, null);
    if (savedProfile) setProfile({ ...DEFAULT_PROFILE, ...savedProfile });

    const id = new URLSearchParams(window.location.search).get("id");
    const fromHistory = id ? loadHistory().find((r) => r.id === id) : undefined;
    if (fromHistory) {
      setRecord(fromHistory);
      setAnswers(fromHistory.answers);
      setStep("result");
      return;
    }

    const draft = readJSON<Draft | null>(STORAGE_KEYS.draft, null);
    if (draft && Object.keys(draft.answers ?? {}).length > 0) setPendingDraft(draft);
    setStep(savedProfile ? "quiz" : "profile");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, index]);

  const saveProfile = (p: Profile) => {
    setProfile(p);
    writeJSON(STORAGE_KEYS.profile, p);
  };

  const persistRecord = useCallback((next: EstimateRecord) => {
    setRecord(next);
    saveToHistory(next);
    const ctx: ChatContext = { id: next.id, name: next.name, answers: next.answers, result: next.result, analysis: next.analysis };
    writeJSON(STORAGE_KEYS.chatContext, ctx);
  }, []);

  const finish = async (finalAnswers: Answers) => {
    setStep("calculating");
    const started = Date.now();
    const previous = editingId ? loadHistory().find((r) => r.id === editingId) : undefined;

    // IA: mantém as ferramentas já ajustadas se a resposta não mudou; senão usa o perfil sugerido.
    let ai: AiSetup | null = null;
    if (previous?.ai && previous.answers.ia === finalAnswers.ia) {
      ai = previous.ai;
    } else if (finalAnswers.ia && finalAnswers.ia !== "nao") {
      const fx = await fetchUsdBrl();
      const people = estimate(finalAnswers, profile, null).timeline.people;
      ai = defaultAiSetup(finalAnswers.ia, people, fx.rate, fx.date);
    }
    const result = estimate(finalAnswers, profile, ai);
    const sameHosting = previous?.hosting && previous.answers.tipo === finalAnswers.tipo && previous.answers.hospedagem === finalAnswers.hospedagem;
    const hosting = sameHosting ? previous!.hosting! : defaultHostingSelection(result.projectType, finalAnswers.hospedagem);

    const analysis = await fetchAnalysis(finalAnswers, profile, ai);
    const wait = MIN_CALC_MS - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    const next: EstimateRecord = {
      id: previous?.id ?? crypto.randomUUID(),
      createdAt: previous?.createdAt ?? Date.now(),
      name: previous?.name ?? `${result.projectLabel} — ${new Date().toLocaleDateString("pt-BR")}`,
      answers: finalAnswers,
      profile,
      result,
      analysis,
      ai,
      hosting,
    };
    persistRecord(next);
    removeKey(STORAGE_KEYS.draft);
    setEditingId(next.id);
    returnToResult.current = false;
    setStep("result");
    window.history.replaceState(null, "", `/calculadora?id=${next.id}`);
  };

  const answer = (value: string) => {
    const question = questions[index];
    let next: Answers = { ...answers, [question.id]: value };
    // Remove respostas de perguntas que deixaram de se aplicar (ex.: trocou o tipo).
    const applicable = getApplicableQuestions(next);
    const valid = new Set(applicable.map((q) => q.id));
    next = Object.fromEntries(Object.entries(next).filter(([k]) => valid.has(k)));
    setAnswers(next);

    // Editando a partir do resultado: se tudo já está respondido, recalcula direto.
    const firstMissing = applicable.findIndex((q) => !next[q.id]);
    if (returnToResult.current && firstMissing === -1) {
      finish(next);
      return;
    }

    const nextIndex = index + 1;
    if (nextIndex >= applicable.length) {
      finish(next);
    } else {
      const target = returnToResult.current && firstMissing !== -1 ? firstMissing : nextIndex;
      setIndex(target);
      writeJSON(STORAGE_KEYS.draft, { answers: next, index: target, editingId } satisfies Draft);
    }
  };

  const back = () => setIndex((i) => Math.max(0, i - 1));

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setRecord(null);
    setEditingId(null);
    returnToResult.current = false;
    removeKey(STORAGE_KEYS.draft);
    window.history.replaceState(null, "", "/calculadora");
    setStep("quiz");
  };

  const resumeDraft = () => {
    if (!pendingDraft) return;
    setAnswers(pendingDraft.answers);
    setIndex(Math.min(pendingDraft.index, getApplicableQuestions(pendingDraft.answers).length - 1));
    setEditingId(pendingDraft.editingId ?? null);
    setPendingDraft(null);
  };

  const discardDraft = () => {
    removeKey(STORAGE_KEYS.draft);
    setPendingDraft(null);
  };

  const changeResultProfile = (p: Profile) => {
    if (!record) return;
    saveProfile(p);
    persistRecord({ ...record, profile: p, result: estimate(record.answers, p, record.ai) });
  };

  const changeAi = (ai: AiSetup) => {
    if (!record) return;
    persistRecord({ ...record, ai, result: estimate(record.answers, record.profile, ai) });
  };

  const changeHosting = (hosting: HostingSelection) => {
    if (!record) return;
    persistRecord({ ...record, hosting });
  };

  const refreshAnalysis = async () => {
    if (!record) return;
    setAnalysisLoading(true);
    const analysis = await fetchAnalysis(record.answers, record.profile, record.ai ?? null);
    setAnalysisLoading(false);
    if (analysis) persistRecord({ ...record, analysis });
  };

  const editQuestion = (questionId: string) => {
    const i = questions.findIndex((q) => q.id === questionId);
    if (i < 0) return;
    returnToResult.current = true;
    setIndex(i);
    setStep("quiz");
  };

  const openChat = () => {
    if (record) persistRecord(record);
    router.push("/chat?contexto=calculadora");
  };

  if (step === "loading") {
    return <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-panel/50" aria-label="Carregando" />;
  }

  if (step === "profile") {
    return (
      <ProfileStep
        initial={profile}
        onSubmit={(p) => {
          saveProfile(p);
          setStep(record ? "result" : "quiz");
          if (record) changeResultProfile(p);
        }}
      />
    );
  }

  if (step === "calculating") return <CalculatingStep />;

  if (step === "result" && record) {
    return (
      <ResultView
        record={record}
        analysisLoading={analysisLoading}
        onProfileChange={changeResultProfile}
        onAiChange={changeAi}
        onHostingChange={changeHosting}
        onRename={(name) => persistRecord({ ...record, name })}
        onEditQuestion={editQuestion}
        onRefreshAnalysis={refreshAnalysis}
        onRestart={restart}
        onOpenChat={openChat}
      />
    );
  }

  const question = questions[Math.min(index, questions.length - 1)];
  const rateLabel = profile.customRate
    ? `${formatBRL(profile.customRate)}/h`
    : `${SENIORITY[profile.seniority].label} · ${REGIONS[profile.region].label.split(" /")[0]}`;

  return (
    <div className="space-y-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <button onClick={() => setStep("profile")} className="chip hover:border-purple/50 hover:text-fg" title="Editar perfil">
          <FaUserEdit aria-hidden /> Perfil: {rateLabel}
        </button>
        {returnToResult.current && record && (
          <button onClick={() => { returnToResult.current = false; setStep("result"); }} className="chip hover:text-fg">
            <FaTimes aria-hidden /> Cancelar edição
          </button>
        )}
      </div>

      {pendingDraft && (
        <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-cyan/30 bg-cyan/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm">
            <FaHistory className="text-cyan" aria-hidden />
            Você tem uma estimativa em andamento ({Object.keys(pendingDraft.answers).length} respostas).
          </p>
          <div className="flex gap-2">
            <button onClick={resumeDraft} className="btn-secondary !py-2">Continuar</button>
            <button onClick={discardDraft} className="btn-ghost !py-2">Descartar</button>
          </div>
        </div>
      )}

      <QuestionStep
        question={question}
        index={index}
        total={questions.length}
        selected={answers[question.id]}
        onAnswer={answer}
        onBack={index > 0 ? back : undefined}
      />
    </div>
  );
}
