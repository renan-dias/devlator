import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o Devlator trata seus dados: tudo fica salvo apenas no seu navegador.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Privacidade</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Seus dados ficam com você</h1>
      </div>
      <section className="card space-y-3 p-6 text-muted">
        <h2 className="font-semibold text-fg">O que é salvo e onde</h2>
        <p>
          Perfil (senioridade, região, valor-hora, impostos), rascunhos, estimativas e conversas ficam no <strong className="text-fg">localStorage</strong> do
          seu navegador. Não temos banco de dados nem contas de usuário. Limpar os dados do site apaga tudo — use a exportação do histórico para
          guardar um backup.
        </p>
      </section>
      <section className="card space-y-3 p-6 text-muted">
        <h2 className="font-semibold text-fg">O que passa pelo servidor</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Análise e chat com IA:</strong> as respostas do questionário, mensagens e anexos que você escolher são enviados ao
            Google Gemini para gerar a resposta. Não os armazenamos.
          </li>
          <li>
            <strong className="text-fg">Minha região:</strong> ao ativar, seu IP é consultado no serviço ip-api.com para estimar cidade e estado.
          </li>
          <li>
            <strong className="text-fg">Site de referência:</strong> o servidor acessa a URL informada para extrair título e estrutura da página.
          </li>
        </ul>
      </section>
      <section className="card p-6 text-muted">
        <h2 className="font-semibold text-fg">Cookies e rastreamento</h2>
        <p className="mt-2">O Devlator não usa cookies de rastreamento nem ferramentas de analytics.</p>
      </section>
    </article>
  );
}
