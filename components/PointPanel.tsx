"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import type { Site, Target } from "@/lib/data";
import { targetText } from "@/lib/i18n";
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
  const { t } = useI18n();
  return (
    <article className="brackets relative border border-line bg-panel p-4">
      <h3 className="display text-2xl leading-none">{t("analyzedPoint")}</h3>
      <p className="mt-2 font-mono text-sm tabular-nums">{formatCoord(probe.lat, probe.lng)}</p>

      {probe.status === "loading" ? (
        <p className="mt-4 font-mono text-[11px] tracking-[0.08em] text-muted">{t("consulting")}</p>
      ) : null}

      {probe.status === "error" ? (
        <div className="mt-4">
          <p className="text-sm leading-relaxed">{t("powerFailed")}</p>
          <button
            type="button"
            onClick={onRetry}
            className="kicker mt-3 border border-line px-3 py-2 hover:border-accent hover:text-accent"
          >
            {t("retry")}
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
  const { locale, t } = useI18n();
  const score = climateScore(probe.climate, target, weights);
  const frio = frioFromTemperature(probe.climate.T2M);
  const aridez = aridezFromPrecipitation(probe.climate.PRECTOTCORR);
  const near = nearestSite(probe.lat, probe.lng);
  const targetLabel = targetText(locale, target.id, target);
  const rows = [
    [t("tempMean"), measure(probe.climate.T2M, "°C")],
    [t("tempMax"), measure(probe.climate.T2M_MAX, "°C")],
    [t("tempMin"), measure(probe.climate.T2M_MIN, "°C")],
    [t("precip"), measure(probe.climate.PRECTOTCORR, t("perDay"))],
    ...(probe.elevation === null ? [] : [[t("cellElevation"), `${probe.elevation.toFixed(0)} m`] as const]),
  ];

  return (
    <>
      {score === null ? (
        <p className="mt-4 text-sm leading-relaxed">{t("raiseWeights")}</p>
      ) : (
        <>
          <p className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
            <CountUp value={score} />
            <span className="pb-2 font-mono text-sm text-muted tabular-nums">/ 100</span>
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted">{t("partialPointScore")}</p>
          <p className="mt-3 text-sm leading-relaxed">{t("resemblesClimate", { score, name: targetLabel.name })}</p>
        </>
      )}
      {probe.elevation !== null && probe.elevation <= 0 ? (
        <p className="mt-3 border border-line px-3 py-2 text-sm leading-relaxed text-muted">{t("oceanWarning")}</p>
      ) : null}

      <section className="mt-4 border-t border-line pt-3">
        <h4 className="display text-2xl text-muted">{t("realData")}</h4>
        <dl className="mt-2 border-t border-line">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-mono text-sm tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          {t("climateSentence", { frio, aridez })}
        </p>
      </section>

      {near ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">{t("nearestKnown")}</h4>
          <p className="mt-2 text-sm">
            {near.site.name}
            <span className="font-mono text-muted"> · {formatKm(near.km)}</span>
          </p>
          <button
            type="button"
            onClick={() => onGoToSite(near.site)}
            className="kicker mt-3 border border-accent px-3 py-2 text-accent"
          >
            {t("goToSite")}
          </button>
        </section>
      ) : null}

      <p className="mt-4 text-[11px] leading-relaxed text-muted">{t("powerCellNote")}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        <a
          href={powerPointUrl(probe.queryLat, probe.queryLng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2"
        >
          {t("powerSource")}
        </a>
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={saved}
        className="kicker mt-4 border border-line px-3 py-2 hover:border-accent hover:text-accent disabled:text-muted"
      >
        {saved ? t("savedCandidate") : t("saveCandidate")}
      </button>
    </>
  );
}
