import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { MARKET_UPDATED_AT } from "@/lib/market-data";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-bg-soft/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-mono text-base font-semibold">
            dev<span className="text-purple">lator</span>
          </p>
          <p className="mt-2 text-muted">
            Calculadora de preço de projetos para desenvolvedores brasileiros. Referências de mercado atualizadas em {MARKET_UPDATED_AT}.
          </p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-2 text-muted">
          <Link href="/calculadora" className="hover:text-fg">Calculadora de projeto</Link>
          <Link href="/valor-hora" className="hover:text-fg">Calculadora de valor-hora</Link>
          <Link href="/hospedagem" className="hover:text-fg">Comparativo de hospedagem</Link>
          <Link href="/chat" className="hover:text-fg">Chat com IA</Link>
          <Link href="/historico" className="hover:text-fg">Histórico</Link>
          <Link href="/sobre" className="hover:text-fg">Metodologia</Link>
          <Link href="/privacidade" className="hover:text-fg">Privacidade</Link>
        </nav>
        <div className="text-muted md:text-right">
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
            <FaGithub aria-hidden /> Código aberto no GitHub
          </a>
          <p className="mt-2">Feito por {SITE.author}.</p>
          <p className="mt-1 text-xs text-subtle">Valores são estimativas de referência, não constituem proposta comercial.</p>
        </div>
      </div>
    </footer>
  );
}
