import type { Metadata } from "next";
import Calculator from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Calculadora de preço de projeto de software",
  description:
    "Calcule quanto cobrar por um site, app, e-commerce ou sistema: horas, valor-hora, prazo, impostos e comparação com a média do mercado brasileiro. Grátis e sem cadastro.",
  alternates: { canonical: "/calculadora" },
  openGraph: { url: "/calculadora" },
};

export default function CalculadoraPage() {
  return <Calculator />;
}
