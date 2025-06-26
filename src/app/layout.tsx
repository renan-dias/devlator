import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devlator - Calculadora para DEVs",
  description: "Tem um projeto e quer estimar quanto cobrar? A Devlator está aqui para te ajudar! Calculadora inteligente para precificação de projetos de desenvolvimento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#282a36] text-[#f8f8f2] font-mono`}>
        <Menu />
        <main className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-2 py-4 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
