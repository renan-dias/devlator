import { NextResponse } from "next/server";
import { FALLBACK_USD_BRL } from "@/lib/ai-tools";

// Cotação comercial USD→BRL (AwesomeAPI), revalidada a cada hora.
export async function GET() {
  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`AwesomeAPI ${res.status}`);
    const data = await res.json();
    const rate = Number(data?.USDBRL?.ask ?? data?.USDBRL?.bid);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Cotação inválida");
    return NextResponse.json({
      rate,
      date: new Date(Number(data.USDBRL.timestamp) * 1000).toISOString(),
      source: "AwesomeAPI",
    });
  } catch (error) {
    console.error("Falha ao buscar cotação:", error);
    return NextResponse.json({ rate: FALLBACK_USD_BRL, date: null, source: "padrão" });
  }
}
