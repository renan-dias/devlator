import Link from "next/link";
import { FaHome, FaCalculator, FaComments, FaHistory, FaInfo, FaShieldAlt } from "react-icons/fa";

export default function Menu() {
  return (
    <nav className="flex flex-wrap gap-3 md:gap-6 px-4 md:px-8 py-3 md:py-4 bg-[#282a36]/90 border-b border-[#44475a] shadow-lg backdrop-blur text-[#f8f8f2] font-mono text-xs md:text-sm">
      <Link href="/" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaHome /> <span className="hidden sm:inline">Home</span>
      </Link>
      <Link href="/calculadora" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaCalculator /> <span className="hidden sm:inline">Calculadora</span>
      </Link>
      <Link href="/chat" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaComments /> <span className="hidden sm:inline">Chat</span>
      </Link>
      <Link href="/historico" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaHistory /> <span className="hidden sm:inline">Histórico</span>
      </Link>
      <Link href="/sobre" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaInfo /> <span className="hidden sm:inline">Sobre</span>
      </Link>
      <Link href="/privacidade" className="flex items-center gap-2 hover:text-[#bd93f9] transition">
        <FaShieldAlt /> <span className="hidden sm:inline">Privacidade</span>
      </Link>
    </nav>
  );
}
