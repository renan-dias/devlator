/**
 * Planos de hospedagem de Hostinger, Locaweb e HostGator.
 *
 * Valores coletados nas páginas oficiais e nos carrinhos em HOSTING_UPDATED_AT.
 * Os planos são pré-pagos: o preço promocional vale só no primeiro ciclo e a
 * renovação é cobrada pelo preço regular.
 */

export const HOSTING_UPDATED_AT = "29/09/2026";

export type HostingProvider = "hostinger" | "locaweb" | "hostgator";
export type HostingCategory = "compartilhada" | "vps";
export type HostingTier = "entrada" | "intermediario" | "avancado";

export const PROVIDERS: Record<HostingProvider, { name: string; url: Record<HostingCategory, string> }> = {
  hostinger: {
    name: "Hostinger",
    url: { compartilhada: "https://www.hostinger.com/br/hospedagem-de-sites", vps: "https://www.hostinger.com/br/vps-hosting" },
  },
  locaweb: {
    name: "Locaweb",
    url: { compartilhada: "https://www.locaweb.com.br/hospedagem-de-sites/", vps: "https://www.locaweb.com.br/vps/" },
  },
  hostgator: {
    name: "HostGator",
    url: { compartilhada: "https://www.hostgator.com.br/hospedagem-de-sites", vps: "https://www.hostgator.com.br/servidor-vps" },
  },
};

export const TIER_LABELS: Record<HostingCategory, Record<HostingTier, string>> = {
  compartilhada: {
    entrada: "Entrada — 1 site",
    intermediario: "Intermediário — vários sites",
    avancado: "Avançado — mais tráfego",
  },
  vps: {
    entrada: "VPS de entrada (1–2 vCPU)",
    intermediario: "VPS intermediária (2 vCPU)",
    avancado: "VPS avançada (4 vCPU)",
  },
};

export interface HostingOffer {
  /** Meses pagos antecipadamente para ter o preço promocional. */
  cycleMonths: number;
  /** Preço mensal equivalente no primeiro ciclo. */
  promo: number;
  /** Preço mensal na renovação. */
  renewal: number;
  /** Total do ciclo exatamente como anunciado, quando difere de promo × meses por arredondamento. */
  promoTotal?: number;
}

export interface HostingPlan {
  id: string;
  provider: HostingProvider;
  category: HostingCategory;
  tier: HostingTier;
  name: string;
  specs: string;
  offers: HostingOffer[];
}

export const HOSTING_PLANS: HostingPlan[] = [
  // Hostinger — hospedagem de sites (ciclo de 48 meses)
  { id: "hostinger-single", provider: "hostinger", category: "compartilhada", tier: "entrada", name: "Single", specs: "1 site · 10 GB SSD · domínio grátis", offers: [{ cycleMonths: 48, promo: 5.99, renewal: 23.99 }] },
  { id: "hostinger-premium", provider: "hostinger", category: "compartilhada", tier: "intermediario", name: "Premium", specs: "3 sites · 20 GB SSD · domínio 1 ano", offers: [{ cycleMonths: 48, promo: 10.99, renewal: 38.99 }] },
  { id: "hostinger-unlimited", provider: "hostinger", category: "compartilhada", tier: "avancado", name: "Unlimited", specs: "Sites ilimitados · 50 GB NVMe · backup diário", offers: [{ cycleMonths: 48, promo: 13.99, renewal: 64.99 }] },

  // Locaweb — hospedagem de sites (carrinho: 12, 24 e 48 meses)
  {
    id: "locaweb-go", provider: "locaweb", category: "compartilhada", tier: "entrada", name: "Hospedagem Go", specs: "1 site · 15 GB SSD · 20 mil visitas/mês",
    offers: [{ cycleMonths: 12, promo: 9.9, renewal: 20.9 }, { cycleMonths: 24, promo: 7.9, renewal: 19.9 }, { cycleMonths: 48, promo: 5.9, renewal: 17.9 }],
  },
  {
    id: "locaweb-i", provider: "locaweb", category: "compartilhada", tier: "intermediario", name: "Hospedagem I", specs: "Sites ilimitados · 35 GB SSD · 35 mil visitas/mês",
    offers: [{ cycleMonths: 12, promo: 10.9, renewal: 32.9 }, { cycleMonths: 24, promo: 12.9, renewal: 27.9 }, { cycleMonths: 48, promo: 10.9, renewal: 24.9 }],
  },
  {
    id: "locaweb-ii", provider: "locaweb", category: "compartilhada", tier: "avancado", name: "Hospedagem II", specs: "Sites ilimitados · 60 GB SSD · 120 mil visitas/mês",
    offers: [{ cycleMonths: 12, promo: 16.9, renewal: 54.9 }, { cycleMonths: 24, promo: 18.9, renewal: 47.9 }, { cycleMonths: 48, promo: 16.9, renewal: 44.9 }],
  },

  // HostGator — hospedagem de sites (ciclo de 36 meses; renova pelo preço cheio)
  { id: "hostgator-p", provider: "hostgator", category: "compartilhada", tier: "entrada", name: "Plano P", specs: "1 site · 100 GB NVMe · 80 mil visitas/mês", offers: [{ cycleMonths: 36, promo: 10.09, renewal: 45.89, promoTotal: 361.61 }] },
  { id: "hostgator-m", provider: "hostgator", category: "compartilhada", tier: "intermediario", name: "Plano M", specs: "+60 sites · 100 GB NVMe · 120 mil visitas/mês", offers: [{ cycleMonths: 36, promo: 11.49, renewal: 55.59, promoTotal: 412.17 }] },
  { id: "hostgator-turbo", provider: "hostgator", category: "compartilhada", tier: "avancado", name: "Plano Turbo", specs: "+150 sites · 150 GB NVMe · 400 mil visitas/mês", offers: [{ cycleMonths: 36, promo: 18.69, renewal: 73.99, promoTotal: 670.22 }] },

  // VPS
  { id: "hostinger-kvm1", provider: "hostinger", category: "vps", tier: "entrada", name: "KVM 1", specs: "1 vCPU · 4 GB RAM · 50 GB NVMe", offers: [{ cycleMonths: 24, promo: 29.99, renewal: 59.99 }] },
  { id: "hostinger-kvm2", provider: "hostinger", category: "vps", tier: "intermediario", name: "KVM 2", specs: "2 vCPU · 8 GB RAM · 100 GB NVMe", offers: [{ cycleMonths: 24, promo: 43.99, renewal: 77.99 }] },
  { id: "hostinger-kvm4", provider: "hostinger", category: "vps", tier: "avancado", name: "KVM 4", specs: "4 vCPU · 16 GB RAM · 200 GB NVMe", offers: [{ cycleMonths: 24, promo: 59.99, renewal: 149.99 }] },

  { id: "locaweb-vps2", provider: "locaweb", category: "vps", tier: "entrada", name: "VPS 2 GB", specs: "2 vCPU · 2 GB RAM · 60 GB SSD", offers: [{ cycleMonths: 24, promo: 23.9, renewal: 36.9 }] },
  { id: "locaweb-vps4", provider: "locaweb", category: "vps", tier: "intermediario", name: "VPS 4 GB", specs: "2 vCPU · 4 GB RAM · 70 GB SSD (+30 GB)", offers: [{ cycleMonths: 24, promo: 53.9, renewal: 72.9 }] },
  { id: "locaweb-vps8", provider: "locaweb", category: "vps", tier: "avancado", name: "VPS 8 GB", specs: "4 vCPU · 8 GB RAM · 200 GB SSD (+30 GB)", offers: [{ cycleMonths: 24, promo: 105.9, renewal: 145.9 }] },

  { id: "hostgator-vps2", provider: "hostgator", category: "vps", tier: "entrada", name: "VPS NVMe 2", specs: "1 vCPU · 2 GB RAM · 50 GB NVMe", offers: [{ cycleMonths: 36, promo: 20.99, renewal: 54.98 }] },
  { id: "hostgator-vps4", provider: "hostgator", category: "vps", tier: "intermediario", name: "VPS NVMe 4", specs: "2 vCPU · 4 GB RAM · 100 GB NVMe", offers: [{ cycleMonths: 36, promo: 30.39, renewal: 96.65, promoTotal: 1094.11 }] },
  { id: "hostgator-vps8", provider: "hostgator", category: "vps", tier: "avancado", name: "VPS NVMe 8", specs: "4 vCPU · 8 GB RAM · 200 GB NVMe", offers: [{ cycleMonths: 36, promo: 45.49, renewal: 173.32, promoTotal: 1637.77 }] },
];

