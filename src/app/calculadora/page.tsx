'use client';
import React, { useState, useEffect } from "react";
import { 
  FaRocket, FaCode, FaUsers, FaClock, FaDatabase, FaMobile, FaDesktop, 
  FaCloud, FaServer, FaShieldAlt, FaCog, FaGraduationCap, FaMoneyBillWave, 
  FaChartLine, FaGlobe, FaNewspaper, FaLaptopCode, FaShoppingCart, 
  FaBuilding, FaPlug, FaHourglassHalf, FaCalendarAlt, FaCalendarWeek,
  FaCalendarDay, FaPaintBrush, FaFileImage, FaTabletAlt, FaLock,
  FaUserShield, FaKey, FaNetworkWired, FaLink, FaBrain, FaRobot,
  FaCoins, FaCreditCard, FaBox, FaStore, FaDownload, FaFileAlt,
  FaBug, FaFlask, FaTools, FaMapMarkerAlt, FaUserTie, FaUserFriends
} from "react-icons/fa";

interface QuestionOption {
  value: string;
  label: string;
  multiplier: number;
  description?: string;
  icon?: React.ReactElement;
}

// Função para obter ícone baseado no tipo de opção
const getOptionIcon = (questionId: string, optionValue: string): React.ReactElement => {
  const iconMap: Record<string, Record<string, React.ReactElement>> = {
    tipo: {
      landing: <FaGlobe className="text-[#8be9fd]" />,
      website: <FaDesktop className="text-[#bd93f9]" />,
      blog: <FaNewspaper className="text-[#f1fa8c]" />,
      webapp: <FaLaptopCode className="text-[#50fa7b]" />,
      mobile: <FaMobile className="text-[#ff79c6]" />,
      ecommerce: <FaShoppingCart className="text-[#ffb86c]" />,
      sistema: <FaBuilding className="text-[#ff5555]" />,
      api: <FaPlug className="text-[#6272a4]" />
    },
    escopo: {
      micro: <FaHourglassHalf className="text-[#8be9fd]" />,
      pequeno: <FaCalendarDay className="text-[#50fa7b]" />,
      medio: <FaCalendarWeek className="text-[#f1fa8c]" />,
      grande: <FaCalendarAlt className="text-[#ffb86c]" />,
      muito_grande: <FaRocket className="text-[#ff79c6]" />
    },
    design: {
      pronto: <FaFileImage className="text-[#50fa7b]" />,
      template: <FaPaintBrush className="text-[#8be9fd]" />,
      simples: <FaDesktop className="text-[#f1fa8c]" />,
      customizado: <FaCode className="text-[#bd93f9]" />,
      complexo: <FaRocket className="text-[#ff79c6]" />
    },
    responsividade: {
      desktop: <FaDesktop className="text-[#6272a4]" />,
      basica: <FaTabletAlt className="text-[#8be9fd]" />,
      avancada: <FaMobile className="text-[#50fa7b]" />,
      mobile_first: <FaMobile className="text-[#ff79c6]" />
    },
    autenticacao: {
      nao: <FaLock className="text-[#6272a4]" />,
      simples: <FaKey className="text-[#8be9fd]" />,
      social: <FaUserFriends className="text-[#bd93f9]" />,
      completo: <FaUserShield className="text-[#50fa7b]" />,
      enterprise: <FaShieldAlt className="text-[#ff79c6]" />
    },
    integracao: {
      nenhuma: <FaCode className="text-[#6272a4]" />,
      poucas: <FaLink className="text-[#8be9fd]" />,
      varias: <FaNetworkWired className="text-[#f1fa8c]" />,
      muitas: <FaPlug className="text-[#ffb86c]" />,
      complexas: <FaRocket className="text-[#ff79c6]" />
    },
    complexidade: {
      basico: <FaCode className="text-[#8be9fd]" />,
      intermediario: <FaChartLine className="text-[#50fa7b]" />,
      avancado: <FaRocket className="text-[#f1fa8c]" />,
      ia: <FaBrain className="text-[#bd93f9]" />,
      blockchain: <FaCoins className="text-[#ff79c6]" />
    },
    banco: {
      simples: <FaFileAlt className="text-[#6272a4]" />,
      sqlite: <FaDatabase className="text-[#8be9fd]" />,
      mysql: <FaServer className="text-[#50fa7b]" />,
      nosql: <FaCloud className="text-[#f1fa8c]" />,
      multiplo: <FaNetworkWired className="text-[#ffb86c]" />,
      bigdata: <FaRocket className="text-[#ff79c6]" />
    },
    pagamento: {
      basico: <FaCreditCard className="text-[#8be9fd]" />,
      completo: <FaMoneyBillWave className="text-[#50fa7b]" />,
      digital: <FaMobile className="text-[#bd93f9]" />,
      internacional: <FaGlobe className="text-[#f1fa8c]" />,
      crypto: <FaCoins className="text-[#ff79c6]" />
    },
    produtos: {
      poucos: <FaBox className="text-[#8be9fd]" />,
      medio: <FaStore className="text-[#50fa7b]" />,
      grande: <FaBuilding className="text-[#f1fa8c]" />,
      marketplace: <FaRocket className="text-[#ffb86c]" />,
      digital: <FaDownload className="text-[#bd93f9]" />
    },
    equipe: {
      solo: <FaUserTie className="text-[#8be9fd]" />,
      dupla: <FaUsers className="text-[#50fa7b]" />,
      pequena: <FaUserFriends className="text-[#f1fa8c]" />,
      media: <FaBuilding className="text-[#ffb86c]" />,
      grande: <FaRocket className="text-[#ff79c6]" />
    },
    regiao: {
      interior: <FaMapMarkerAlt className="text-[#8be9fd]" />,
      capital: <FaBuilding className="text-[#50fa7b]" />,
      sp_rj: <FaRocket className="text-[#ff79c6]" />,
      sul: <FaMapMarkerAlt className="text-[#bd93f9]" />,
      remoto: <FaGlobe className="text-[#f1fa8c]" />
    }
  };

  return iconMap[questionId]?.[optionValue] || <FaCode className="text-[#6272a4]" />;
};

