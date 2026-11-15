"use client";

import { useI18n } from "@/components/LocaleProvider";
import { DIMS, type Profile } from "@/lib/data";
import { dimShort } from "@/lib/i18n";

function point(index: number, value: number, radius: number, cx: number, cy: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DIMS.length;
  const span = (Math.max(0, Math.min(10, value)) / 10) * radius;
  return [cx + span * Math.cos(angle), cy + span * Math.sin(angle)] as const;
}

function polygon(values: number[], radius: number, cx: number, cy: number) {
  return values.map((value, index) => point(index, value, radius, cx, cy).join(",")).join(" ");
}

function knownRuns(values: Array<number | null>): number[][] {
  const runs: number[][] = [];
  let current: number[] = [];
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) runs.push(current);
      current = [];
      return;
    }
    current.push(index);
  });
  if (current.length > 0) runs.push(current);
  if (runs.length > 1 && values[0] !== null && values[values.length - 1] !== null) {
    const first = runs[0];
    const last = runs[runs.length - 1];
    runs[0] = [...last, ...first];
    runs.pop();
  }
  return runs;
}

export default function RadarChart({
  earth,
  target,
  targetName,
  known,
}: {
  earth: Profile;
  target: Profile;
  targetName: string;
  known?: boolean[];
}) {
  const { locale, t } = useI18n();
  const cx = 140;
  const cy = 132;
  const radius = 78;
  const earthKnown = known ?? DIMS.map(() => true);
  const earthValues = DIMS.map((dim, index) => (earthKnown[index] === false ? null : (earth[dim.key] ?? 0)));
  const earthComplete = earthValues.every((value) => value !== null);
  const targetValues = DIMS.map((dim) => target[dim.key] ?? 0);

  return (
    <figure>
      <svg viewBox="0 0 280 276" role="img" aria-label={t("radarAria", { name: targetName })} className="mx-auto w-full max-w-[280px]">
        {Array.from({ length: 5 }, (_, ring) => {
          const ringRadius = ((ring + 1) / 5) * radius;
          const path = DIMS.map((_, index) => point(index, 10, ringRadius, cx, cy).join(",")).join(" ");
          return <polygon key={ring} points={path} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />;
        })}
        {DIMS.map((dim, index) => {
          const [x, y] = point(index, 10, radius, cx, cy);
          const [lx, ly] = point(index, 10, radius + 18, cx, cy);
          return (
            <g key={dim.key}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#7a7a7a"
                fontSize="9"
                fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              >
                {dimShort(locale, dim.key)}
              </text>
            </g>
          );
        })}
        {earthComplete ? (
          <polygon
            points={polygon(earthValues as number[], radius, cx, cy)}
            fill="rgba(215,215,215,0.08)"
            stroke="#d7d7d7"
            strokeWidth="1.25"
          />
        ) : (
          knownRuns(earthValues).map((run) => (
            <polyline
              key={run.join("-")}
              points={run
                .map((index) => point(index, earthValues[index] ?? 0, radius, cx, cy).join(","))
                .join(" ")}
              fill="none"
              stroke="#d7d7d7"
              strokeWidth="1.25"
            />
          ))
        )}
        <polygon points={polygon(targetValues, radius, cx, cy)} fill="var(--accent)" fillOpacity="0.12" stroke="var(--accent)" strokeWidth="1.25" />
      </svg>
      <figcaption className="mt-1 flex justify-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-1.5 w-1.5 bg-[#d7d7d7]" />
          {t("earth")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-1.5 w-1.5 bg-accent" />
          {targetName}
        </span>
      </figcaption>
    </figure>
  );
}
