import { describeAnswers } from "./estimator";
import { MARKET_UPDATED_AT, formatBRL } from "./market-data";
import type { EstimateRecord } from "./storage";

export interface ProposalInfo {
  projectName: string;
  developerName: string;
  clientName?: string;
}

// Fontes padrão do jsPDF só cobrem Latin-1: troca travessões e aspas curvas.
const latin1 = (s: string) =>
  s.replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, "...").replace(/[^\x00-\xFF]/g, "");

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "projeto";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function proposalText(record: EstimateRecord, info: ProposalInfo): string {
  const { result: r, analysis } = record;
  const date = new Date().toLocaleDateString("pt-BR");
  const lines = [
    `PROPOSTA DE DESENVOLVIMENTO - ${info.projectName}`,
    `${info.developerName}${info.clientName ? ` para ${info.clientName}` : ""} · ${date}`,
    "",
    `Investimento: ${formatBRL(r.price.recommended)}`,
    `Prazo estimado: ${r.timeline.weeks} semanas`,
    `Esforço: ~${r.hours.likely} horas (${formatBRL(r.rate.value)}/h)`,
    "",
    "ESCOPO",
    ...describeAnswers(record.answers).map((a) => `- ${a.question} ${a.answer}`),
    "",
    "FASES",
    ...r.phases.map((p) => `- ${p.label}: ${p.hours}h · ${formatBRL(p.value)}`),
  ];
  if (r.maintenance) {
    lines.push("", `MANUTENÇÃO MENSAL (opcional): ${formatBRL(r.maintenance.monthly)}/mês · ${r.maintenance.hours}h/mês`);
  }
  if (analysis?.risks.length) {
    lines.push("", "PREMISSAS E RISCOS", ...analysis.risks.map((x) => `- ${x}`));
  }
  lines.push(
    "",
    "CONDIÇÕES",
    "- 40% na aprovação, 30% na entrega intermediária e 30% na entrega final.",
    "- Alterações de escopo serão orçadas à parte com base no valor-hora acima.",
    "- Custos de terceiros (domínio, hospedagem, APIs pagas, lojas de apps) não inclusos.",
    `- Proposta válida por 15 dias. Valores incluem impostos (${Math.round(r.factors.taxRate * 100)}%).`,
    "",
    `Gerado com Devlator (referências de mercado: ${MARKET_UPDATED_AT}).`,
  );
  return lines.join("\n");
}

export function exportProposalText(record: EstimateRecord, info: ProposalInfo) {
  const blob = new Blob([proposalText(record, info)], { type: "text/plain;charset=utf-8" });
  download(blob, `proposta-${slug(info.projectName)}.txt`);
}

