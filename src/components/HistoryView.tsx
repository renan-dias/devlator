"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaBalanceScale,
  FaCalculator,
  FaComments,
  FaDownload,
  FaExternalLinkAlt,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { formatBRL } from "@/lib/market-data";
import { exportHistoryJSON } from "@/lib/export";
import { deleteSession, loadSessions, type ChatSession } from "@/lib/chat-sessions";
import {
  STORAGE_KEYS,
  deleteFromHistory,
  loadHistory,
  writeJSON,
  type ChatContext,
  type EstimateRecord,
} from "@/lib/storage";

const POSITION = {
  below: { label: "abaixo do mercado", className: "text-orange" },
  within: { label: "na média", className: "text-green" },
  above: { label: "acima do mercado", className: "text-pink" },
};

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function HistoryView() {
  const router = useRouter();
  const [tab, setTab] = useState<"estimativas" | "conversas">("estimativas");
  const [records, setRecords] = useState<EstimateRecord[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    setRecords(loadHistory());
    setSessions(loadSessions());
  };

  useEffect(() => {
    reload();
    setLoaded(true);
    if (window.location.hash === "#conversas") setTab("conversas");
  }, []);

  const remove = (id: string) => {
    if (!confirm("Excluir esta estimativa?")) return;
    deleteFromHistory(id);
    setCompare((c) => c.filter((x) => x !== id));
    reload();
  };

  const clearAll = () => {
    if (!confirm("Apagar todas as estimativas salvas neste navegador? Essa ação não pode ser desfeita.")) return;
    writeJSON(STORAGE_KEYS.history, []);
    setCompare([]);
    reload();
  };

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id]));

  const openChat = (r: EstimateRecord) => {
    const ctx: ChatContext = { id: r.id, name: r.name, answers: r.answers, result: r.result, analysis: r.analysis };
    writeJSON(STORAGE_KEYS.chatContext, ctx);
    router.push("/chat?contexto=calculadora");
  };

  const importFile = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error();
      const valid = data.filter((r: EstimateRecord) => r?.id && r?.result?.price && r?.answers);
      const existing = loadHistory();
      const ids = new Set(existing.map((r) => r.id));
      writeJSON(STORAGE_KEYS.history, [...valid.filter((r: EstimateRecord) => !ids.has(r.id)), ...existing].slice(0, 50));
      setImportMsg(`${valid.length} estimativa(s) importada(s).`);
      reload();
    } catch {
      setImportMsg("Arquivo inválido. Use um JSON exportado pelo Devlator.");
    }
  };

  const compared = records.filter((r) => compare.includes(r.id));

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Tipo de histórico" className="inline-flex rounded-xl border border-line bg-panel p-1">
        {(["estimativas", "conversas"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"}`}
          >
            {t} <span className="ml-1 font-mono text-xs text-subtle">{t === "estimativas" ? records.length : sessions.length}</span>
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="h-48 animate-pulse rounded-2xl bg-panel/50" />
      ) : tab === "estimativas" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportHistoryJSON(records)} disabled={!records.length} className="btn-secondary !py-2">
              <FaDownload aria-hidden /> Exportar backup
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary !py-2">
              <FaUpload aria-hidden /> Importar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
                e.target.value = "";
              }}
            />
            {records.length > 0 && (
              <button onClick={clearAll} className="btn-ghost !py-2 text-red hover:!text-red">
                <FaTrash aria-hidden /> Apagar tudo
              </button>
            )}
          </div>
          {importMsg && <p role="status" className="text-sm text-cyan">{importMsg}</p>}

          {compared.length >= 2 && (
            <section className="card overflow-x-auto p-6" aria-labelledby="comparacao">
              <h2 id="comparacao" className="flex items-center gap-2 font-semibold">
                <FaBalanceScale className="text-purple" aria-hidden /> Comparação
              </h2>
              <table className="mt-4 w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-subtle">
                    <th scope="col" className="py-2 pr-4 font-medium" />
                    {compared.map((r) => <th key={r.id} scope="col" className="py-2 pr-4 font-medium text-fg">{r.name}</th>)}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[
                    ["Preço", (r: EstimateRecord) => formatBRL(r.result.price.recommended)],
                    ["Faixa", (r: EstimateRecord) => `${formatBRL(r.result.price.min, true)}–${formatBRL(r.result.price.max, true)}`],
                    ["Horas", (r: EstimateRecord) => `${r.result.hours.likely}h`],
                    ["Valor-hora", (r: EstimateRecord) => formatBRL(r.result.rate.value)],
                    ["Prazo", (r: EstimateRecord) => `${r.result.timeline.weeks} sem.`],
                    ["Mercado", (r: EstimateRecord) => POSITION[r.result.market.position].label],
                  ].map(([label, fn]) => (
                    <tr key={label as string} className="border-t border-line/60">
                      <th scope="row" className="py-2 pr-4 text-left font-sans text-muted">{label as string}</th>
                      {compared.map((r) => <td key={r.id} className="py-2 pr-4">{(fn as (r: EstimateRecord) => string)(r)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {records.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 p-12 text-center">
              <FaCalculator className="text-4xl text-purple" aria-hidden />
              <p className="text-muted">Nenhuma estimativa salva ainda.</p>
              <Link href="/calculadora" className="btn-primary">Fazer a primeira</Link>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {records.map((r) => {
                const pos = POSITION[r.result.market.position];
                return (
                  <li key={r.id} className={`card flex flex-col p-5 transition ${compare.includes(r.id) ? "!border-purple" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{r.name}</h3>
                        <p className="text-xs text-subtle">{fmtDate(r.createdAt)}</p>
                      </div>
                      <label className="chip cursor-pointer select-none">
                        <input type="checkbox" checked={compare.includes(r.id)} onChange={() => toggleCompare(r.id)} className="accent-purple" />
                        Comparar
                      </label>
                    </div>
                    <p className="mt-4 font-mono text-3xl font-bold text-green">{formatBRL(r.result.price.recommended)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {r.result.hours.likely}h · {formatBRL(r.result.rate.value)}/h · {r.result.timeline.weeks} semanas ·{" "}
                      <span className={pos.className}>{pos.label}</span>
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/calculadora?id=${r.id}`} className="btn-secondary !px-3 !py-2 text-xs">
                        <FaExternalLinkAlt aria-hidden /> Abrir
                      </Link>
                      <button onClick={() => openChat(r)} className="btn-secondary !px-3 !py-2 text-xs">
                        <FaComments aria-hidden /> Chat
                      </button>
                      <button onClick={() => remove(r.id)} className="btn-ghost ml-auto !px-3 !py-2 text-xs hover:!text-red" aria-label={`Excluir ${r.name}`}>
                        <FaTrash aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : sessions.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 p-12 text-center">
          <FaComments className="text-4xl text-purple" aria-hidden />
          <p className="text-muted">Nenhuma conversa salva ainda.</p>
          <Link href="/chat" className="btn-primary">Conversar com o Devinho</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id} className="card flex items-center gap-4 p-4">
              <Link href={`/chat?sessao=${s.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium hover:text-purple">{s.title}</p>
                <p className="text-xs text-subtle">
                  {fmtDate(s.updatedAt)} · {s.messages.length} mensagens{s.project ? ` · ${s.project.name}` : ""}
                </p>
              </Link>
              <button
                onClick={() => {
                  if (confirm("Excluir esta conversa?")) {
                    deleteSession(s.id);
                    reload();
                  }
                }}
                className="btn-ghost !p-2 hover:!text-red"
                aria-label={`Excluir conversa ${s.title}`}
              >
                <FaTrash aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
