/**
 * Referências de mercado brasileiro usadas pelo motor de estimativa.
 *
 * Os números abaixo foram consolidados a partir de pesquisas salariais e tabelas
 * públicas de preço de agências/freelancers (2025–2026). São faixas de referência,
 * não preços tabelados — cada fonte está listada em MARKET_SOURCES.
 */

export const MARKET_UPDATED_AT = "setembro de 2026";

export type ProjectType =
  | "landing"
  | "website"
  | "blog"
  | "ecommerce"
  | "webapp"
  | "saas"
  | "mobile"
  | "sistema"
  | "api";

export interface PriceRange {
  min: number;
  typical: number;
  max: number;
}

export interface ProjectTypeInfo {
  label: string;
  /** Horas de um projeto de escopo "padrão" feito por um dev pleno. */
  baseHours: number;
  /** Faixa praticada no mercado (freelancers até agências). */
  market: PriceRange;
  marketNote: string;
}

export const PROJECT_TYPES: Record<ProjectType, ProjectTypeInfo> = {
  landing: {
    label: "Landing page",
    baseHours: 16,
    market: { min: 500, typical: 2000, max: 7000 },
    marketNote: "De R$ 500 (template simples) a ~R$ 7 mil em agências especializadas.",
  },
  website: {
    label: "Site institucional",
    baseHours: 40,
    market: { min: 1500, typical: 5000, max: 15000 },
    marketNote: "Sites de até 5 páginas ficam entre R$ 3–6 mil em agências; projetos maiores passam de R$ 12 mil.",
  },
  blog: {
    label: "Blog / portal de conteúdo",
    baseHours: 36,
    market: { min: 2000, typical: 4500, max: 10000 },
    marketNote: "Blogs e portais costumam ficar entre R$ 2 mil e R$ 8 mil.",
  },
  ecommerce: {
    label: "E-commerce",
    baseHours: 160,
    market: { min: 8000, typical: 25000, max: 80000 },
    marketNote: "Lojas completas ficam entre R$ 10–50 mil e passam de R$ 80 mil com integrações avançadas.",
  },
  webapp: {
    label: "Aplicação web",
    baseHours: 220,
    market: { min: 15000, typical: 45000, max: 120000 },
    marketNote: "Sistemas internos simples (5–10 telas) ficam entre R$ 40–80 mil em software houses.",
  },
  saas: {
    label: "SaaS / MVP de startup",
    baseHours: 450,
    market: { min: 30000, typical: 80000, max: 200000 },
    marketNote: "MVPs ficam entre R$ 40–90 mil; plataformas SaaS vão de R$ 60 mil a R$ 200 mil+.",
  },
  mobile: {
    label: "App mobile",
    baseHours: 350,
    market: { min: 20000, typical: 60000, max: 150000 },
    marketNote: "Apps simples: R$ 20–60 mil. Média complexidade: R$ 60–120 mil. Avançados: R$ 120 mil+.",
  },
  sistema: {
    label: "Sistema empresarial (ERP/CRM)",
    baseHours: 700,
    market: { min: 40000, typical: 120000, max: 300000 },
    marketNote: "Sistemas médios (15–40 telas) ficam entre R$ 100–300 mil.",
  },
  api: {
    label: "API / backend",
    baseHours: 120,
    market: { min: 5000, typical: 20000, max: 80000 },
    marketNote: "APIs REST simples: R$ 5–15 mil. Integrações com legado: R$ 30–50 mil. Microsserviços: R$ 50 mil+.",
  },
};

export type Seniority = "junior" | "pleno" | "senior" | "especialista" | "agencia";

export interface SeniorityInfo {
  label: string;
  description: string;
  /** Valor-hora de freelancer/PJ em R$. */
  rate: PriceRange;
  /** Salário CLT médio mensal usado como base de comparação. */
  cltMonthly?: number;
}

