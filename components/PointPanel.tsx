"use client";

import { useEffect, useState } from "react";
import type { Site, Target } from "@/lib/data";
import { aridezFromPrecipitation, frioFromTemperature, powerPointUrl } from "@/lib/nasa";
import {
  climateScore,
  formatCoord,
  formatKm,
  nearestSite,
  type Probe,
} from "@/lib/point";
import type { Weights } from "@/lib/score";

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 600);
      setShown(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="display text-[72px] leading-none text-accent tabular-nums">{shown}</span>;
}

function measure(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

export default function PointPanel({
  probe,
  target,
  weights,
  saved,
  onRetry,
  onSave,
  onGoToSite,
}: {
  probe: Probe;
  target: Target;
  weights: Weights;
  saved: boolean;
  onRetry: () => void;
  onSave: () => void;
  onGoToSite: (site: Site) => void;
}) {
  return (
    <article className="brackets relative border border-line bg-panel p-4">
      <h3 className="display text-2xl leading-none">Punto analizado</h3>
      <p className="mt-2 font-mono text-sm tabular-nums">{formatCoord(probe.lat, probe.lng)}</p>

      {probe.status === "loading" ? (
        <p className="mt-4 font-mono text-[11px] tracking-[0.08em] text-muted">CONSULTANDO NASA POWER…</p>
      ) : null}

      {probe.status === "error" ? (
        <div className="mt-4">
          <p className="text-sm leading-relaxed">No se pudo consultar NASA POWER</p>
          <button
            type="button"
            onClick={onRetry}
            className="kicker mt-3 border border-line px-3 py-2 hover:border-accent hover:text-accent"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {probe.status === "ready" ? <Ready probe={probe} target={target} weights={weights} saved={saved} onSave={onSave} onGoToSite={onGoToSite} /> : null}
    </article>
  );
}

function Ready({
  probe,
  target,
  weights,
  saved,
  onSave,
  onGoToSite,
}: {
  probe: Extract<Probe, { status: "ready" }>;
  target: Target;
  weights: Weights;
  saved: boolean;
  onSave: () => void;
  onGoToSite: (site: Site) => void;
}) {
  const score = climateScore(probe.climate, target, weights);
  const frio = frioFromTemperature(probe.climate.T2M);
  const aridez = aridezFromPrecipitation(probe.climate.PRECTOTCORR);
  const near = nearestSite(probe.lat, probe.lng);
  const rows = [
    ["Temperatura media anual", measure(probe.climate.T2M, "°C")],
    ["Temperatura máxima", measure(probe.climate.T2M_MAX, "°C")],
    ["Temperatura mínima", measure(probe.climate.T2M_MIN, "°C")],
    ["Precipitación", measure(probe.climate.PRECTOTCORR, "mm/día")],
    ...(probe.elevation === null
      ? []
      : [["Elevación promedio de la celda", `${probe.elevation.toFixed(0)} m`] as const]),
  ];

  return (
    <>
      {score === null ? (
        <p className="mt-4 text-sm leading-relaxed">Sube el peso de Frío o Aridez para comparar</p>
      ) : (
        <>
          <p className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
            <CountUp value={score} />
            <span className="pb-2 font-mono text-sm text-muted tabular-nums">/ 100</span>
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted">
            PUNTAJE PARCIAL · 2 de 9 categorías
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Este lugar se parece {score}% a {target.name} en frío y aridez.
          </p>
        </>
      )}
      {probe.elevation !== null && probe.elevation <= 0 ? (
        <p className="mt-3 border border-line px-3 py-2 text-sm leading-relaxed text-muted">
          Este punto podría estar en el mar; verifica que sea tierra firme.
        </p>
      ) : null}

      <section className="mt-4 border-t border-line pt-3">
        <h4 className="display text-2xl text-muted">Datos reales · NASA POWER</h4>
        <dl className="mt-2 border-t border-line">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-mono text-sm tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Frío {frio}/10 con la temperatura media y aridez {aridez}/10 con la precipitación. El valor anual
          de la máxima es el mes más cálido y el de la mínima, el mes más frío.
        </p>
      </section>

      {near ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">Sitio conocido más parecido cerca</h4>
          <p className="mt-2 text-sm">
            {near.site.name}
            <span className="font-mono text-muted"> · {formatKm(near.km)}</span>
          </p>
          <button
            type="button"
            onClick={() => onGoToSite(near.site)}
            className="kicker mt-3 border border-accent px-3 py-2 text-accent"
          >
            Ir a este sitio
          </button>
        </section>
      ) : null}

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        NASA POWER da promedios de una celda de 0.5° × 0.625° (unos 55 × 62 km), no del punto exacto. Solo
        frío y aridez vienen de datos de NASA; el perfil del objetivo (Luna/Marte) es una calificación del
        equipo. Esto indica un CANDIDATO, no un análogo confirmado.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Datos:{" "}
        <a
          href={powerPointUrl(probe.queryLat, probe.queryLng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2"
        >
          NASA POWER (power.larc.nasa.gov)
        </a>
        , climatología por punto, comunidad RE
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={saved}
        className="kicker mt-4 border border-line px-3 py-2 hover:border-accent hover:text-accent disabled:text-muted"
      >
        {saved ? "Ya está en mis candidatos" : "Guardar como candidato"}
      </button>
    </>
  );
}