export interface HostingQuote {
  plan: HostingPlan;
  offer: HostingOffer;
  /** Total pago no período (inclui o ciclo inteiro pago adiantado). */
  total: number;
  /** Total ÷ meses do período (ou do ciclo, se maior). */
  effectiveMonthly: number;
  /** Quanto o preço mensal sobe na renovação (0.5 = +50%). */
  renewalJump: number;
}

/**
 * Custo real de um plano ao longo de `months`: o ciclo promocional é pago
 * inteiro, e o que passar dele é cobrado pelo preço de renovação.
 * Entre as ofertas do plano, escolhe a mais barata para o período.
 */
export function quotePlan(plan: HostingPlan, months: number): HostingQuote {
  const quotes = plan.offers.map((offer) => {
    const total = (offer.promoTotal ?? offer.promo * offer.cycleMonths) + offer.renewal * Math.max(0, months - offer.cycleMonths);
    return {
      plan,
      offer,
      total,
      effectiveMonthly: total / Math.max(months, offer.cycleMonths),
      renewalJump: offer.renewal / offer.promo - 1,
    };
  });
  return quotes.reduce((best, q) => (q.total < best.total ? q : best));
}

export interface HostingSelection {
  category: HostingCategory;
  horizonYears: number;
}

/** Tipos de projeto que normalmente precisam de servidor próprio (Node, Python, workers). */
const NEEDS_VPS = new Set(["webapp", "saas", "sistema", "api", "mobile"]);

export function defaultHostingSelection(projectType: string, hostingAnswer?: string): HostingSelection {
  const category: HostingCategory =
    hostingAnswer === "compartilhada" ? "compartilhada" : hostingAnswer === "vps" || NEEDS_VPS.has(projectType) ? "vps" : "compartilhada";
  return { category, horizonYears: 2 };
}

export function compareHosting(category: HostingCategory, horizonYears: number) {
  const months = horizonYears * 12;
  const tiers: HostingTier[] = ["entrada", "intermediario", "avancado"];
  return tiers.map((tier) => {
    const quotes = HOSTING_PLANS.filter((p) => p.category === category && p.tier === tier)
      .map((p) => quotePlan(p, months))
      .sort((a, b) => a.total - b.total);
    return { tier, label: TIER_LABELS[category][tier], quotes, cheapest: quotes[0] };
  });
}

export const HOSTING_SOURCES = (Object.keys(PROVIDERS) as HostingProvider[]).flatMap((p) => [
  { label: `${PROVIDERS[p].name} — hospedagem de sites`, url: PROVIDERS[p].url.compartilhada },
  { label: `${PROVIDERS[p].name} — VPS`, url: PROVIDERS[p].url.vps },
]);
