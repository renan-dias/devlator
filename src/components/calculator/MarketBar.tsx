import { formatBRL, type PriceRange } from "@/lib/market-data";

interface Props {
  range: PriceRange;
  value: number;
  /** Faixa própria (min–max) exibida como sombra sobre a barra. */
  own?: { min: number; max: number };
  suffix?: string;
  label: string;
}

/** Barra horizontal mostrando onde um valor cai dentro da faixa de mercado. */
export default function MarketBar({ range, value, own, suffix = "", label }: Props) {
  // Escala com folga de 25% para cada lado, para valores fora da faixa ficarem visíveis.
  const lo = Math.min(range.min * 0.75, own?.min ?? Infinity, value * 0.9);
  const hi = Math.max(range.max * 1.25, own?.max ?? 0, value * 1.1);
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;
  const fmt = (v: number) => `${formatBRL(v)}${suffix}`;

  return (
    <div role="img" aria-label={`${label}: ${fmt(value)}. Mercado de ${fmt(range.min)} a ${fmt(range.max)}, típico ${fmt(range.typical)}.`}>
      <div className="relative h-12">
        {/* trilho */}
        <div className="absolute inset-x-0 top-5 h-2 rounded-full bg-panel-2" />
        {/* faixa de mercado */}
        <div
          className="absolute top-5 h-2 rounded-full bg-gradient-to-r from-cyan/50 via-green/60 to-orange/50"
          style={{ left: pos(range.min), width: `calc(${pos(range.max)} - ${pos(range.min)})` }}
        />
        {own && (
          <div
            className="absolute top-3.5 h-5 rounded-md border border-purple/60 bg-purple/15"
            style={{ left: pos(own.min), width: `calc(${pos(own.max)} - ${pos(own.min)})` }}
          />
        )}
        {/* típico */}
        <div className="absolute top-3 h-6 w-px bg-fg/40" style={{ left: pos(range.typical) }} />
        {/* valor */}
        <div className="absolute top-0 -translate-x-1/2" style={{ left: pos(value) }}>
          <div className="h-11 w-1 rounded-full bg-fg shadow-[0_0_12px] shadow-purple" />
        </div>
      </div>
      <div className="relative mt-1 h-5 text-[11px] text-subtle">
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pos(range.min) }}>{fmt(range.min)}</span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap text-muted" style={{ left: pos(range.typical) }}>típico</span>
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pos(range.max) }}>{fmt(range.max)}</span>
      </div>
    </div>
  );
}
