"use client";

import { useEffect, useState } from "react";

export default function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = window.setTimeout(() => setLeaving(true), reduce ? 700 : 2400);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") setLeaving(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(wait);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const wait = window.setTimeout(onDone, 420);
    return () => window.clearTimeout(wait);
  }, [leaving, onDone]);

  return (
    <div
      className={`starfield fixed inset-0 z-[70] flex cursor-pointer items-center justify-center px-6 ${
        leaving ? "splash-leave" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenida a AnalogFinder"
      onClick={() => setLeaving(true)}
    >
      <div className="splash-copy relative z-10 w-full max-w-xl text-center">
        <p className="font-mono text-[11px] tracking-[0.28em] text-accent uppercase sm:text-xs">
          NASA Space Apps Challenge 2026
        </p>
        <h2 className="font-display mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
          Analog<span className="text-accent">Finder</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-muted sm:text-lg">
          Gemelos de la Luna y Marte en la Tierra
        </p>
        <p className="mt-8 text-xs tracking-[0.16em] text-muted uppercase">Toca para entrar</p>
        <div className="mx-auto mt-3 h-px w-40 overflow-hidden bg-line">
          <div className="splash-bar h-full origin-left bg-accent" />
        </div>
      </div>
    </div>
  );
}
