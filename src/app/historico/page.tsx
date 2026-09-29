import type { Metadata } from "next";
import HistoryView from "@/components/HistoryView";

export const metadata: Metadata = {
  title: "Histórico de estimativas",
  description: "Suas estimativas e conversas salvas localmente no navegador. Compare projetos, exporte e importe backups.",
  alternates: { canonical: "/historico" },
  robots: { index: false, follow: true },
};

export default function HistoricoPage() {
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow">Salvo neste navegador</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Histórico</h1>
        <p className="mt-2 text-muted">Tudo fica no seu dispositivo. Exporte um backup para levar a outro navegador.</p>
      </div>
      <HistoryView />
    </>
  );
}
