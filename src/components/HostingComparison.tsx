"use client";
import { useEffect, useState } from "react";
import HostingReport from "./HostingReport";
import type { HostingSelection } from "@/lib/hosting-data";
import { readJSON, writeJSON } from "@/lib/storage";

const KEY = "devlator-hosting";

/** Comparativo avulso (página /hospedagem); lembra a última escolha no navegador. */
export default function HostingComparison() {
  const [selection, setSelection] = useState<HostingSelection>({ category: "compartilhada", horizonYears: 2 });

  useEffect(() => {
    const saved = readJSON<HostingSelection | null>(KEY, null);
    if (saved?.category && saved.horizonYears) setSelection(saved);
  }, []);

  const change = (next: HostingSelection) => {
    setSelection(next);
    writeJSON(KEY, next);
  };

  return <HostingReport selection={selection} onChange={change} />;
}
