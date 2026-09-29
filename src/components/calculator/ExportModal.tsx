"use client";
import { useEffect, useState } from "react";
import { FaFileAlt, FaFilePdf } from "react-icons/fa";
import Modal from "@/components/Modal";
import { exportProposalPDF, exportProposalText, type ProposalInfo } from "@/lib/export";
import { readJSON, writeJSON, type EstimateRecord } from "@/lib/storage";

const INFO_KEY = "devlator-proposal-info";

interface Props {
  record: EstimateRecord;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ record, isOpen, onClose }: Props) {
  const [info, setInfo] = useState<ProposalInfo>({ projectName: "", developerName: "", clientName: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const saved = readJSON<Partial<ProposalInfo>>(INFO_KEY, {});
    setInfo({
      projectName: record.name.split(" — ")[0] || record.result.projectLabel,
      developerName: saved.developerName ?? "",
      clientName: "",
    });
  }, [isOpen, record]);

  const valid = info.projectName.trim() && info.developerName.trim();

  const run = async (kind: "pdf" | "txt") => {
    if (!valid) return;
    writeJSON(INFO_KEY, { developerName: info.developerName });
    setBusy(true);
    try {
      if (kind === "pdf") await exportProposalPDF(record, info);
      else exportProposalText(record, info);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof ProposalInfo, label: string, placeholder: string, required = true) => (
    <div>
      <label htmlFor={`exp-${key}`} className="label">
        {label} {!required && <span className="text-subtle">(opcional)</span>}
      </label>
      <input
        id={`exp-${key}`}
        className="input"
        placeholder={placeholder}
        value={info[key] ?? ""}
        required={required}
        onChange={(e) => setInfo((i) => ({ ...i, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar proposta">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run("pdf"); }}>
        {field("projectName", "Nome do projeto", "Ex.: Portal do cliente")}
        {field("developerName", "Seu nome ou empresa", "Ex.: Ana Souza Dev")}
        {field("clientName", "Cliente", "Ex.: Padaria Central", false)}
        <p className="text-xs text-subtle">Seu nome fica salvo neste navegador para as próximas propostas.</p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" disabled={!valid || busy} className="btn-primary flex-1">
            <FaFilePdf aria-hidden /> Baixar PDF
          </button>
          <button type="button" disabled={!valid || busy} onClick={() => run("txt")} className="btn-secondary flex-1">
            <FaFileAlt aria-hidden /> Baixar texto
          </button>
        </div>
      </form>
    </Modal>
  );
}
