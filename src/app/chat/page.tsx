import type { Metadata } from "next";
import Chat from "@/components/Chat";

export const metadata: Metadata = {
  title: "Chat com IA sobre precificação",
  description:
    "Converse com o Devinho, assistente de IA que ajuda a precificar projetos de software, justificar valores e negociar com clientes usando dados do mercado brasileiro.",
  alternates: { canonical: "/chat" },
  openGraph: { url: "/chat" },
};

export default function ChatPage() {
  return <Chat />;
}
