import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devlator - Calculadora Profissional para DEVs",
  description: "Calculadora inteligente com IA para precificação de projetos de desenvolvimento. Chatbot especializado, análise de mercado e relatórios profissionais.",
  keywords: ["calculadora", "precificação", "desenvolvimento", "freelancer", "projetos", "orçamento", "devs"],
  authors: [{ name: "Devlator Team" }],
  creator: "Devlator",
  publisher: "Devlator",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Devlator - Calculadora Profissional para DEVs",
    description: "Calculadora inteligente com IA para precificação de projetos de desenvolvimento",
    url: "https://devlator.com",
    siteName: "Devlator",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Devlator - Calculadora para DEVs"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Devlator - Calculadora Profissional para DEVs",
    description: "Calculadora inteligente com IA para precificação de projetos",
    images: ["/logo.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/logo.png" sizes="180x180" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#282a36] text-[#f8f8f2] font-mono`}>
        <Menu />
        <PageTransition>
          <main className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-2 py-4 md:py-8">
            {children}
          </main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
