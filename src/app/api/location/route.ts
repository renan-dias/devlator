import { NextRequest, NextResponse } from "next/server";

const FALLBACK = {
  country: "Brazil",
  state: "São Paulo",
  city: "São Paulo",
  timezone: "America/Sao_Paulo",
};

export async function GET(request: NextRequest) {
  // x-forwarded-for pode trazer uma lista "cliente, proxy1, proxy2".
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "";

  const isLocal = !ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.");
  if (isLocal) return NextResponse.json({ ...FALLBACK, approximate: true });

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,timezone&lang=pt-BR`,
      { signal: AbortSignal.timeout(5000) },
    );
    const geo = await response.json();
    if (geo.status !== "success") throw new Error("Geolocalização falhou");

    return NextResponse.json({
      country: geo.country,
      state: geo.regionName,
      city: geo.city,
      timezone: geo.timezone,
    });
  } catch (error) {
    console.error("Erro ao obter localização:", error);
    return NextResponse.json({ ...FALLBACK, approximate: true });
  }
}