interface Question {
  id: string;
  question: string;
  icon: React.ReactElement;
  options: QuestionOption[];
  condition?: (answers: Record<string, any>) => boolean;
  category: string;
}

const QUESTIONS: Question[] = [
  // Básicas - Sempre aparecem
  {
    id: "tipo",
    question: "Que tipo de projeto você quer desenvolver?",
    icon: <FaCode className="text-[#bd93f9]" />,
    category: "Projeto",
    options: [
      { value: "landing", label: "Landing Page Simples", multiplier: 0.3, description: "Uma página com formulário de contato" },
      { value: "website", label: "Website Institucional", multiplier: 0.6, description: "5-10 páginas, sem funcionalidades complexas" },
      { value: "blog", label: "Blog/Portal de Conteúdo", multiplier: 0.8, description: "Sistema de posts, categorias, comentários" },
      { value: "webapp", label: "Aplicação Web", multiplier: 1.5, description: "Sistema com login, CRUD, dashboards" },
      { value: "mobile", label: "App Mobile", multiplier: 2.2, description: "Aplicativo nativo ou híbrido" },
      { value: "ecommerce", label: "E-commerce", multiplier: 2.8, description: "Loja virtual com pagamentos" },
      { value: "sistema", label: "Sistema Empresarial", multiplier: 4.5, description: "ERP, CRM, automação complexa" },
      { value: "api", label: "API/Backend", multiplier: 1.2, description: "Serviços e APIs para integração" }
    ]
  },

  {
    id: "escopo",
    question: "Qual o tamanho aproximado do projeto?",
    icon: <FaChartLine className="text-[#50fa7b]" />,
    category: "Escopo",
    options: [
      { value: "micro", label: "Micro (1-3 dias)", multiplier: 0.2, description: "Projeto muito pequeno, ajustes simples" },
      { value: "pequeno", label: "Pequeno (1-2 semanas)", multiplier: 0.5, description: "Funcionalidades básicas" },
      { value: "medio", label: "Médio (1-2 meses)", multiplier: 1, description: "Projeto com várias funcionalidades" },
      { value: "grande", label: "Grande (3-6 meses)", multiplier: 2, description: "Sistema complexo, múltiplos módulos" },
      { value: "muito_grande", label: "Muito Grande (6+ meses)", multiplier: 4, description: "Projeto de grande escala" }
    ]
  },

  {
    id: "design",
    question: "Como será o design do projeto?",
    icon: <FaDesktop className="text-[#ff79c6]" />,
    category: "Design",
    options: [
      { value: "pronto", label: "Design já pronto (Figma/PSD)", multiplier: 0.7, description: "Layouts completos fornecidos" },
      { value: "template", label: "Adaptar template existente", multiplier: 0.8, description: "Customizar template pronto" },
      { value: "simples", label: "Design simples/básico", multiplier: 1, description: "Layout clean e funcional" },
      { value: "customizado", label: "Design customizado", multiplier: 1.4, description: "Design único criado do zero" },
      { value: "complexo", label: "Design complexo/animado", multiplier: 1.8, description: "Animações, interações avançadas" }
    ]
  },

  {
    id: "responsividade",
    question: "Qual nível de responsividade é necessário?",
    icon: <FaMobile className="text-[#8be9fd]" />,
    category: "Design",
    condition: (answers) => answers.tipo?.value !== "api",
    options: [
      { value: "desktop", label: "Apenas Desktop", multiplier: 0.8, description: "Otimizado só para desktop" },
      { value: "basica", label: "Responsivo Básico", multiplier: 1, description: "Mobile, tablet e desktop" },
      { value: "avancada", label: "Responsivo Avançado", multiplier: 1.3, description: "Otimizado para todos os dispositivos" },
      { value: "mobile_first", label: "Mobile First", multiplier: 1.2, description: "Prioridade para dispositivos móveis" }
    ]
  },
  // Funcionalidades específicas
  {
    id: "autenticacao",
    question: "O projeto precisa de sistema de login/usuários?",
    icon: <FaShieldAlt className="text-[#f1fa8c]" />,
    category: "Funcionalidades",
    condition: (answers) => answers.tipo?.value !== "landing" && answers.tipo?.value !== "api",
    options: [
      { value: "nao", label: "Não precisa", multiplier: 0.8, description: "Site estático ou sem autenticação" },
      { value: "simples", label: "Login simples", multiplier: 1.1, description: "Email/senha básico" },
      { value: "social", label: "Login social (Google, Facebook)", multiplier: 1.3, description: "Integração com redes sociais" },
      { value: "completo", label: "Sistema completo de usuários", multiplier: 1.6, description: "Perfis, permissões, recuperação de senha" },
      { value: "enterprise", label: "Autenticação enterprise", multiplier: 2.2, description: "SSO, LDAP, múltiplos níveis" }
    ]
  },

  {
    id: "integracao",
    question: "Quantas integrações externas são necessárias?",
    icon: <FaCog className="text-[#ffb86c]" />,
    category: "Funcionalidades",
    options: [
      { value: "nenhuma", label: "Nenhuma integração", multiplier: 0.7, description: "Sistema isolado" },
      { value: "poucas", label: "1-2 integrações simples", multiplier: 1, description: "APIs básicas" },
      { value: "varias", label: "3-5 integrações", multiplier: 1.4, description: "Pagamento, email, redes sociais" },
      { value: "muitas", label: "6+ integrações", multiplier: 2, description: "ERPs, CRMs, múltiplas APIs" },
      { value: "complexas", label: "Integrações complexas", multiplier: 2.8, description: "Sincronização em tempo real" }
    ]
  },

  {
    id: "complexidade",
    question: "Qual a complexidade das funcionalidades?",
    icon: <FaRocket className="text-[#50fa7b]" />,
    category: "Técnico",
    options: [
      { value: "basico", label: "Básico (CRUD simples)", multiplier: 0.8, description: "Operações básicas de dados" },
      { value: "intermediario", label: "Intermediário", multiplier: 1.2, description: "Relatórios, filtros, busca" },
      { value: "avancado", label: "Avançado", multiplier: 1.8, description: "Dashboards, analytics, automação" },
      { value: "ia", label: "Com IA/Machine Learning", multiplier: 2.5, description: "Algoritmos de ML, IA generativa" },
      { value: "blockchain", label: "Blockchain/Web3", multiplier: 3.2, description: "Smart contracts, DeFi" }
    ]
  },

  // Banco de dados - Condicionais
  {
    id: "banco",
    question: "Que tipo de banco de dados será usado?",
    icon: <FaDatabase className="text-[#8be9fd]" />,
    category: "Técnico",
    condition: (answers) => answers.tipo?.value !== "landing",
    options: [
      { value: "simples", label: "Arquivo local/JSON", multiplier: 0.5, description: "Dados simples, sem banco" },
      { value: "sqlite", label: "SQLite", multiplier: 0.7, description: "Banco leve e simples" },
      { value: "mysql", label: "MySQL/PostgreSQL", multiplier: 1, description: "Banco relacional tradicional" },
      { value: "nosql", label: "NoSQL (MongoDB, Firebase)", multiplier: 1.2, description: "Banco não-relacional" },
      { value: "multiplo", label: "Múltiplos bancos", multiplier: 1.8, description: "Arquitetura de dados complexa" },
      { value: "bigdata", label: "Big Data (Redis, Elasticsearch)", multiplier: 2.5, description: "Grandes volumes de dados" }
    ]
  },

  // Experiência e conhecimento
  {
    id: "tecnologia_definida",
    question: "Já tem as tecnologias do projeto definidas?",
    icon: <FaGraduationCap className="text-[#f1fa8c]" />,
    category: "Planejamento",
    options: [
      { value: "sim_conheco", label: "Sim, e eu domino", multiplier: 0.8, description: "Tecnologias que você já usa" },
      { value: "sim_nao_conheco", label: "Sim, mas preciso aprender", multiplier: 1.5, description: "Tecnologias novas para você" },
      { value: "nao", label: "Não, preciso definir", multiplier: 1.1, description: "Escolher a melhor tecnologia" },
      { value: "cliente_exige", label: "Cliente exige tecnologia específica", multiplier: 1.3, description: "Tecnologia imposta pelo cliente" }
    ]
  },

  {
    id: "experiencia_tipo",
    question: "Qual sua experiência com este tipo de projeto?",
    icon: <FaGraduationCap className="text-[#bd93f9]" />,
    category: "Experiência",
    options: [
      { value: "primeiro", label: "Primeiro projeto do tipo", multiplier: 1.8, description: "Nunca fiz algo similar" },
      { value: "pouca", label: "Pouca experiência", multiplier: 1.4, description: "1-2 projetos similares" },
      { value: "intermediaria", label: "Experiência intermediária", multiplier: 1.1, description: "3-5 projetos similares" },
      { value: "experiente", label: "Muito experiente", multiplier: 0.9, description: "Mais de 10 projetos similares" },
      { value: "especialista", label: "Especialista", multiplier: 0.7, description: "Expert neste tipo de projeto" }
    ]
  },

  // Equipe e Recursos
  {
    id: "equipe",
    question: "Quantas pessoas trabalharão no projeto?",
    icon: <FaUsers className="text-[#ffb86c]" />,
    category: "Recursos",
    options: [
      { value: "solo", label: "Só eu (freelancer)", multiplier: 1, description: "Trabalho individual" },
      { value: "dupla", label: "Dupla (2 pessoas)", multiplier: 0.85, description: "Colaboração em dupla" },
      { value: "pequena", label: "Equipe pequena (3-4)", multiplier: 0.75, description: "Time pequeno" },
      { value: "media", label: "Equipe média (5-8)", multiplier: 0.65, description: "Time estruturado" },
      { value: "grande", label: "Equipe grande (9+)", multiplier: 0.55, description: "Time grande/empresa" }
    ]
  },

  {
    id: "dedicacao",
    question: "Qual sua dedicação ao projeto?",
    icon: <FaClock className="text-[#ff79c6]" />,
    category: "Recursos",
    options: [
      { value: "part_time", label: "Part-time (20h/semana)", multiplier: 1.3, description: "Trabalho paralelo a outros projetos" },
      { value: "meio_periodo", label: "Meio período (25h/semana)", multiplier: 1.1, description: "Dedicação parcial" },
      { value: "full_time", label: "Full-time (40h/semana)", multiplier: 1, description: "Dedicação integral" },
      { value: "intensivo", label: "Intensivo (50h+/semana)", multiplier: 1.2, description: "Ritmo acelerado para prazo apertado" }
    ]
  },

  // Prazo e Urgência
  {
    id: "prazo",
    question: "Qual o prazo para entrega?",
    icon: <FaClock className="text-[#ff79c6]" />,
    category: "Prazo",
    options: [
      { value: "urgentissimo", label: "Urgentíssimo (1 semana)", multiplier: 2.5, description: "Rush extremo, trabalho 24/7" },
      { value: "urgente", label: "Muito urgente (2-3 semanas)", multiplier: 1.8, description: "Prazo apertado, stress alto" },
      { value: "rapido", label: "Rápido (1-2 meses)", multiplier: 1.3, description: "Ritmo acelerado" },
      { value: "normal", label: "Normal (3-4 meses)", multiplier: 1, description: "Desenvolvimento saudável" },
      { value: "flexivel", label: "Flexível (5+ meses)", multiplier: 0.85, description: "Sem pressa, qualidade primeiro" }
    ]
  },

  {
    id: "flexibilidade_escopo",
    question: "O escopo pode mudar durante o projeto?",
    icon: <FaCog className="text-[#8be9fd]" />,
    category: "Prazo",
    options: [
      { value: "fixo", label: "Escopo fixo e bem definido", multiplier: 0.9, description: "Sem mudanças esperadas" },
      { value: "pequenas", label: "Pequenos ajustes esperados", multiplier: 1, description: "Mudanças menores" },
      { value: "moderadas", label: "Mudanças moderadas", multiplier: 1.2, description: "Cliente ainda decidindo detalhes" },
      { value: "grandes", label: "Grandes mudanças possíveis", multiplier: 1.5, description: "Cliente indeciso, muito iterativo" },
      { value: "indefinido", label: "Escopo muito indefinido", multiplier: 1.8, description: "Cliente não sabe o que quer" }
    ]
  },
  // Tecnologia específica
  {
    id: "plataforma",
    question: "Em quais plataformas o app será disponibilizado?",
    icon: <FaMobile className="text-[#ff79c6]" />,
    category: "Tecnologia",
    condition: (answers) => answers.tipo?.value === "mobile",
    options: [
      { value: "android", label: "Apenas Android", multiplier: 0.8, description: "Uma plataforma, Java/Kotlin" },
      { value: "ios", label: "Apenas iOS", multiplier: 1, description: "Swift/Objective-C" },
      { value: "ambos_nativo", label: "Android + iOS (Nativo)", multiplier: 1.8, description: "Duas bases de código" },
      { value: "react_native", label: "React Native", multiplier: 1.2, description: "Multiplataforma com RN" },
      { value: "flutter", label: "Flutter", multiplier: 1.1, description: "Multiplataforma com Flutter" },
      { value: "hibrido", label: "App Híbrido (Ionic)", multiplier: 0.9, description: "WebView + tecnologias web" }
    ]
  },

  {
    id: "cms",
    question: "Precisa de CMS (painel administrativo)?",
    icon: <FaCog className="text-[#ffb86c]" />,
    category: "Funcionalidades",
    condition: (answers) => answers.tipo?.value === "website" || answers.tipo?.value === "blog" || answers.tipo?.value === "ecommerce",
    options: [
      { value: "nao", label: "Não precisa", multiplier: 0.8, description: "Conteúdo estático" },
      { value: "simples", label: "CMS simples", multiplier: 1.2, description: "Edição básica de conteúdo" },
      { value: "wordpress", label: "WordPress customizado", multiplier: 1, description: "CMS consolidado" },
      { value: "headless", label: "CMS Headless", multiplier: 1.4, description: "Strapi, Contentful" },
      { value: "customizado", label: "CMS totalmente customizado", multiplier: 1.8, description: "Painel feito do zero" }
    ]
  },

  // Infraestrutura
  {
    id: "hospedagem",
    question: "Onde o projeto será hospedado?",
    icon: <FaCloud className="text-[#8be9fd]" />,
    category: "Infraestrutura",
    condition: (answers) => answers.tipo?.value !== "mobile",
    options: [
      { value: "compartilhada", label: "Hospedagem compartilhada", multiplier: 0.7, description: "Básica, limitações" },
      { value: "vps", label: "VPS básico", multiplier: 0.9, description: "Servidor virtual simples" },
      { value: "cloud_basico", label: "Cloud básico (Vercel, Netlify)", multiplier: 1, description: "Deploy automático" },
      { value: "aws_basico", label: "AWS/Azure básico", multiplier: 1.2, description: "Cloud profissional" },
      { value: "kubernetes", label: "Kubernetes/Docker", multiplier: 1.8, description: "Infraestrutura avançada" },
      { value: "multicloud", label: "Multi-cloud/Enterprise", multiplier: 2.5, description: "Infraestrutura complexa" }
    ]
  },

  {
    id: "performance",
    question: "Qual o nível de performance necessário?",
    icon: <FaRocket className="text-[#50fa7b]" />,
    category: "Infraestrutura",
    options: [
      { value: "basica", label: "Performance básica", multiplier: 0.9, description: "Uso interno, poucos usuários" },
      { value: "boa", label: "Boa performance", multiplier: 1, description: "Site público padrão" },
      { value: "alta", label: "Alta performance", multiplier: 1.3, description: "Muitos acessos simultâneos" },
      { value: "extrema", label: "Performance extrema", multiplier: 1.8, description: "Milhões de usuários, CDN" },
      { value: "real_time", label: "Tempo real", multiplier: 2.2, description: "WebSockets, updates instantâneos" }
    ]
  },

  {
    id: "seguranca",
    question: "Qual o nível de segurança necessário?",
    icon: <FaShieldAlt className="text-[#50fa7b]" />,
    category: "Infraestrutura",
    condition: (answers) => answers.tipo?.value === "webapp" || answers.tipo?.value === "sistema" || answers.tipo?.value === "ecommerce" || answers.tipo?.value === "api",
    options: [
      { value: "basica", label: "Segurança básica", multiplier: 1, description: "HTTPS, autenticação simples" },
      { value: "media", label: "Segurança média", multiplier: 1.3, description: "2FA, criptografia, logs" },
      { value: "alta", label: "Segurança alta", multiplier: 1.8, description: "Compliance, auditoria" },
      { value: "bancaria", label: "Nível bancário", multiplier: 2.5, description: "PCI DSS, máxima segurança" },
      { value: "governamental", label: "Nível governamental", multiplier: 3, description: "Normas rígidas, certificações" }
    ]
  },

  // E-commerce específico
  {
    id: "pagamento",
    question: "Quais métodos de pagamento serão integrados?",
    icon: <FaMoneyBillWave className="text-[#f1fa8c]" />,
    category: "E-commerce",
    condition: (answers) => answers.tipo?.value === "ecommerce",
    options: [
      { value: "basico", label: "Cartão + PIX", multiplier: 1, description: "Pagamentos essenciais" },
      { value: "completo", label: "Cartão + PIX + Boleto", multiplier: 1.3, description: "Métodos tradicionais" },
      { value: "digital", label: "+ Carteiras digitais", multiplier: 1.6, description: "PayPal, Apple Pay, Google Pay" },
      { value: "internacional", label: "Pagamentos internacionais", multiplier: 2, description: "Stripe, PayPal global" },
      { value: "crypto", label: "Inclui criptomoedas", multiplier: 2.5, description: "Bitcoin, Ethereum" }
    ]
  },

  {
    id: "produtos",
    question: "Quantos produtos/categorias aproximadamente?",
    icon: <FaCode className="text-[#bd93f9]" />,
    category: "E-commerce",
    condition: (answers) => answers.tipo?.value === "ecommerce",
    options: [
      { value: "poucos", label: "Até 50 produtos", multiplier: 0.8, description: "Catálogo pequeno" },
      { value: "medio", label: "50-500 produtos", multiplier: 1, description: "Loja média" },
      { value: "grande", label: "500-5000 produtos", multiplier: 1.4, description: "Catálogo extenso" },
      { value: "marketplace", label: "5000+ produtos", multiplier: 2, description: "Marketplace/grande loja" },
      { value: "digital", label: "Produtos digitais", multiplier: 1.2, description: "Downloads, assinaturas" }
    ]
  },

  // Manutenção e pós-entrega
  {
    id: "documentacao",
    question: "Qual nível de documentação é necessário?",
    icon: <FaCode className="text-[#8be9fd]" />,
    category: "Entrega",
    options: [
      { value: "minima", label: "Documentação mínima", multiplier: 0.9, description: "README básico" },
      { value: "basica", label: "Documentação básica", multiplier: 1, description: "Como usar e instalar" },
      { value: "completa", label: "Documentação completa", multiplier: 1.2, description: "Manual técnico detalhado" },
      { value: "tecnica", label: "Documentação técnica avançada", multiplier: 1.4, description: "Arquitetura, APIs, deploy" },
      { value: "usuario", label: "Manual do usuário incluído", multiplier: 1.3, description: "Documentação para cliente final" }
    ]
  },

  {
    id: "testes",
    question: "Qual cobertura de testes é necessária?",
    icon: <FaShieldAlt className="text-[#50fa7b]" />,
    category: "Qualidade",
    options: [
      { value: "nenhum", label: "Sem testes automatizados", multiplier: 0.8, description: "Só testes manuais" },
      { value: "basicos", label: "Testes básicos", multiplier: 1, description: "Principais funcionalidades" },
      { value: "unitarios", label: "Testes unitários", multiplier: 1.2, description: "Cobertura de código" },
      { value: "completos", label: "Testes completos", multiplier: 1.5, description: "Unit + Integration + E2E" },
      { value: "tdd", label: "TDD/BDD completo", multiplier: 1.8, description: "Desenvolvimento orientado a testes" }
    ]
  },

  {
    id: "manutencao",
    question: "Você fará a manutenção do projeto?",
    icon: <FaCog className="text-[#ffb86c]" />,
    category: "Manutenção",
    options: [
      { value: "nao", label: "Não, só desenvolvimento", multiplier: 1, description: "Entrega e encerramento" },
      { value: "garantia", label: "Garantia de 30-90 dias", multiplier: 1.1, description: "Correções de bugs" },
      { value: "basica", label: "Manutenção básica (6 meses)", multiplier: 1.3, description: "Updates e suporte" },
      { value: "completa", label: "Manutenção completa (1 ano)", multiplier: 1.6, description: "Suporte e melhorias" },
      { value: "permanente", label: "Parceria permanente", multiplier: 2, description: "Evolução contínua" }
    ]
  },

  // Localização/região
  {
    id: "regiao",
    question: "Em qual região você está localizado?",
    icon: <FaCode className="text-[#f1fa8c]" />,
    category: "Mercado",
    options: [
      { value: "interior", label: "Interior/Cidades menores", multiplier: 0.7, description: "Custo de vida menor" },
      { value: "capital", label: "Capitais/Região metropolitana", multiplier: 1, description: "Mercado padrão" },
      { value: "sp_rj", label: "São Paulo/Rio de Janeiro", multiplier: 1.3, description: "Mercado premium" },
      { value: "sul", label: "Região Sul (tech hubs)", multiplier: 1.2, description: "Vale dos Sinos, etc" },
      { value: "remoto", label: "Trabalho 100% remoto", multiplier: 1.1, description: "Cliente pode ser de qualquer lugar" }
    ]
  }
];

