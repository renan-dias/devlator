"use client";
import { useEffect } from "react";

const SIZE = 64;
const FRAME_MS = 70;

function drawFrame(ctx: CanvasRenderingContext2D, frame: number) {
  const c = SIZE / 2;
  ctx.clearRect(0, 0, SIZE, SIZE);

  // Fundo arredondado
  ctx.fillStyle = "#1e1f29";
  ctx.beginPath();
  ctx.roundRect(0, 0, SIZE, SIZE, 14);
  ctx.fill();

  // Trilho e arco girando
  const start = (frame * 0.35) % (Math.PI * 2);
  const sweep = Math.PI * (0.6 + 0.5 * Math.sin(frame * 0.12));
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(98,114,164,0.45)";
  ctx.beginPath();
  ctx.arc(c, c, 21, 0, Math.PI * 2);
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, "#bd93f9");
  grad.addColorStop(1, "#50fa7b");
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(c, c, 21, start, start + sweep);
  ctx.stroke();

  // "R$" pulsando no centro
  const pulse = 0.75 + 0.25 * Math.sin(frame * 0.3);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#f8f8f2";
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("R$", c, c + 1);
  ctx.globalAlpha = 1;
}

/**
 * Anima o favicon (e prefixa o título da aba) enquanto `active` for true.
 * Restaura os ícones originais ao terminar.
 */
export function useAnimatedFavicon(active: boolean, busyTitle = "Calculando…") {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof ctx.roundRect !== "function") return;

    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
    const originals = links.map((l) => ({ el: l, href: l.href, type: l.type }));

    // Um link dedicado no fim do <head> garante prioridade em todos os navegadores.
    const dynamic = document.createElement("link");
    dynamic.rel = "icon";
    dynamic.type = "image/png";
    document.head.appendChild(dynamic);

    const originalTitle = document.title;
    document.title = `${busyTitle} · Devlator`;

    let frame = 0;
    const tick = () => {
      drawFrame(ctx, frame++);
      const url = canvas.toDataURL("image/png");
      dynamic.href = url;
      links.forEach((l) => {
        l.href = url;
        l.type = "image/png";
      });
    };
    tick();
    const interval = window.setInterval(tick, FRAME_MS);

    return () => {
      window.clearInterval(interval);
      dynamic.remove();
      originals.forEach(({ el, href, type }) => {
        el.href = href;
        el.type = type;
      });
      document.title = originalTitle;
    };
  }, [active, busyTitle]);
}