/**
 * Valor-hora derivado das médias salariais (Pesquisa Código Fonte TV 2025/2026)
 * convertidas para PJ/freelancer (≈ 1,4× pela ausência de benefícios e ≈ 1,6× por
 * horas não faturáveis), cruzado com as faixas publicadas por Glassdoor e nFactory.
 */
export const SENIORITY: Record<Seniority, SeniorityInfo> = {
  junior: {
    label: "Júnior",
    description: "Até ~2 anos de experiência",
    rate: { min: 40, typical: 60, max: 90 },
    cltMonthly: 4150,
  },
  pleno: {
    label: "Pleno",
    description: "2 a 5 anos, autonomia na entrega",
    rate: { min: 70, typical: 100, max: 140 },
    cltMonthly: 7840,
  },
  senior: {
    label: "Sênior",
    description: "5+ anos, arquitetura e mentoria",
    rate: { min: 120, typical: 170, max: 250 },
    cltMonthly: 15600,
  },
  especialista: {
    label: "Especialista / Tech Lead",
    description: "Referência técnica, nichos (IA, segurança, cloud)",
    rate: { min: 180, typical: 250, max: 350 },
    cltMonthly: 19300,
  },
  agencia: {
    label: "Agência / software house",
    description: "Equipe com gestão, design e QA",
    rate: { min: 120, typical: 180, max: 280 },
  },
};

export type Region = "interior" | "capital" | "sp_rj" | "sul" | "internacional";

export const REGIONS: Record<Region, { label: string; description: string; factor: number }> = {
  interior: { label: "Interior / cidades menores", description: "Clientes mais sensíveis a preço", factor: 0.85 },
  capital: { label: "Capitais / regiões metropolitanas", description: "Referência de mercado", factor: 1 },
  sp_rj: { label: "São Paulo / Rio de Janeiro", description: "Maiores tickets do país", factor: 1.15 },
  sul: { label: "Polos tech (Sul, Floripa, BH, Recife)", description: "Mercado aquecido", factor: 1.05 },
  internacional: { label: "Cliente internacional", description: "Cobrança em USD/EUR", factor: 1.8 },
};

/** Alíquota inicial do Simples Nacional (Anexo III com Fator R ≥ 28%). */
export const DEFAULT_TAX_RATE = 0.06;

/** Custos recorrentes típicos (repassados ao cliente). */
export const RECURRING_COSTS = [
  { label: "Domínio .com.br", value: "R$ 40–80/ano" },
  { label: "Certificado SSL", value: "Grátis (Let's Encrypt)" },
  { label: "Loja de apps", value: "US$ 99/ano (Apple) + US$ 25 único (Google)" },
];

export const MARKET_SOURCES = [
  { label: "Pesquisa Salarial de Programadores — Código Fonte TV", url: "https://pesquisa.codigofonte.com.br/2026" },
  { label: "Quanto custa desenvolver um sistema ou app em 2026 — nFactory", url: "https://nfactory.com.br/blog/quanto-custa-desenvolver-sistema-aplicativo-2026" },
  { label: "Quanto custa um site em 2026 — Agência MACAN", url: "https://www.agenciamacan.com.br/blog/quanto-custa-um-site" },
  { label: "Quanto custa criar um site em 2025 — Next4", url: "https://www.next4.com.br/quanto-custa-criar-um-site-em-2025/" },
  { label: "Quanto custa uma landing page — BQHost", url: "https://bqhost.com.br/lp/quanto-custa-uma-landing-page/" },
  { label: "Quanto custa desenvolver um app em 2026 — Techlise", url: "https://techlise.com.br/blog/quanto-custa-desenvolver-um-aplicativo-mobile-em-2026/" },
  { label: "Orçamento para API no Brasil em 2026 — Forja de Sistemas", url: "https://forjadesistemas.com.br/blog/custo-api-backend/" },
  { label: "Desenvolvedor freelancer: como calcular a hora — GoDaddy", url: "https://www.godaddy.com/resources/br/artigos/desenvolvedor-freelancer" },
];

export const formatBRL = (value: number, compact = false) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
