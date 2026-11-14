"use client";

import { useEffect, useRef } from "react";
import { DIMS, LIMITES } from "@/lib/data";

/**
 * Escribe aquí los nombres del equipo antes de presentar.
 * Deja la cadena vacía si ese lugar todavía no tiene nombre.
 */
const TEAM: { name: string; role: string }[] = [
  { name: "", role: "" },
  { name: "", role: "" },
  { name: "", role: "" },
  { name: "", role: "" },
];

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar acerca del proyecto"
        className="absolute inset-0 bg-[#05070f]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="rise relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-[#101726] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
              NASA Space Apps Challenge 2026
            </p>
            <h2 id="about-title" className="font-display text-xl font-semibold">
              Acerca del proyecto
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-accent"
          >
            Cerrar
          </button>
        </div>

        <div className="scroll-thin space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">El reto</h3>
            <p>
              AnalogFinder participa en el NASA Space Apps Challenge 2026. El reto es encontrar lugares de
              la Tierra análogos a sitios de la Luna y de Marte: dónde se parecen, y dónde la comparación
              deja de servir.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Metodología
            </h3>
            <p>
              Cada lugar y cada objetivo se describen con {DIMS.length} categorías, en una escala de 0 a 10:{" "}
              {DIMS.map((dim) => dim.name).join(", ")}.
            </p>
            <p className="mt-2">
              El parecido es un puntaje de 0 a 100. Si todos los pesos están en cero, el resultado es 0. Si
              no, la fórmula es
            </p>
            <p className="mt-2 rounded-xl bg-canvas px-3 py-2 font-mono text-[13px] text-accent">
              100 × (1 − diferencia promedio ponderada / 10)
            </p>
            <p className="mt-2">
              La diferencia de cada categoría es el valor absoluto entre el lugar y el objetivo. El peso de
              esa categoría va de 0 (no cuenta) a 3 (cuenta el triple). El promedio ponderado de esas
              diferencias se divide entre 10, que es el máximo de la escala.
            </p>
            <p className="mt-2">
              <span className="text-earth">Frío</span> y <span className="text-earth">aridez</span> de los
              lugares en la Tierra salen de NASA POWER: climatología por punto, comunidad RE, valor anual.
              El frío usa la temperatura media (T2M): 0 si el año promedia 25 °C o más, y 10 si promedia
              −15 °C o menos. La aridez usa la precipitación (PRECTOTCORR): 10 con 0.2 mm/día o menos, y 0
              con 4 mm/día o más. Entre esos extremos la escala es lineal.
            </p>
            <p className="mt-2">
              Las otras siete categorías, y todo el perfil del objetivo en la Luna o en Marte, siguen siendo
              estimaciones del equipo a partir de la literatura. En la interfaz aparecen como «Estimado».
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Límites de cualquier análogo terrestre
            </h3>
            <p>Ningún lugar de la Tierra puede imitar esto:</p>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="mr-1.5 inline-block rounded-full bg-moon px-1.5 py-px text-[10px] font-semibold text-[#111]">
                  LUNA
                </span>
                {LIMITES.luna}
              </li>
              <li>
                <span className="mr-1.5 inline-block rounded-full bg-mars px-1.5 py-px text-[10px] font-semibold text-[#111]">
                  MARTE
                </span>
                {LIMITES.marte}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Equipo</h3>
            <ul className="divide-y divide-line/80 rounded-xl border border-line">
              {TEAM.map((person, index) => (
                <li key={index} className="px-3 py-2.5">
                  <p className={person.name ? "text-ink" : "text-muted"}>
                    {person.name || "Nombre del integrante"}
                  </p>
                  <p className="text-xs text-muted">{person.role || "Rol en el equipo"}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
