import { ImageResponse } from "next/og";

export const alt = "Devlator — calculadora de preço de projetos para devs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #15161e 0%, #22172f 55%, #15261d 100%)",
          color: "#f8f8f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #bd93f9, #50fa7b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#15161e",
              fontSize: 26,
            }}
          >
            R$
          </div>
          <span>
            dev<span style={{ color: "#bd93f9" }}>lator</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Quanto cobrar pelo</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#ff79c6" }}>seu próximo projeto?</div>
          <div style={{ fontSize: 30, color: "#a3a9c8", marginTop: 24 }}>
            Horas, valor-hora, prazo e comparação com a média do mercado brasileiro.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#50fa7b" }}>
          <span>sites</span>·<span>apps</span>·<span>e-commerce</span>·<span>sistemas</span>·<span>APIs</span>
        </div>
      </div>
    ),
    size,
  );
}
