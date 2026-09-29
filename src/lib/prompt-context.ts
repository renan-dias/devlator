import { MARKET_UPDATED_AT, PROJECT_TYPES, SENIORITY, formatBRL } from "./market-data";
import { describeAnswers, type EstimateResult } from "./estimator";
import type { Answers } from "./questions";

/** Tabela de referência de mercado em texto, para ancorar as respostas da IA. */
export function marketReferenceText(): string {
  const types = Object.values(PROJECT_TYPES)
    .map((t) => `- ${t.label}: ${formatBRL(t.market.min)} a ${formatBRL(t.market.max)} (típico ${formatBRL(t.market.typical)})`)
    .join("\n");
  const rates = Object.values(SENIORITY)
    .map((s) => `- ${s.label}: ${formatBRL(s.rate.min)}–${formatBRL(s.rate.max)}/h (média ${formatBRL(s.rate.typical)}/h)`)
    .join("\n");
  return `REFERÊNCIAS DE MERCADO BRASILEIRO (atualizadas em ${MARKET_UPDATED_AT}):
Faixas de preço por tipo de projeto:
${types}
Valor-hora freelancer/PJ por senioridade (capitais):
${rates}
Ajustes regionais: interior −15%, SP/RJ +15%, cliente internacional ~1,8×.
Impostos: Simples Nacional começa em ~6% para desenvolvimento de software.`;
}

export function estimateContextText(answers: Answers, result: EstimateResult): string {
  const specs = describeAnswers(answers)
    .map((a) => `- ${a.question} → ${a.answer}`)
    .join("\n");
  return `PROJETO: ${result.projectLabel}
${specs}

ESTIMATIVA CALCULADA PELO DEVLATOR:
- Horas: ${result.hours.min}–${result.hours.max} (provável ${result.hours.likely}h)
- Valor-hora: ${formatBRL(result.rate.value)} (${result.rate.isCustom ? "definido pelo dev" : "média de mercado do perfil"})
- Preço recomendado: ${formatBRL(result.price.recommended)} (faixa ${formatBRL(result.price.min)}–${formatBRL(result.price.max)})
- Prazo estimado: ${result.timeline.weeks} semanas com ${result.timeline.people} pessoa(s) a ${result.timeline.weeklyHours}h/semana${result.timeline.feasible ? "" : " — NÃO cabe no prazo pedido"}
- Contingência: ${Math.round(result.factors.contingency * 100)}% · Urgência: +${Math.round(result.factors.urgency * 100)}% · Impostos: ${Math.round(result.factors.taxRate * 100)}%
${
    result.ai
      ? `- Ferramentas de IA: ${result.ai.cost.lines.map((l) => l.label).join(", ")} — ${formatBRL(result.ai.cost.brlMonthly)}/mês por ${result.ai.cost.months} mês(es) = ${formatBRL(result.ai.cost.total)} (${result.ai.passThrough ? "repassado ao cliente" : "absorvido pelo dev"})${result.ai.productivity ? `; efeito nas horas: ${Math.round(-result.ai.productivity * 100)}%` : ""}\n`
      : ""
  }- Faixa de mercado para o tipo: ${formatBRL(result.market.range.min)}–${formatBRL(result.market.range.max)} (posição: ${result.market.position === "within" ? "dentro" : result.market.position === "below" ? "abaixo" : "acima"})`;
}