export default function CalculadoraPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [estimate, setEstimate] = useState<{min: number, max: number} | null>(null);
  const [estimateDetails, setEstimateDetails] = useState<{
    breakdown: string[];
    hosting: string;
    maintenance: string;
    extras: string[];
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [marketValidation, setMarketValidation] = useState<string>('');
  const [applicableQuestions, setApplicableQuestions] = useState<Question[]>([]);

  // Calcular quais perguntas são aplicáveis baseadas nas respostas atuais
  useEffect(() => {
    const applicable = QUESTIONS.filter(question => 
      !question.condition || question.condition(answers)
    );
    setApplicableQuestions(applicable);
  }, [answers]);

  const handleAnswer = (answer: QuestionOption) => {
    const currentQuestion = applicableQuestions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Recalcular perguntas aplicáveis após a resposta
    const newApplicable = QUESTIONS.filter(question => 
      !question.condition || question.condition(newAnswers)
    );

    if (currentQuestionIndex < newApplicable.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateEstimate(newAnswers);
    }
  };

  const calculateEstimate = async (finalAnswers: Record<string, any>) => {
    setIsCalculating(true);
    
    try {
      // Usar API do servidor para proteger a chave
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalAnswers)
      });

      if (!response.ok) {
        throw new Error('Erro na API');
      }

      const result = await response.json();
      
      // Criar intervalo baseado na estimativa da IA
      const baseEstimate = result.estimate;
      const minEstimate = Math.round(baseEstimate * 0.8); // -20%
      const maxEstimate = Math.round(baseEstimate * 1.3); // +30%
      
      setEstimate({ min: minEstimate, max: maxEstimate });
      setAiReasoning(result.reasoning);
      setAiSuggestions(result.suggestions);
      setMarketValidation(result.marketValidation);

      // Adicionar detalhes da estimativa
      setEstimateDetails({
        breakdown: [
          `Desenvolvimento: R$ ${Math.round(baseEstimate * 0.7).toLocaleString('pt-BR')} - R$ ${Math.round(baseEstimate * 0.9).toLocaleString('pt-BR')}`,
          `Testes e QA: R$ ${Math.round(baseEstimate * 0.1).toLocaleString('pt-BR')} - R$ ${Math.round(baseEstimate * 0.15).toLocaleString('pt-BR')}`,
          `Deploy e configuração: R$ ${Math.round(baseEstimate * 0.05).toLocaleString('pt-BR')} - R$ ${Math.round(baseEstimate * 0.1).toLocaleString('pt-BR')}`
        ],
        hosting: `R$ 30 - R$ 300/mês (dependendo do tráfego e recursos)`,
        maintenance: `R$ ${Math.round(baseEstimate * 0.1).toLocaleString('pt-BR')} - R$ ${Math.round(baseEstimate * 0.2).toLocaleString('pt-BR')}/ano`,
        extras: [
          'Domínio: R$ 40 - R$ 120/ano',
          'SSL: R$ 0 - R$ 500/ano (Let\'s Encrypt gratuito)',
          'Backup: R$ 20 - R$ 100/mês',
          'CDN: R$ 50 - R$ 200/mês',
          'Monitoramento: R$ 0 - R$ 150/mês'
        ]
      });
      
      // Salvar no histórico local
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        answers: finalAnswers,
        estimate: { min: minEstimate, max: maxEstimate, base: baseEstimate },
        reasoning: result.reasoning,
        suggestions: result.suggestions,
        marketValidation: result.marketValidation
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('devlator-history') || '[]');
      localStorage.setItem('devlator-history', JSON.stringify([historyItem, ...existingHistory]));

      // Salvar contexto para o chat
      const chatContext = {
        projectData: finalAnswers,
        estimate: baseEstimate,
        reasoning: result.reasoning,
        marketValidation: result.marketValidation,
        suggestions: result.suggestions
      };
      localStorage.setItem('devlator-chat-context', JSON.stringify(chatContext));
      
    } catch (error) {
      console.error('Erro ao calcular estimativa:', error);
      // Fallback calculation mais sofisticado
      const baseValue = 2500; // Valor base aumentado
      let finalMultiplier = 1;
      
      Object.values(finalAnswers).forEach((answer: QuestionOption) => {
        finalMultiplier *= answer.multiplier;
      });
      
      const fallbackEstimate = Math.round(baseValue * finalMultiplier);
      const minEstimate = Math.round(fallbackEstimate * 0.8);
      const maxEstimate = Math.round(fallbackEstimate * 1.3);
      
      setEstimate({ min: minEstimate, max: maxEstimate });
      
      setEstimateDetails({
        breakdown: [
          `Desenvolvimento: R$ ${Math.round(fallbackEstimate * 0.7).toLocaleString('pt-BR')} - R$ ${Math.round(fallbackEstimate * 0.9).toLocaleString('pt-BR')}`,
          `Testes e QA: R$ ${Math.round(fallbackEstimate * 0.1).toLocaleString('pt-BR')} - R$ ${Math.round(fallbackEstimate * 0.15).toLocaleString('pt-BR')}`,
          `Deploy e configuração: R$ ${Math.round(fallbackEstimate * 0.05).toLocaleString('pt-BR')} - R$ ${Math.round(fallbackEstimate * 0.1).toLocaleString('pt-BR')}`
        ],
        hosting: `R$ 30 - R$ 300/mês (dependendo do tráfego e recursos)`,
        maintenance: `R$ ${Math.round(fallbackEstimate * 0.1).toLocaleString('pt-BR')} - R$ ${Math.round(fallbackEstimate * 0.2).toLocaleString('pt-BR')}/ano`,
        extras: [
          'Domínio: R$ 40 - R$ 120/ano',
          'SSL: R$ 0 - R$ 500/ano (Let\'s Encrypt gratuito)',
          'Backup: R$ 20 - R$ 100/mês',
          'CDN: R$ 50 - R$ 200/mês',
          'Monitoramento: R$ 0 - R$ 150/mês'
        ]
      });
      
      setAiReasoning('Estimativa calculada com base em parâmetros técnicos e experiência de mercado. Valores podem variar conforme região e especialização.');
      setMarketValidation('Valor alinhado com práticas do mercado brasileiro. Projetos similares variam entre 70% a 130% dependendo da complexidade e região.');
      setAiSuggestions([
        'Defina bem o escopo antes de começar o desenvolvimento',
        'Use metodologias ágeis para melhor controle do projeto',
        'Considere custos de hospedagem e manutenção no orçamento',
        'Mantenha documentação atualizada durante o desenvolvimento',
        'Planeje testes desde o início do projeto'
      ]);
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEstimate(null);
    setIsCalculating(false);
    setAiReasoning('');
    setAiSuggestions([]);
    setMarketValidation('');
    setApplicableQuestions([]);
    setEstimateDetails(null);
    setShowDetails(false);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remover a última resposta
      const currentQuestion = applicableQuestions[currentQuestionIndex];
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    }
  };

  const exportContract = (projectName: string, developerName: string) => {
    const contractData = {
      projectName,
      developerName,
      date: new Date().toLocaleDateString('pt-BR'),
      estimate: estimate!,
      answers,
      aiReasoning,
      marketValidation,
      aiSuggestions
    };

    const contractText = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO
===============================================

DADOS DO PROJETO:
Projeto: ${projectName}
Desenvolvedor/Empresa: ${developerName}
Data: ${contractData.date}
Valor Total: R$ ${estimate!.min.toLocaleString('pt-BR')} - R$ ${estimate!.max.toLocaleString('pt-BR')}

ESPECIFICAÇÕES TÉCNICAS:
${Object.entries(answers).map(([key, value]: [string, any]) => {
  const question = QUESTIONS.find((q: Question) => q.id === key);
  return `- ${question?.question}: ${value.label}`;
}).join('\n')}

ANÁLISE TÉCNICA:
${aiReasoning}

VALIDAÇÃO DE MERCADO:
${marketValidation}

RECOMENDAÇÕES:
${aiSuggestions.map((suggestion, i) => `${i + 1}. ${suggestion}`).join('\n')}

TERMOS E CONDIÇÕES:
1. O valor acima é uma estimativa baseada nas informações fornecidas
2. Alterações no escopo podem impactar o valor final
3. Pagamento sugerido: 50% início, 50% entrega
4. Prazo de entrega será acordado separadamente
5. Código fonte será entregue ao final do projeto

ASSINATURAS:
_________________________        _________________________
Desenvolvedor/Empresa             Cliente

Data: ___/___/______              Data: ___/___/______

---
Gerado pelo Devlator - Calculadora para DEVs
https://devlator.com
`;

    // Criar e baixar arquivo
    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isCalculating) {
    return (
      <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8 text-center">
        <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-[#bd93f9] border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Calculando com IA...</h2>
        <p className="text-[#f1fa8c] mt-2 text-sm md:text-base">Analisando seu projeto e gerando estimativa personalizada</p>
      </section>
    );
  }

  if (estimate !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#282a36] via-[#373844] to-[#44475a] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <FaMoneyBillWave className="text-[#50fa7b] text-3xl" />
              <h1 className="text-2xl md:text-4xl font-bold text-[#50fa7b]">
                Estimativa Calculada
              </h1>
            </div>
            <p className="text-[#6272a4] text-sm md:text-base">
              Sua estimativa personalizada baseada em IA
            </p>
          </div>

          {/* Price Card */}
          <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#50fa7b]/5 to-[#8be9fd]/5" />
            
            <div className="relative z-10 text-center">
              <div className="mb-6">
                <span className="text-sm text-[#8be9fd] bg-[#44475a]/60 px-4 py-2 rounded-full border border-[#6272a4]/30">
                  Estimativa Final
                </span>
              </div>
              
              <div className="mb-8">
                <div className="text-5xl md:text-7xl font-bold text-[#50fa7b] mb-4">
                  R$ {estimate.min.toLocaleString('pt-BR')}
                </div>
                <div className="text-2xl md:text-3xl text-[#f8f8f2] mb-2">
                  até R$ {estimate.max.toLocaleString('pt-BR')}
                </div>
                <p className="text-[#6272a4] text-sm md:text-base">
                  Faixa de preço baseada na complexidade do projeto
                </p>
              </div>
              
              {isCalculating && (
                <div className="flex items-center justify-center gap-3 text-[#8be9fd]">
                  <div className="animate-spin w-6 h-6 border-2 border-[#8be9fd] border-t-transparent rounded-full" />
                  <span>Analisando com IA...</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Toggle */}
          {estimateDetails && (
            <div className="mb-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full group bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6 hover:border-[#bd93f9]/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-[#bd93f9] text-xl" />
                    <span className="text-lg font-semibold text-[#f8f8f2] group-hover:text-[#bd93f9] transition-colors">
                      Detalhamento de Custos
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-[#6272a4] transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showDetails && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  {/* Breakdown */}
                  <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-[#8be9fd] mb-4 flex items-center gap-2">
                      <FaCode className="text-sm" />
                      Breakdown do Desenvolvimento
                    </h3>
                    <div className="space-y-3">
                      {estimateDetails.breakdown.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-[#f8f8f2]">
                          <div className="w-2 h-2 bg-[#50fa7b] rounded-full" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6">
                      <h4 className="font-bold text-[#ffb86c] mb-3 flex items-center gap-2">
                        <FaServer className="text-sm" />
                        Hospedagem
                      </h4>
                      <p className="text-[#f8f8f2] text-sm">{estimateDetails.hosting}</p>
                    </div>
                    
                    <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6">
                      <h4 className="font-bold text-[#f1fa8c] mb-3 flex items-center gap-2">
                        <FaCog className="text-sm" />
                        Manutenção Anual
                      </h4>
                      <p className="text-[#f8f8f2] text-sm">{estimateDetails.maintenance}</p>
                    </div>
                  </div>

                  {/* Extras */}
                  <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6">
                    <h4 className="font-bold text-[#ff79c6] mb-4 flex items-center gap-2">
                      <FaRocket className="text-sm" />
                      Custos Adicionais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {estimateDetails.extras.map((extra, index) => (
                        <div key={index} className="flex items-center gap-3 text-[#f8f8f2] text-sm">
                          <div className="w-1.5 h-1.5 bg-[#ff79c6] rounded-full" />
                          <span>{extra}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Summary Card */}
          <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-[#bd93f9] mb-6 flex items-center gap-2">
              <FaChartLine className="text-lg" />
              Resumo das Respostas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(answers).map(([key, value]: [string, any]) => {
                const question = QUESTIONS.find((q: Question) => q.id === key);
                return (
                  <div key={key} className="bg-[#44475a]/40 rounded-xl p-4 border border-[#6272a4]/20">
                    <div className="text-sm text-[#8be9fd] mb-2">{question?.question}</div>
                    <div className="text-[#50fa7b] font-semibold">{value.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Analysis */}
          {aiReasoning && (
            <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#8be9fd] mb-4 flex items-center gap-2">
                <FaRocket className="text-lg" />
                Análise Técnica da IA
              </h3>
              <p className="text-[#f8f8f2] leading-relaxed">{aiReasoning}</p>
            </div>
          )}

          {/* Market Validation */}
          {marketValidation && (
            <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#f1fa8c] mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-lg" />
                Validação de Mercado
              </h3>
              <p className="text-[#f8f8f2] leading-relaxed">{marketValidation}</p>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-[#50fa7b] mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-lg" />
                Sugestões para Otimização
              </h3>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#44475a]/40 rounded-xl border border-[#6272a4]/20">
                    <div className="w-2 h-2 bg-[#50fa7b] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-[#f8f8f2]">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={resetCalculator}
              className="group bg-[#bd93f9]/90 backdrop-blur-sm text-[#282a36] font-bold py-4 px-6 rounded-2xl hover:bg-[#ff79c6] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#bd93f9]/20"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Calcular Novamente
              </div>
            </button>
            
            <button 
              onClick={() => {
                const avgEstimate = Math.round((estimate.min + estimate.max) / 2);
                const chatContext = {
                  projectData: answers,
                  estimate: avgEstimate,
                  reasoning: aiReasoning,
                  marketValidation: marketValidation,
                  suggestions: aiSuggestions
                };
                localStorage.setItem('devlator-chat-context', JSON.stringify(chatContext));
                window.location.href = '/chat';
              }}
              className="group bg-[#50fa7b]/90 backdrop-blur-sm text-[#282a36] font-bold py-4 px-6 rounded-2xl hover:bg-[#8be9fd] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#50fa7b]/20"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Refinar no Chat
              </div>
            </button>
            
            <button 
              onClick={() => {
                const projectName = prompt('Nome do projeto:');
                const developerName = prompt('Seu nome/empresa:');
                if (projectName && developerName) {
                  exportContract(projectName, developerName);
                }
              }}
              className="group bg-[#ffb86c]/90 backdrop-blur-sm text-[#282a36] font-bold py-4 px-6 rounded-2xl hover:bg-[#f1fa8c] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#ffb86c]/20"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Contrato
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (applicableQuestions.length === 0) {
    return (
      <section className="w-full max-w-xl mx-auto p-4 md:p-8 bg-[#44475a]/40 rounded-2xl shadow-xl mt-4 md:mt-8 text-center">
        <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-[#bd93f9] border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#bd93f9]">Carregando perguntas...</h2>
      </section>
    );
  }

  const currentQuestion = applicableQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#282a36] via-[#373844] to-[#44475a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            {currentQuestion.icon}
            <h1 className="text-2xl md:text-4xl font-bold text-[#bd93f9]">
              Calculadora de Preço IA
            </h1>
          </div>
          <p className="text-[#6272a4] text-sm md:text-base">
            Obtenha uma estimativa precisa para seu projeto de desenvolvimento
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#f1fa8c] font-medium">
              Pergunta {currentQuestionIndex + 1} de {applicableQuestions.length}
            </span>
            <span className="text-xs text-[#8be9fd] bg-[#282a36]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#44475a]">
              {currentQuestion.category}
            </span>
          </div>
          
          <div className="w-full bg-[#282a36]/60 rounded-full h-2 overflow-hidden backdrop-blur-sm border border-[#44475a]/50">
            <div 
              className="h-full bg-gradient-to-r from-[#50fa7b] to-[#8be9fd] transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / applicableQuestions.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            {applicableQuestions.map((_: Question, i: number) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= currentQuestionIndex 
                    ? 'bg-[#50fa7b] shadow-lg shadow-[#50fa7b]/30' 
                    : 'bg-[#6272a4]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-[#f8f8f2] leading-tight max-w-4xl mx-auto">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {currentQuestion.options.map((option: QuestionOption) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option)}
              className="group relative p-8 bg-[#282a36]/60 backdrop-blur-sm border border-[#44475a]/50 rounded-3xl hover:border-[#bd93f9]/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#bd93f9]/20 text-left overflow-hidden min-h-[200px]"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#bd93f9]/8 to-[#50fa7b]/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon and multiplier header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                      {getOptionIcon(currentQuestion.id, option.value)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#f8f8f2] group-hover:text-[#bd93f9] transition-colors duration-300 leading-tight">
                        {option.label}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-[#8be9fd] bg-[#44475a]/80 px-3 py-1.5 rounded-full border border-[#6272a4]/50 group-hover:bg-[#bd93f9]/20 group-hover:border-[#bd93f9]/50 transition-all duration-300">
                      {option.multiplier}x
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <div className="flex-1 flex items-center">
                  {option.description && (
                    <p className="text-base text-[#6272a4] group-hover:text-[#8be9fd] transition-colors duration-300 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
                
                {/* Selection indicator */}
                <div className="absolute top-6 right-6 w-8 h-8 border-2 border-[#6272a4]/50 rounded-full group-hover:border-[#bd93f9] transition-colors duration-300 bg-[#282a36]/80 backdrop-blur-sm">
                  <div className="absolute inset-1.5 bg-[#bd93f9] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-2 border border-[#bd93f9] rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Enhanced hover effect lines */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#bd93f9] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-full h-[3px] bg-gradient-to-l from-transparent via-[#50fa7b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-transparent via-[#ff79c6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute right-0 top-0 w-[3px] h-full bg-gradient-to-b from-transparent via-[#f1fa8c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Navigation */}
        {currentQuestionIndex > 0 && (
          <div className="flex justify-center">
            <button 
              onClick={goToPreviousQuestion}
              className="group flex items-center gap-2 px-6 py-3 bg-[#6272a4]/80 backdrop-blur-sm text-[#f8f8f2] rounded-xl border border-[#44475a]/50 hover:bg-[#44475a] hover:border-[#bd93f9]/50 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Pergunta Anterior
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
