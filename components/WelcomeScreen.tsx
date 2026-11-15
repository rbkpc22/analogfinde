"use client";

import { useEffect, useState } from "react";

export default function WelcomeScreen({
  onDone,
  siteCount,
}: {
  onDone: () => void;
  siteCount: number;
}) {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(1);
  const lines = [
    "INICIALIZANDO ANALOGFINDER…",
    `${siteCount} SITIOS ANÁLOGOS CARGADOS`,
    "FUENTE DE DATOS: NASA POWER",
  ];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(lines.length);
      return;
    }
    if (visible >= lines.length) return;
    const wait = window.setTimeout(() => setVisible((count) => count + 1), 420);
    return () => window.clearTimeout(wait);
  }, [visible, lines.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") setLeaving(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const wait = window.setTimeout(onDone, 420);
    return () => window.clearTimeout(wait);
  }, [leaving, onDone]);

  const ready = visible >= lines.length;

  return (
    <div
      className={`fixed inset-0 z-[800] flex items-center justify-start bg-[#050505]/68 px-5 ${
        leaving ? "splash-leave" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a AnalogFinder"
    >
      <div className="relative z-10 w-full max-w-full text-left">
        <img src="/logo.png?v=2" alt="" width={160} height={160} className="mb-6 h-40 w-40" />
        <h2 className="display intro-title leading-[0.9]">AnalogFinder</h2>
        <div className="mt-8 space-y-2 font-mono text-[11px] tracking-[0.14em] text-[var(--text)] uppercase">
          {lines.slice(0, visible).map((line) => (
            <p key={line} className="term-line">
              {line}
            </p>
          ))}
          {ready ? (
            <button
              type="button"
              onClick={() => setLeaving(true)}
              className="term-line mt-4 block text-left text-accent"
            >
              &gt; ENTRAR
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