export async function exportProposalPDF(record: EstimateRecord, info: ProposalInfo) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const { result: r, analysis } = record;
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 18;
  let y = 0;

  const ensure = (space: number) => {
    if (y + space > H - 20) {
      pdf.addPage();
      y = 20;
    }
  };
  const heading = (text: string) => {
    ensure(14);
    y += 4;
    pdf.setFont("helvetica", "bold").setFontSize(11).setTextColor(110, 70, 200);
    pdf.text(latin1(text.toUpperCase()), M, y);
    y += 2;
    pdf.setDrawColor(220, 220, 230).line(M, y, W - M, y);
    y += 6;
  };
  const paragraph = (text: string, size = 10) => {
    pdf.setFont("helvetica", "normal").setFontSize(size).setTextColor(40, 40, 50);
    const lines = pdf.splitTextToSize(latin1(text), W - M * 2);
    lines.forEach((line: string) => {
      ensure(6);
      pdf.text(line, M, y);
      y += size * 0.5;
    });
    y += 1.5;
  };
  const row = (label: string, value: string) => {
    ensure(7);
    pdf.setFont("helvetica", "normal").setFontSize(10).setTextColor(90, 90, 105);
    const labelLines = pdf.splitTextToSize(latin1(label), W - M * 2 - 55);
    pdf.text(labelLines, M, y);
    pdf.setFont("helvetica", "bold").setTextColor(30, 30, 40);
    pdf.text(latin1(value), W - M, y, { align: "right" });
    y += Math.max(1, labelLines.length) * 5 + 1.5;
  };

  // Cabeçalho
  pdf.setFillColor(21, 22, 30).rect(0, 0, W, 38, "F");
  pdf.setFont("helvetica", "bold").setFontSize(18).setTextColor(255, 255, 255);
  pdf.text(latin1(info.projectName), M, 17);
  pdf.setFont("helvetica", "normal").setFontSize(10).setTextColor(189, 147, 249);
  pdf.text(
    latin1(`Proposta de ${info.developerName}${info.clientName ? ` para ${info.clientName}` : ""} · ${new Date().toLocaleDateString("pt-BR")}`),
    M,
    26,
  );
  pdf.setTextColor(170, 175, 200).text(latin1(r.projectLabel), M, 32);
  y = 52;

  // Destaques
  const boxes: Array<[string, string]> = [
    ["Investimento", formatBRL(r.price.recommended)],
    ["Prazo", `${r.timeline.weeks} semanas`],
    ["Esforço", `~${r.hours.likely} h`],
  ];
  const bw = (W - M * 2 - 8) / 3;
  boxes.forEach(([label, value], i) => {
    const x = M + i * (bw + 4);
    pdf.setFillColor(245, 243, 252).roundedRect(x, y - 8, bw, 20, 2, 2, "F");
    pdf.setFont("helvetica", "normal").setFontSize(8).setTextColor(110, 110, 130).text(label.toUpperCase(), x + 4, y - 2);
    pdf.setFont("helvetica", "bold").setFontSize(13).setTextColor(30, 30, 40).text(latin1(value), x + 4, y + 7);
  });
  y += 22;

  heading("Escopo");
  describeAnswers(record.answers).forEach((a) => row(a.question, a.answer));

  heading("Fases e investimento");
  r.phases.forEach((p) => row(`${p.label} (${p.hours}h)`, formatBRL(p.value)));
  row("Total", formatBRL(r.price.recommended));

  if (r.maintenance) {
    heading("Manutenção mensal (opcional)");
    paragraph(`${r.maintenance.hours} horas por mês para atualizações, correções e pequenas melhorias: ${formatBRL(r.maintenance.monthly)}/mês.`);
  }

  if (analysis?.summary) {
    heading("Análise");
    paragraph(analysis.summary);
  }
  if (analysis?.risks.length) {
    heading("Premissas e riscos");
    analysis.risks.forEach((x) => paragraph(`- ${x}`));
  }

  heading("Condições");
  [
    "Pagamento: 40% na aprovação, 30% na entrega intermediária e 30% na entrega final.",
    `Alterações de escopo serão orçadas à parte a ${formatBRL(r.rate.value)}/hora.`,
    "Custos de terceiros (domínio, hospedagem, APIs pagas, lojas de aplicativos) não estão inclusos.",
    `Valores com impostos inclusos (${Math.round(r.factors.taxRate * 100)}%). Proposta válida por 15 dias.`,
  ].forEach((c) => paragraph(`- ${c}`));

  ensure(30);
  y += 14;
  pdf.setDrawColor(150, 150, 160);
  pdf.line(M, y, M + 70, y);
  pdf.line(W - M - 70, y, W - M, y);
  pdf.setFont("helvetica", "normal").setFontSize(9).setTextColor(90, 90, 105);
  pdf.text(latin1(info.developerName), M, y + 5);
  pdf.text(latin1(info.clientName || "Cliente"), W - M - 70, y + 5);

  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8).setTextColor(150, 150, 160);
    pdf.text(`Gerado com Devlator · pagina ${i} de ${pages}`, M, H - 10);
  }

  pdf.save(`proposta-${slug(info.projectName)}.pdf`);
}

export function exportHistoryJSON(records: EstimateRecord[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  download(blob, `devlator-historico-${new Date().toISOString().slice(0, 10)}.json`);
}
