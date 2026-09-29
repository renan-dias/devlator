import {
  DEFAULT_TAX_RATE,
  PROJECT_TYPES,
  REGIONS,
  SENIORITY,
  type PriceRange,
  type ProjectType,
  type Region,
  type Seniority,
  formatBRL,
} from "./market-data";
import { findOption, getApplicableQuestions, type Answers } from "./questions";

export interface Profile {
  seniority: Seniority;
  region: Region;
  /** Valor-hora próprio. Quando vazio, usa a média de mercado do perfil. */
  customRate?: number | null;
  /** Alíquota de impostos (0.06 = 6%). */
  taxRate: number;
}

export const DEFAULT_PROFILE: Profile = {
  seniority: "pleno",
  region: "capital",
  customRate: null,
  taxRate: DEFAULT_TAX_RATE,
};

export type MarketPosition = "below" | "within" | "above";

export interface Phase {
  id: string;
  label: string;
  hours: number;
  value: number;
}

export interface EstimateResult {
  projectType: ProjectType;
  projectLabel: string;
  hours: { min: number; likely: number; max: number };
  rate: { value: number; isCustom: boolean; market: PriceRange };
  price: { min: number; recommended: number; max: number };
  factors: {
    baseHours: number;
    scope: number;
    fixedHours: number;
    pct: number;
    overhead: number;
    contingency: number;
    urgency: number;
    taxRate: number;
  };
  phases: Phase[];
  timeline: {
    weeks: number;
    people: number;
    weeklyHours: number;
    deadlineWeeks: number | null;
    feasible: boolean;
  };
  maintenance: { hours: number; monthly: number } | null;
  market: {
    range: PriceRange;
    note: string;
    position: MarketPosition;
    diffFromTypical: number;
  };
  rateComparison: { position: MarketPosition; diffFromTypical: number };
  insights: string[];
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Arredonda para valores "de proposta" (R$ 4.350 em vez de R$ 4.347,82). */
export function roundPrice(value: number): number {
  const step = value < 1000 ? 10 : value < 10000 ? 50 : value < 100000 ? 100 : 500;
  return Math.round(value / step) * step;
}

const positionOf = (value: number, range: PriceRange): MarketPosition =>
  value < range.min ? "below" : value > range.max ? "above" : "within";

export function marketRateFor(profile: Profile): PriceRange {
  const { rate } = SENIORITY[profile.seniority];
  const factor = REGIONS[profile.region].factor;
  return {
    min: Math.round(rate.min * factor),
    typical: Math.round((rate.typical * factor) / 5) * 5,
    max: Math.round(rate.max * factor),
  };
}

const DESIGN_SHARE: Record<string, number> = {
  pronto: 0.04,
  template: 0.06,
  simples: 0.08,
  customizado: 0.14,
  complexo: 0.18,
};

const TEST_SHARE: Record<string, number> = {
  nenhum: 0.05,
  basicos: 0.08,
  unitarios: 0.12,
  completos: 0.16,
};

export function estimate(answers: Answers, profile: Profile): EstimateResult {
  const projectType = (answers.tipo as ProjectType) in PROJECT_TYPES ? (answers.tipo as ProjectType) : "webapp";
  const typeInfo = PROJECT_TYPES[projectType];

  let scope = 1;
  let fixedHours = 0;
  let pct = 0;
  let contingency = 0.1;
  let urgency = 0;
  let people = 1;
  let overhead = 0;
  let weeklyHours = 40;
  let deadlineWeeks: number | null = null;
  let maintenanceHours = 0;

  for (const question of getApplicableQuestions(answers)) {
    const effect = findOption(question.id, answers[question.id])?.effect;
    if (!effect) continue;
    if (effect.scope !== undefined) scope = effect.scope;
    if (effect.hours) fixedHours += effect.hours;
    if (effect.pct) pct += effect.pct;
    if (effect.contingency !== undefined) contingency = effect.contingency;
    if (effect.urgency !== undefined) urgency = effect.urgency;
    if (effect.people !== undefined) people = effect.people;
    if (effect.overhead !== undefined) overhead = effect.overhead;
    if (effect.weeklyHours !== undefined) weeklyHours = effect.weeklyHours;
    if (effect.deadlineWeeks !== undefined) deadlineWeeks = effect.deadlineWeeks;
    if (effect.maintenanceHours !== undefined) maintenanceHours = effect.maintenanceHours;
  }

  pct = clamp(pct, -0.3, 2.5);
  const baseHours = typeInfo.baseHours * scope;
  const likely = Math.max(4, Math.round((baseHours + fixedHours) * (1 + pct) * (1 + overhead)));
  const hours = {
    min: Math.round(likely * 0.85),
    likely,
    max: Math.round(likely * (1.15 + contingency)),
  };

  const marketRate = marketRateFor(profile);
  const isCustom = !!profile.customRate && profile.customRate > 0;
  const rate = isCustom ? Math.round(profile.customRate!) : marketRate.typical;
  const taxRate = clamp(profile.taxRate, 0, 0.5);
  const gross = (h: number, withContingency: boolean) =>
    (h * rate * (1 + urgency) * (withContingency ? 1 + contingency : 1)) / (1 - taxRate);

  const price = {
    min: roundPrice(gross(hours.min, false)),
    recommended: roundPrice(gross(hours.likely, true)),
    max: roundPrice(gross(hours.max, false)),
  };

  // Distribuição por fase: pesos relativos normalizados.
  const weights: Array<[string, string, number]> = [
    ["discovery", "Descoberta e planejamento", 0.07 + (contingency >= 0.2 ? 0.04 : 0)],
    ["design", "Design / UI", projectType === "api" ? 0.02 : DESIGN_SHARE[answers.design] ?? 0.08],
    ["dev", "Desenvolvimento", 0.58],
    ["qa", "Testes e QA", TEST_SHARE[answers.testes] ?? 0.06],
    ["deploy", "Deploy e infraestrutura", 0.04 + (answers.hospedagem === "kubernetes" ? 0.04 : 0)],
    ["pm", "Gestão e comunicação", 0.06 + overhead / 2],
  ];
  const totalWeight = weights.reduce((sum, [, , w]) => sum + w, 0);
  const phases: Phase[] = weights.map(([id, label, w]) => ({
    id,
    label,
    hours: Math.round((hours.likely * w) / totalWeight),
    value: roundPrice((price.recommended * w) / totalWeight),
  }));
  // Arredondamentos por fase não podem fazer a soma divergir do total.
  const dev = phases.find((p) => p.id === "dev")!;
  dev.value += price.recommended - phases.reduce((sum, p) => sum + p.value, 0);

  const weeks = Math.max(0.5, Math.ceil((hours.likely / (people * weeklyHours * 0.85)) * 2) / 2);
  const feasible = deadlineWeeks === null || weeks <= deadlineWeeks;

  const maintenance =
    maintenanceHours > 0
      ? { hours: maintenanceHours, monthly: roundPrice((maintenanceHours * rate) / (1 - taxRate)) }
      : null;

  const marketRange = typeInfo.market;
  const result: EstimateResult = {
    projectType,
    projectLabel: typeInfo.label,
    hours,
    rate: { value: rate, isCustom, market: marketRate },
    price,
    factors: { baseHours: Math.round(baseHours), scope, fixedHours, pct, overhead, contingency, urgency, taxRate },
    phases,
    timeline: { weeks, people, weeklyHours, deadlineWeeks, feasible },
    maintenance,
    market: {
      range: marketRange,
      note: typeInfo.marketNote,
      position: positionOf(price.recommended, marketRange),
      diffFromTypical: (price.recommended - marketRange.typical) / marketRange.typical,
    },
    rateComparison: {
      position: positionOf(rate, marketRate),
      diffFromTypical: (rate - marketRate.typical) / marketRate.typical,
    },
    insights: [],
  };
  result.insights = buildInsights(result, answers, profile);
  return result;
}

/** Recomendações determinísticas — funcionam sem IA e sem internet. */
export function buildInsights(r: EstimateResult, answers: Answers, profile: Profile): string[] {
  const tips: string[] = [];

  if (r.rateComparison.position === "below") {
    tips.push(
      `Seu valor-hora (${formatBRL(r.rate.value)}) está abaixo da faixa de ${SENIORITY[profile.seniority].label} na sua região (${formatBRL(r.rate.market.min)}–${formatBRL(r.rate.market.max)}). Considere reajustar.`,
    );
  } else if (r.rateComparison.position === "above") {
    tips.push(
      `Seu valor-hora está acima da média do seu perfil. Justifique com portfólio, especialização e resultados de negócio.`,
    );
  }

  if (r.market.position === "below") {
    tips.push(
      `O preço ficou abaixo do que o mercado costuma cobrar por ${r.projectLabel.toLowerCase()} (${formatBRL(r.market.range.min)}–${formatBRL(r.market.range.max)}). Revise se o escopo está completo ou se sua hora está baixa.`,
    );
  } else if (r.market.position === "above") {
    tips.push(
      `O preço ficou acima da faixa usual para ${r.projectLabel.toLowerCase()}. Ofereça um MVP em fases para caber no orçamento do cliente.`,
    );
  }

  if (!r.timeline.feasible && r.timeline.deadlineWeeks) {
    const neededPeople = Math.ceil(r.hours.likely / (r.timeline.deadlineWeeks * r.timeline.weeklyHours * 0.85));
    tips.push(
      `O prazo pedido (${r.timeline.deadlineWeeks} semanas) é menor que o necessário (~${r.timeline.weeks} semanas). Seriam ~${neededPeople} pessoas em paralelo — ou negocie o prazo/escopo.`,
    );
  }

  if (r.factors.urgency >= 0.3) {
    tips.push("Urgência alta: deixe explícito na proposta que o adicional cobre horas extras e priorização exclusiva.");
  }
  if (r.factors.contingency >= 0.2) {
    tips.push("Escopo pouco definido: cobre uma fase de descoberta paga ou trabalhe por sprints com valor fechado por sprint.");
  }
  if (answers.tecnologia === "aprender") {
    tips.push("Você vai aprender a stack durante o projeto. É razoável absorver parte dessas horas como investimento próprio.");
  }
  if (answers.manutencao === "nao" && r.hours.likely > 80) {
    tips.push("Ofereça um plano de manutenção mensal: gera receita recorrente e evita chamados avulsos sem cobrança.");
  }
  if (r.factors.taxRate === 0) {
    tips.push("Você não incluiu impostos. Emitindo nota pelo Simples Nacional, a alíquota inicial para software é ~6%.");
  }

  tips.push("Divida o pagamento em marcos: 30–50% de entrada e o restante atrelado às entregas.");
  return tips.slice(0, 6);
}

/** Converte respostas em texto legível, para prompts e exportações. */
export function describeAnswers(answers: Answers): Array<{ id: string; question: string; answer: string }> {
  return getApplicableQuestions(answers)
    .filter((q) => answers[q.id])
    .map((q) => ({
      id: q.id,
      question: q.question,
      answer: findOption(q.id, answers[q.id])?.label ?? answers[q.id],
    }));
}
