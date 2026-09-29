import type { ProjectType } from "./market-data";

/**
 * Efeito de uma resposta sobre a estimativa. Nada aqui é multiplicado em cadeia:
 * horas fixas são somadas, percentuais são somados entre si e aplicados uma vez.
 */
export interface Effect {
  /** Horas fixas adicionadas ao projeto. */
  hours?: number;
  /** Percentual sobre as horas (0.2 = +20%). */
  pct?: number;
  /** Fator de escala sobre as horas-base do tipo de projeto. */
  scope?: number;
  /** Reserva de contingência para risco de escopo (0.1 = 10%). */
  contingency?: number;
  /** Adicional de urgência sobre o preço (0.3 = +30%). */
  urgency?: number;
  /** Prazo desejado pelo cliente, em semanas. */
  deadlineWeeks?: number;
  /** Pessoas trabalhando em paralelo. */
  people?: number;
  /** Overhead de coordenação da equipe (0.1 = +10% de horas). */
  overhead?: number;
  /** Horas semanais dedicadas por pessoa. */
  weeklyHours?: number;
  /** Horas mensais de manutenção contratada. */
  maintenanceHours?: number;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  effect: Effect;
}

export type Answers = Record<string, string>;

export interface Question {
  id: string;
  question: string;
  help?: string;
  category: string;
  options: QuestionOption[];
  condition?: (answers: Answers) => boolean;
}

const isType = (answers: Answers, ...types: ProjectType[]) =>
  types.includes(answers.tipo as ProjectType);

