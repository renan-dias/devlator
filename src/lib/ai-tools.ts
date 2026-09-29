/**
 * Ferramentas de IA para desenvolvimento ("vibecoding") e seus planos.
 *
 * Preços mensais (cobrança mensal) conferidos nas páginas oficiais, acessadas do
 * Brasil, em AI_PRICES_UPDATED_AT. Alguns serviços já cobram em reais (sem câmbio
 * nem IOF); os cobrados em dólar pagam câmbio + IOF no cartão.
 */

export const AI_PRICES_UPDATED_AT = "29/09/2026";

/** IOF sobre compras internacionais no cartão (crédito, débito e pré-pago). */
export const IOF_RATE = 0.035;

/** Cotação usada quando a API de câmbio não responde. */
export const FALLBACK_USD_BRL = 5.23;

export type AiToolKind = "assistente" | "agente" | "construtor";

export type Currency = "USD" | "BRL";

export interface AiPlan {
  id: string;
  label: string;
  price: number;
  currency: Currency;
  /** Um único plano cobre a equipe inteira (não é cobrado por pessoa). */
  perWorkspace?: boolean;
}

export interface AiTool {
  id: string;
  name: string;
  kind: AiToolKind;
  description: string;
  pricingUrl: string;
  plans: AiPlan[];
}

export const AI_TOOL_KINDS: Record<AiToolKind, string> = {
  assistente: "Assistente no editor",
  agente: "Agente de código",
  construtor: "Construtor de apps (vibecoding)",
};

