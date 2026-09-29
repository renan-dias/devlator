"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars, FaCalculator, FaClock, FaComments, FaHistory, FaServer, FaTimes } from "react-icons/fa";

const NAV = [
  { href: "/calculadora", label: "Calculadora", icon: FaCalculator },
  { href: "/valor-hora", label: "Valor-hora", icon: FaClock },
  { href: "/hospedagem", label: "Hospedagem", icon: FaServer },
  { href: "/chat", label: "Chat IA", icon: FaComments },
  { href: "/historico", label: "Histórico", icon: FaHistory },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight" aria-label="Devlator — início">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" priority />
          <span className="font-mono text-lg">
            dev<span className="text-purple">lator</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-panel-2 text-fg" : "text-muted hover:bg-panel hover:text-fg"
                }`}
              >
                <Icon className={active ? "text-purple" : ""} aria-hidden />
                {label}
              </Link>
            );
          })}
          <Link href="/calculadora" className="btn-primary ml-2 !px-4 !py-2">
            Calcular agora
          </Link>
        </nav>

        <button
          type="button"
          className="btn-ghost !p-2.5 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Principal" className="animate-fade-in border-t border-line bg-bg/95 px-4 pb-4 pt-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-fg hover:bg-panel"
            >
              <Icon className="text-purple" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