export const QUESTIONS: Question[] = [
  {
    id: "tipo",
    question: "Que tipo de projeto você vai desenvolver?",
    category: "Projeto",
    options: [
      { value: "landing", label: "Landing page", description: "Uma página de conversão com formulário", effect: {} },
      { value: "website", label: "Site institucional", description: "5–10 páginas, sem regras de negócio", effect: {} },
      { value: "blog", label: "Blog / portal", description: "Posts, categorias, busca e comentários", effect: {} },
      { value: "ecommerce", label: "E-commerce", description: "Catálogo, carrinho, checkout e pedidos", effect: {} },
      { value: "webapp", label: "Aplicação web", description: "Login, CRUDs, dashboards e relatórios", effect: {} },
      { value: "saas", label: "SaaS / MVP", description: "Produto multi-cliente com planos e assinatura", effect: {} },
      { value: "mobile", label: "App mobile", description: "Android e/ou iOS publicado nas lojas", effect: {} },
      { value: "sistema", label: "Sistema empresarial", description: "ERP, CRM, fluxos e módulos integrados", effect: {} },
      { value: "api", label: "API / backend", description: "Serviços e integrações sem interface", effect: {} },
    ],
  },
  {
    id: "escopo",
    question: "Qual o tamanho do escopo comparado a um projeto típico desse tipo?",
    help: "Pense em número de telas, páginas ou módulos.",
    category: "Escopo",
    options: [
      { value: "micro", label: "Mínimo", description: "Versão bem enxuta, poucas telas", effect: { scope: 0.4 } },
      { value: "pequeno", label: "Pequeno", description: "Abaixo da média, só o essencial", effect: { scope: 0.7 } },
      { value: "medio", label: "Padrão", description: "O que normalmente se espera desse tipo", effect: { scope: 1 } },
      { value: "grande", label: "Grande", description: "Vários módulos e fluxos", effect: { scope: 1.8 } },
      { value: "muito_grande", label: "Muito grande", description: "Plataforma extensa, muitas regras", effect: { scope: 3 } },
    ],
  },
  {
    id: "design",
    question: "Como será o design?",
    category: "Design",
    options: [
      { value: "pronto", label: "Já vem pronto (Figma)", description: "Só implementar os layouts", effect: { pct: -0.1 } },
      { value: "template", label: "Template / UI kit", description: "Adaptar um tema existente", effect: { pct: 0 } },
      { value: "simples", label: "Simples, feito por mim", description: "Layout limpo e funcional", effect: { pct: 0.05 } },
      { value: "customizado", label: "Personalizado", description: "Identidade única criada do zero", effect: { pct: 0.2 } },
      { value: "complexo", label: "Complexo / animado", description: "Micro-interações e animações", effect: { pct: 0.4 } },
    ],
  },
  {
    id: "responsividade",
    question: "Qual nível de responsividade?",
    category: "Design",
    condition: (a) => !isType(a, "api", "mobile"),
    options: [
      { value: "desktop", label: "Só desktop", description: "Uso interno em computador", effect: { pct: -0.08 } },
      { value: "basica", label: "Responsivo padrão", description: "Celular, tablet e desktop", effect: { pct: 0 } },
      { value: "mobile_first", label: "Mobile first", description: "Prioridade total no celular", effect: { pct: 0.08 } },
      { value: "avancada", label: "Responsivo avançado + PWA", description: "Offline, instalável, otimizado", effect: { pct: 0.15 } },
    ],
  },
  {
    id: "plataforma",
    question: "Em quais plataformas o app será publicado?",
    category: "Tecnologia",
    condition: (a) => isType(a, "mobile"),
    options: [
      { value: "react_native", label: "React Native / Expo", description: "Uma base para Android e iOS", effect: { pct: 0 } },
      { value: "flutter", label: "Flutter", description: "Uma base para Android e iOS", effect: { pct: 0 } },
      { value: "android", label: "Só Android (nativo)", description: "Kotlin", effect: { pct: -0.15 } },
      { value: "ios", label: "Só iOS (nativo)", description: "Swift", effect: { pct: -0.1 } },
      { value: "ambos_nativo", label: "Android + iOS nativos", description: "Duas bases de código", effect: { pct: 0.7 } },
    ],
  },
  {
    id: "autenticacao",
    question: "O projeto precisa de login e usuários?",
    category: "Funcionalidades",
    condition: (a) => !isType(a, "landing"),
    options: [
      { value: "nao", label: "Não precisa", description: "Conteúdo público", effect: { hours: 0 } },
      { value: "simples", label: "E-mail e senha", description: "Cadastro, login, recuperar senha", effect: { hours: 16 } },
      { value: "social", label: "Login social", description: "Google, Apple, GitHub…", effect: { hours: 24 } },
      { value: "completo", label: "Perfis e permissões", description: "Papéis, convites, auditoria", effect: { hours: 48 } },
      { value: "enterprise", label: "Enterprise (SSO)", description: "SAML/OIDC, multi-tenant, LDAP", effect: { hours: 100 } },
    ],
  },
  {
    id: "complexidade",
    question: "Qual a complexidade das regras de negócio?",
    category: "Funcionalidades",
    options: [
      { value: "basico", label: "Básica", description: "Cadastros e listagens simples", effect: { pct: 0 } },
      { value: "intermediario", label: "Intermediária", description: "Filtros, relatórios, notificações", effect: { pct: 0.2 } },
      { value: "avancado", label: "Avançada", description: "Dashboards, automações, workflows", effect: { pct: 0.45 } },
      { value: "ia", label: "Com IA / LLMs", description: "RAG, agentes, classificação", effect: { pct: 0.6, hours: 40 } },
      { value: "blockchain", label: "Blockchain / Web3", description: "Smart contracts, carteiras", effect: { pct: 0.9, hours: 60 } },
    ],
  },
  {
    id: "integracao",
    question: "Quantas integrações externas?",
    help: "Gateways, CRMs, e-mail, ERPs, APIs de terceiros…",
    category: "Funcionalidades",
    options: [
      { value: "nenhuma", label: "Nenhuma", description: "Sistema isolado", effect: { hours: 0 } },
      { value: "poucas", label: "1–2 simples", description: "E-mail, analytics, formulário", effect: { hours: 10 } },
      { value: "varias", label: "3–5", description: "Pagamento, e-mail, CRM", effect: { hours: 32 } },
      { value: "muitas", label: "6 ou mais", description: "Vários serviços e webhooks", effect: { hours: 72 } },
      { value: "complexas", label: "Legado / tempo real", description: "ERP antigo, sincronização bidirecional", effect: { hours: 140 } },
    ],
  },
  {
    id: "banco",
    question: "Como os dados serão armazenados?",
    category: "Tecnologia",
    condition: (a) => !isType(a, "landing", "website", "blog"),
    options: [
      { value: "simples", label: "Sem banco / BaaS pronto", description: "JSON, planilha, Supabase/Firebase básico", effect: { hours: 0 } },
      { value: "relacional", label: "PostgreSQL / MySQL", description: "Modelagem relacional padrão", effect: { hours: 12 } },
      { value: "nosql", label: "NoSQL", description: "MongoDB, DynamoDB, Firestore", effect: { hours: 12 } },
      { value: "multiplo", label: "Múltiplos bancos + cache", description: "Redis, filas, réplicas", effect: { hours: 40 } },
      { value: "bigdata", label: "Grande volume / busca", description: "Elasticsearch, data lake, ETL", effect: { hours: 80 } },
    ],
  },
  {
    id: "cms",
    question: "Precisa de painel para editar conteúdo?",
    category: "Funcionalidades",
    condition: (a) => isType(a, "landing", "website", "blog", "ecommerce"),
    options: [
      { value: "nao", label: "Não", description: "Eu atualizo quando precisar", effect: { hours: 0 } },
      { value: "wordpress", label: "WordPress", description: "CMS consolidado", effect: { hours: 16 } },
      { value: "headless", label: "CMS headless", description: "Strapi, Sanity, Payload", effect: { hours: 28 } },
      { value: "customizado", label: "Painel sob medida", description: "Admin feito do zero", effect: { hours: 70 } },
    ],
  },
  {
    id: "pagamento",
    question: "Quais meios de pagamento?",
    category: "E-commerce",
    condition: (a) => isType(a, "ecommerce", "saas"),
    options: [
      { value: "link", label: "Link de pagamento", description: "Checkout hospedado (Stripe, MP)", effect: { hours: 8 } },
      { value: "basico", label: "Cartão + PIX", description: "Checkout transparente", effect: { hours: 24 } },
      { value: "completo", label: "Cartão + PIX + boleto", description: "Conciliação e estornos", effect: { hours: 40 } },
      { value: "recorrente", label: "Assinaturas recorrentes", description: "Planos, trial, upgrade", effect: { hours: 56 } },
      { value: "internacional", label: "Multi-moeda / split", description: "Marketplace, repasses", effect: { hours: 90 } },
    ],
  },
  {
    id: "produtos",
    question: "Qual o tamanho do catálogo?",
    category: "E-commerce",
    condition: (a) => isType(a, "ecommerce"),
    options: [
      { value: "poucos", label: "Até 50 produtos", effect: { hours: 0 } },
      { value: "medio", label: "50–500 produtos", description: "Importação em lote", effect: { hours: 8 } },
      { value: "grande", label: "500+ produtos", description: "Variações, estoque, filtros", effect: { hours: 24 } },
      { value: "marketplace", label: "Marketplace", description: "Vários vendedores", effect: { pct: 0.8 } },
      { value: "digital", label: "Produtos digitais", description: "Downloads, cursos, licenças", effect: { hours: 24 } },
    ],
  },
  {
    id: "hospedagem",
    question: "Onde vai rodar em produção?",
    category: "Infraestrutura",
    options: [
      { value: "cloud_basico", label: "Vercel / Netlify / Render", description: "Deploy automático", effect: { hours: 2 } },
      { value: "compartilhada", label: "Hospedagem compartilhada", description: "cPanel, FTP", effect: { hours: 3 } },
      { value: "vps", label: "VPS", description: "Configurar servidor, SSL, backups", effect: { hours: 10 } },
      { value: "aws_basico", label: "AWS / GCP / Azure", description: "Serviços gerenciados + CI/CD", effect: { hours: 20 } },
      { value: "kubernetes", label: "Kubernetes", description: "Containers, IaC, observabilidade", effect: { hours: 50 } },
    ],
  },
  {
    id: "performance",
    question: "Qual a exigência de performance?",
    category: "Infraestrutura",
    condition: (a) => !isType(a, "landing", "website", "blog"),
    options: [
      { value: "boa", label: "Padrão", description: "Uso normal", effect: { pct: 0 } },
      { value: "alta", label: "Alta", description: "Milhares de usuários simultâneos", effect: { pct: 0.15 } },
      { value: "real_time", label: "Tempo real", description: "WebSockets, chat, colaboração", effect: { pct: 0.3 } },
      { value: "extrema", label: "Escala massiva", description: "Milhões de usuários, filas, CDN", effect: { pct: 0.4 } },
    ],
  },
  {
    id: "seguranca",
    question: "Qual o nível de segurança/compliance?",
    category: "Infraestrutura",
    condition: (a) => isType(a, "webapp", "saas", "sistema", "ecommerce", "api", "mobile"),
    options: [
      { value: "basica", label: "Boas práticas", description: "HTTPS, OWASP básico", effect: { pct: 0 } },
      { value: "lgpd", label: "LGPD", description: "Consentimento, exportação e exclusão de dados", effect: { pct: 0.08 } },
      { value: "alta", label: "Alta", description: "2FA, criptografia, trilha de auditoria", effect: { pct: 0.2 } },
      { value: "regulada", label: "Regulada", description: "Financeiro/saúde (PCI, ISO, BACEN)", effect: { pct: 0.4 } },
    ],
  },
  {
    id: "testes",
    question: "Qual cobertura de testes automatizados?",
    category: "Qualidade",
    options: [
      { value: "nenhum", label: "Só testes manuais", effect: { pct: 0 } },
      { value: "basicos", label: "Fluxos críticos", description: "Smoke tests dos caminhos principais", effect: { pct: 0.08 } },
      { value: "unitarios", label: "Unitários + integração", description: "Boa cobertura de regras", effect: { pct: 0.18 } },
      { value: "completos", label: "Completo + E2E + CI", description: "Pipeline bloqueando regressões", effect: { pct: 0.28 } },
    ],
  },
  {
    id: "documentacao",
    question: "Que documentação será entregue?",
    category: "Qualidade",
    options: [
      { value: "minima", label: "README", effect: { pct: 0 } },
      { value: "tecnica", label: "Técnica", description: "Arquitetura, deploy, API (OpenAPI)", effect: { pct: 0.06 } },
      { value: "usuario", label: "Técnica + manual do usuário", description: "Guias e vídeos para o cliente", effect: { pct: 0.1 } },
    ],
  },
  {
    id: "tecnologia",
    question: "Você domina a stack que será usada?",
    category: "Você",
    options: [
      { value: "domino", label: "Sim, uso no dia a dia", effect: { pct: 0 } },
      { value: "definir", label: "Ainda vou escolher", description: "Tempo de pesquisa e provas de conceito", effect: { pct: 0.05 } },
      { value: "aprender", label: "Vou precisar aprender", description: "Curva de aprendizado", effect: { pct: 0.12 } },
    ],
  },
  {
    id: "experiencia",
    question: "Quantos projetos parecidos você já entregou?",
    category: "Você",
    options: [
      { value: "primeiro", label: "Será o primeiro", effect: { pct: 0.25 } },
      { value: "pouca", label: "1–2", effect: { pct: 0.12 } },
      { value: "intermediaria", label: "3–9", effect: { pct: 0 } },
      { value: "especialista", label: "10 ou mais", description: "Reaproveito código e processos", effect: { pct: -0.12 } },
    ],
  },
  {
    id: "equipe",
    question: "Quantas pessoas vão trabalhar no projeto?",
    help: "Equipes maiores entregam antes, mas há custo de coordenação.",
    category: "Execução",
    options: [
      { value: "solo", label: "Só eu", effect: { people: 1, overhead: 0 } },
      { value: "dupla", label: "Dupla", effect: { people: 2, overhead: 0.08 } },
      { value: "pequena", label: "3–4 pessoas", effect: { people: 3.5, overhead: 0.15 } },
      { value: "media", label: "5–8 pessoas", effect: { people: 6.5, overhead: 0.22 } },
    ],
  },
  {
    id: "dedicacao",
    question: "Quantas horas por semana cada pessoa dedica?",
    category: "Execução",
    options: [
      { value: "part_time", label: "~20h/semana", description: "Em paralelo a outro trabalho", effect: { weeklyHours: 20 } },
      { value: "meio_periodo", label: "~30h/semana", effect: { weeklyHours: 30 } },
      { value: "full_time", label: "~40h/semana", description: "Dedicação integral", effect: { weeklyHours: 40 } },
    ],
  },
  {
    id: "prazo",
    question: "Qual o prazo que o cliente espera?",
    category: "Prazo",
    options: [
      { value: "urgentissimo", label: "1–2 semanas", description: "Urgência extrema", effect: { urgency: 0.5, deadlineWeeks: 2 } },
      { value: "urgente", label: "3–4 semanas", description: "Prazo apertado", effect: { urgency: 0.3, deadlineWeeks: 4 } },
      { value: "rapido", label: "1–2 meses", effect: { urgency: 0.1, deadlineWeeks: 8 } },
      { value: "normal", label: "3–4 meses", effect: { urgency: 0, deadlineWeeks: 16 } },
      { value: "flexivel", label: "Sem pressa", description: "Qualidade acima do prazo", effect: { urgency: 0, deadlineWeeks: 52 } },
    ],
  },
  {
    id: "flexibilidade_escopo",
    question: "Quão definido está o escopo?",
    help: "Define a reserva de contingência embutida no preço.",
    category: "Risco",
    options: [
      { value: "fixo", label: "Fechado e documentado", effect: { contingency: 0.05 } },
      { value: "pequenas", label: "Pequenos ajustes esperados", effect: { contingency: 0.1 } },
      { value: "moderadas", label: "Cliente ainda decidindo detalhes", effect: { contingency: 0.2 } },
      { value: "indefinido", label: "Muito indefinido", description: "Considere cobrar por hora/sprint", effect: { contingency: 0.35 } },
    ],
  },
  {
    id: "manutencao",
    question: "Vai oferecer manutenção depois da entrega?",
    help: "Calculada à parte como mensalidade.",
    category: "Pós-entrega",
    options: [
      { value: "nao", label: "Não", effect: {} },
      { value: "garantia", label: "Garantia de 90 dias", description: "Correção de bugs inclusa", effect: { pct: 0.03 } },
      { value: "basica", label: "Mensal — 8h/mês", description: "Atualizações e pequenos ajustes", effect: { maintenanceHours: 8 } },
      { value: "completa", label: "Mensal — 20h/mês", description: "Suporte e melhorias contínuas", effect: { maintenanceHours: 20 } },
    ],
  },
];

export const getApplicableQuestions = (answers: Answers) =>
  QUESTIONS.filter((q) => !q.condition || q.condition(answers));

export const findOption = (questionId: string, value: string | undefined) =>
  QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.value === value);

/** Descreve o impacto de uma opção em texto curto (ex.: "+16h", "+20%"). */
export function describeEffect(effect: Effect): string | null {
  const parts: string[] = [];
  if (effect.hours) parts.push(`+${effect.hours}h`);
  if (effect.pct) parts.push(`${effect.pct > 0 ? "+" : ""}${Math.round(effect.pct * 100)}% horas`);
  if (effect.scope && effect.scope !== 1) parts.push(`${effect.scope}× escopo`);
  if (effect.urgency) parts.push(`+${Math.round(effect.urgency * 100)}% urgência`);
  if (effect.contingency) parts.push(`${Math.round(effect.contingency * 100)}% reserva`);
  if (effect.overhead) parts.push(`+${Math.round(effect.overhead * 100)}% coordenação`);
  if (effect.maintenanceHours) parts.push(`${effect.maintenanceHours}h/mês`);
  return parts.length ? parts.join(" · ") : null;
}