export const AI_TOOLS: AiTool[] = [
  {
    id: "copilot",
    name: "GitHub Copilot",
    kind: "assistente",
    description: "Autocompletar e chat no VS Code/JetBrains",
    pricingUrl: "https://github.com/features/copilot/plans",
    plans: [
      { id: "pro", label: "Pro", price: 10, currency: "USD" },
      { id: "pro_plus", label: "Pro+", price: 39, currency: "USD" },
      { id: "max", label: "Max", price: 100, currency: "USD" },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    kind: "agente",
    description: "Editor com agente de IA",
    pricingUrl: "https://cursor.com/pricing",
    plans: [
      { id: "pro", label: "Pro", price: 20, currency: "USD" },
      { id: "pro_plus", label: "Pro+", price: 60, currency: "USD" },
      { id: "ultra", label: "Ultra", price: 200, currency: "USD" },
      { id: "teams", label: "Teams (por pessoa)", price: 40, currency: "USD" },
    ],
  },
  {
    id: "claude",
    name: "Claude (Claude Code)",
    kind: "agente",
    description: "Agente no terminal/IDE + chat",
    pricingUrl: "https://claude.com/pricing",
    plans: [
      { id: "pro", label: "Pro", price: 110, currency: "BRL" },
      { id: "max5", label: "Max 5x", price: 550, currency: "BRL" },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (Codex)",
    kind: "agente",
    description: "Chat + agente Codex",
    pricingUrl: "https://chatgpt.com/pricing",
    plans: [
      { id: "plus", label: "Plus", price: 99.9, currency: "BRL" },
      { id: "pro", label: "Pro", price: 525, currency: "BRL" },
    ],
  },
  {
    id: "lovable",
    name: "Lovable",
    kind: "construtor",
    description: "Gera apps web completos por prompt",
    pricingUrl: "https://lovable.dev/pt-br/pricing",
    plans: [
      { id: "pro", label: "Pro (100 créditos)", price: 129, currency: "BRL", perWorkspace: true },
      { id: "business", label: "Business (100 créditos)", price: 259, currency: "BRL", perWorkspace: true },
    ],
  },
  {
    id: "bolt",
    name: "Bolt.new",
    kind: "construtor",
    description: "Apps full-stack no navegador",
    pricingUrl: "https://bolt.new/pricing",
    plans: [
      { id: "pro", label: "Pro (10M tokens)", price: 25, currency: "USD" },
      { id: "teams", label: "Teams (por pessoa)", price: 30, currency: "USD" },
    ],
  },
  {
    id: "v0",
    name: "v0 (Vercel)",
    kind: "construtor",
    description: "Interfaces React/Next por prompt",
    pricingUrl: "https://v0.app/pricing",
    plans: [
      { id: "plus", label: "Plus (por pessoa)", price: 30, currency: "USD" },
      { id: "business", label: "Business (por pessoa)", price: 100, currency: "USD" },
    ],
  },
  {
    id: "replit",
    name: "Replit Agent",
    kind: "construtor",
    description: "Agente que cria e publica apps",
    pricingUrl: "https://replit.com/pricing",
    plans: [
      { id: "core", label: "Core", price: 20, currency: "USD" },
      { id: "pro", label: "Pro", price: 100, currency: "USD" },
    ],
  },
];

export const findAiTool = (id: string) => AI_TOOLS.find((t) => t.id === id);

export interface AiToolSelection {
  toolId: string;
  planId: string;
  seats: number;
}

export interface AiSetup {
  enabled: boolean;
  tools: AiToolSelection[];
  /** Meses de assinatura. null = calculado pelo prazo do projeto. */
  months: number | null;
  /** Gasto extra em US$/mês (API paga por uso, créditos adicionais). */
  extraUsdMonthly: number;
  /**
   * Variação de horas atribuída à IA (0.2 = 20% menos horas; negativo = mais horas).
   * Começa em 0: os estudos divergem (METR 2025: −19%; GitHub 2023: +55,8% numa tarefa isolada).
   */
  productivity: number;
  usdBrl: number;
  /** Data da cotação (ISO) ou null quando for a cotação padrão. */
  rateDate: string | null;
  includeIof: boolean;
  /** true = repassa ao cliente no preço; false = o dev absorve o custo. */
  passThrough: boolean;
}

/** Perfis sugeridos pela pergunta "Vai usar IA para programar?". */
export const AI_PRESETS: Record<string, AiToolSelection[]> = {
  assistente: [{ toolId: "copilot", planId: "pro", seats: 1 }],
  agente: [{ toolId: "cursor", planId: "pro", seats: 1 }],
  vibecoding: [
    { toolId: "lovable", planId: "pro", seats: 1 },
    { toolId: "claude", planId: "pro", seats: 1 },
  ],
};

export function defaultAiSetup(preset: string | undefined, people = 1, usdBrl = FALLBACK_USD_BRL, rateDate: string | null = null): AiSetup {
  const seats = Math.max(1, Math.ceil(people));
  return {
    enabled: !!preset && preset !== "nao",
    tools: (AI_PRESETS[preset ?? ""] ?? []).map((t) => ({ ...t, seats })),
    months: null,
    extraUsdMonthly: 0,
    productivity: 0,
    usdBrl,
    rateDate,
    includeIof: true,
    passThrough: true,
  };
}

export interface AiCostLine {
  label: string;
  seats: number;
  /** Valor mensal na moeda de cobrança. */
  amount: number;
  currency: Currency;
  brlMonthly: number;
}

export interface AiCost {
  months: number;
  /** Fator aplicado a valores em dólar (câmbio × IOF). */
  usdFactor: number;
  brlMonthly: number;
  total: number;
  lines: AiCostLine[];
}

/** Custo das ferramentas em R$. Planos em dólar recebem câmbio e IOF. */
export function computeAiCost(setup: AiSetup, projectWeeks: number): AiCost {
  const months = Math.max(1, Math.round(setup.months ?? Math.ceil(projectWeeks / 4.345)));
  const usdFactor = setup.usdBrl * (setup.includeIof ? 1 + IOF_RATE : 1);
  const toBrl = (amount: number, currency: Currency) => (currency === "USD" ? amount * usdFactor : amount);
  const lines: AiCostLine[] = setup.tools.flatMap((sel) => {
    const tool = findAiTool(sel.toolId);
    const plan = tool?.plans.find((p) => p.id === sel.planId);
    if (!tool || !plan) return [];
    const seats = plan.perWorkspace ? 1 : Math.max(1, Math.round(sel.seats));
    const amount = plan.price * seats;
    return [{ label: `${tool.name} ${plan.label}`, seats, amount, currency: plan.currency, brlMonthly: toBrl(amount, plan.currency) }];
  });
  if (setup.extraUsdMonthly > 0) {
    lines.push({
      label: "Uso extra (API/créditos)",
      seats: 1,
      amount: setup.extraUsdMonthly,
      currency: "USD",
      brlMonthly: toBrl(setup.extraUsdMonthly, "USD"),
    });
  }
  const brlMonthly = lines.reduce((s, l) => s + l.brlMonthly, 0);
  return { months, usdFactor, brlMonthly, total: brlMonthly * months, lines };
}

export const formatPlanPrice = (plan: Pick<AiPlan, "price" | "currency">) =>
  new Intl.NumberFormat(plan.currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: plan.price % 1 ? 2 : 0,
  }).format(plan.price);

export const AI_SOURCES = [
  ...AI_TOOLS.map((t) => ({ label: `Preços — ${t.name}`, url: t.pricingUrl })),
  { label: "IOF de 3,5% em compras internacionais no cartão", url: "https://www.camara.leg.br/radio/programas/1182454-aumento-do-iof-para-cartao-internacional-volta-a-valer/" },
  { label: "METR (2025): devs experientes 19% mais lentos com IA", url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" },
  { label: "Peng et al. (2023): tarefa 55,8% mais rápida com Copilot", url: "https://arxiv.org/abs/2302.06590" },
];
