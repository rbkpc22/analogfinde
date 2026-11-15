"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutDialog from "@/components/AboutDialog";
import AnalogMap from "@/components/AnalogMap";
import WelcomeScreen from "@/components/WelcomeScreen";
import { DIMS, LIMITES, SITES, TARGETS, type DimKey, type Site, type Target } from "@/lib/data";
import { categoryLabel, earthProfile, nasaRecord, powerQueryUrl } from "@/lib/nasa";
import {
  analogyLists,
  dimensionDiffs,
  initialWeights,
  scoreColor,
  scoreSite,
  type Weights,
} from "@/lib/score";
import type { FlyTarget } from "@/lib/view";

function bodyLabel(body: Target["body"], upper = false) {
  if (body === "luna") return upper ? "LUNA" : "Luna";
  return upper ? "MARTE" : "Marte";
}

function SourceTag({ dim, site }: { dim: DimKey; site?: Site }) {
  const nasa = categoryLabel(dim, site) === "Dato NASA";
  return (
    <span
      className={`inline-block rounded-full px-1.5 py-px align-middle text-[9px] font-semibold tracking-wide ${
        nasa ? "bg-earth/15 text-earth" : "bg-line text-muted"
      }`}
    >
      {nasa ? "Dato NASA" : "Estimado"}
    </span>
  );
}

function measure(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

function Mark() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#121829" stroke="#27314d" />
      <circle cx="16" cy="21" r="7" fill="#C9D1E6" />
      <circle cx="26" cy="16" r="4.5" fill="#E0703A" />
      <circle cx="30" cy="10" r="1.3" fill="#E9F542" />
    </svg>
  );
}

function openingSelection(): string | null {
  const target = TARGETS[0];
  const weights = initialWeights();
  const ranked = [...SITES].sort(
    (a, b) => scoreSite(b, target, weights) - scoreSite(a, target, weights),
  );
  return ranked[0]?.name ?? null;
}

export default function AnalogFinder() {
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const [weights, setWeights] = useState<Weights>(initialWeights);
  const [onlyNew, setOnlyNew] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(openingSelection);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const seq = useRef(0);
  const detailRef = useRef<HTMLDivElement>(null);
  const aboutButtonRef = useRef<HTMLButtonElement>(null);
  const followSelection = useRef(false);

  const target = TARGETS.find((item) => item.id === targetId) ?? TARGETS[0];

  const mapSites = useMemo(
    () =>
      SITES.map((site) => ({
        ...site,
        score: scoreSite(site, target, weights),
        visible: !onlyNew || site.nuevo,
      })),
    [onlyNew, target, weights],
  );

  const ranked = useMemo(
    () => mapSites.filter((site) => site.visible).sort((a, b) => b.score - a.score),
    [mapSites],
  );

  const selected = SITES.find((site) => site.name === selectedName) ?? null;

  const selectSite = useCallback((site: Site) => {
    followSelection.current = true;
    seq.current += 1;
    setSelectedName(site.name);
    setFlyTarget({ lat: site.lat, lng: site.lng, seq: seq.current });
  }, []);

  const closeWelcome = useCallback(() => setShowWelcome(false), []);

  const closeAbout = useCallback(() => {
    setAboutOpen(false);
    aboutButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!selectedName || !followSelection.current) return;
    followSelection.current = false;
    const narrow = window.matchMedia("(max-width: 1000px)").matches;
    if (narrow) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document
      .querySelector(`[data-site="${CSS.escape(selectedName)}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedName]);

  return (
    <div className="starfield flex h-dvh flex-col overflow-hidden max-[1000px]:h-auto max-[1000px]:min-h-dvh max-[1000px]:overflow-x-hidden max-[1000px]:overflow-y-visible">
      <header className="relative z-20 border-b border-line/80 bg-[#0e1322]/92 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Mark />
              <div className="min-w-0">
                <p className="truncate font-mono text-[10px] tracking-[0.18em] text-accent uppercase sm:tracking-[0.22em]">
                  NASA Space Apps Challenge 2026
                </p>
                <h1 className="font-display text-2xl leading-none font-semibold tracking-tight">
                  Analog<span className="text-accent">Finder</span>
                </h1>
              </div>
            </div>
            <button
              ref={aboutButtonRef}
              type="button"
              onClick={() => setAboutOpen(true)}
              className="shrink-0 rounded-full border border-line px-3 py-2 text-xs font-medium text-ink transition hover:border-accent hover:text-accent sm:text-sm"
            >
              Acerca del proyecto
            </button>
          </div>
          <div className="lg:max-w-md lg:text-right">
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
              Centro de control de misión
            </p>
            <p className="text-sm text-muted">
              ¿Qué lugar de la Tierra se parece más a la Luna o a Marte… y en qué no?
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
      </header>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 min-[1001px]:grid-cols-[minmax(280px,340px)_minmax(0,1fr)_minmax(300px,400px)]">
        <aside className="scroll-thin border-line/80 bg-panel/88 min-[1001px]:overflow-y-auto min-[1001px]:border-r">
          <div className="space-y-5 p-4 sm:p-5">
            <section>
              <h2 className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                1 · Elige un objetivo
              </h2>
              <div className="grid gap-2">
                {TARGETS.map((item) => {
                  const active = item.id === target.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTargetId(item.id)}
                      className={`rounded-xl border bg-panel-2 px-3 py-2.5 text-left transition duration-200 ${
                        active
                          ? "border-accent shadow-[inset_0_0_0_1px_#e9f542,0_0_24px_rgba(233,245,66,0.08)]"
                          : "border-line hover:border-muted/50"
                      }`}
                    >
                      <span
                        className={`mr-1.5 inline-block rounded-full px-1.5 py-px text-[10px] font-semibold text-[#111] ${
                          item.body === "luna" ? "bg-moon" : "bg-mars"
                        }`}
                      >
                        {bodyLabel(item.body, true)}
                      </span>
                      <span className="text-sm">{item.name}</span>
                      <small className="mt-0.5 block text-[11px] text-muted">{item.sub}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                2 · ¿Qué te importa más?
              </h2>
              <p className="mb-2 text-[11px] text-muted">0 ignora la categoría · 3 la prioriza</p>
              <div className="space-y-2.5">
                {DIMS.map((dim) => (
                  <label key={dim.key} className="grid grid-cols-[minmax(0,1fr)_92px_1.4rem] items-center gap-2 text-xs">
                    <span className="leading-tight">
                      {dim.name} <SourceTag dim={dim.key} />
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={1}
                      value={weights[dim.key]}
                      aria-label={dim.name}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setWeights((current) => ({ ...current, [dim.key]: value }));
                      }}
                    />
                    <b className="text-right font-mono text-sm text-accent">{weights[dim.key]}</b>
                  </label>
                ))}
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(event) => setOnlyNew(event.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Solo lugares poco estudiados
              </label>
            </section>

            <p className="border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
              Versión 0.1 · Frío y aridez de cada lugar se calculan con la climatología de NASA POWER. Las
              demás categorías (0–10) siguen siendo estimaciones del equipo a partir de la literatura.
              Próximo paso: calcularlas con datos abiertos de NASA (MODIS, NASADEM, Landsat, LRO
              LOLA/Diviner, MOLA, CRISM).
            </p>
          </div>
        </aside>

        <section className="relative h-[52vh] min-h-[280px] border-line/80 min-[1001px]:h-full min-[1001px]:min-h-0 max-[1000px]:border-y sm:h-[58vh] sm:min-h-[320px]">
          <AnalogMap
            sites={mapSites}
            selectedName={selectedName}
            flyTarget={flyTarget}
            onSelect={selectSite}
          />
          <div className="pointer-events-none absolute inset-0 z-[400] shadow-[inset_0_0_90px_rgba(7,11,20,0.5)]" />
          <div className="pointer-events-none absolute top-3 left-3 z-[500] max-w-[min(68%,280px)] rounded-2xl border border-line/80 bg-canvas/80 px-3 py-2 backdrop-blur-md max-[640px]:max-w-[58%] max-[640px]:px-2.5 max-[640px]:py-1.5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Objetivo</p>
            <p className="text-sm leading-snug font-semibold max-[640px]:text-xs">{target.name}</p>
            <span
              className={`mt-1 inline-block rounded-full px-1.5 py-px text-[10px] font-semibold text-[#111] ${
                target.body === "luna" ? "bg-moon" : "bg-mars"
              }`}
            >
              {bodyLabel(target.body, true)}
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-2xl border border-line/80 bg-canvas/80 px-3 py-2 text-[11px] text-muted backdrop-blur-md max-[640px]:right-3 max-[640px]:bottom-7 max-[640px]:px-2.5 max-[640px]:py-1.5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.14em] uppercase max-[640px]:sr-only">Puntaje</p>
            <ul className="space-y-1 max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:gap-x-3 max-[640px]:gap-y-1 max-[640px]:space-y-0">
              <li className="flex items-center gap-2">
                <i className="inline-block h-2.5 w-2.5 rounded-full bg-ok" /> ≥ 80 muy parecido
              </li>
              <li className="flex items-center gap-2">
                <i className="inline-block h-2.5 w-2.5 rounded-full bg-accent" /> ≥ 65 parecido
              </li>
              <li className="flex items-center gap-2">
                <i className="inline-block h-2.5 w-2.5 rounded-full bg-[#f5a142]" /> ≥ 50 parcial
              </li>
              <li className="flex items-center gap-2">
                <i className="inline-block h-2.5 w-2.5 rounded-full bg-bad" /> &lt; 50 bajo
              </li>
            </ul>
            <p className="mt-1.5 text-[10px] max-[640px]:hidden">El tamaño sigue el puntaje</p>
          </div>
        </section>

        <aside className="scroll-thin flex min-h-0 flex-col bg-panel/88 min-[1001px]:h-full min-[1001px]:overflow-hidden min-[1001px]:border-l min-[1001px]:border-line/80">
          <div className="px-4 pt-4 sm:px-5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                Lugares más parecidos
              </h2>
              <p className="font-mono text-[11px] text-muted">
                {ranked.length} de {SITES.length}
              </p>
            </div>
          </div>
          <ol className="scroll-thin max-h-72 space-y-0.5 overflow-y-auto px-3 pb-2 min-[1001px]:max-h-[34%]">
            {ranked.map((site, index) => {
              const active = site.name === selectedName;
              return (
                <li key={site.name}>
                  <button
                    type="button"
                    data-site={site.name}
                    onClick={() => selectSite(site)}
                    className={`grid w-full grid-cols-[1.4rem_minmax(0,1fr)_2.6rem] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition duration-200 ${
                      active ? "bg-panel-2 shadow-[inset_3px_0_0_#e9f542]" : "hover:bg-panel-2/80"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-muted">{index + 1}</span>
                    <span className="min-w-0 leading-snug">
                      {site.name}
                      {site.estado === "candidato" ? (
                        <span className="ml-1.5 inline-block rounded-full border border-accent/70 px-1.5 py-px align-middle text-[9px] font-bold tracking-wide text-accent uppercase">
                          Candidato
                        </span>
                      ) : site.nuevo ? (
                        <span className="ml-1.5 inline-block rounded-full bg-accent px-1.5 py-px align-middle text-[9px] font-bold text-[#111]">
                          NUEVO
                        </span>
                      ) : null}
                    </span>
                    <span
                      className="text-right font-mono text-sm font-bold"
                      style={{ color: scoreColor(site.score) }}
                    >
                      {site.score}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div ref={detailRef} className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-5 sm:px-5">
            <h2 className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Detalle</h2>
            {selected ? (
              <Detail site={selected} target={target} weights={weights} />
            ) : (
              <p className="rounded-2xl border border-dashed border-line bg-panel-2/50 px-4 py-8 text-center text-sm text-muted">
                Haz clic en un lugar del mapa o de la lista.
              </p>
            )}
          </div>
        </aside>
      </div>
      {showWelcome ? <WelcomeScreen onDone={closeWelcome} /> : null}
      {aboutOpen ? <AboutDialog onClose={closeAbout} /> : null}
    </div>
  );
}

function Detail({ site, target, weights }: { site: Site; target: Target; weights: Weights }) {
  const score = scoreSite(site, target, weights);
  const color = scoreColor(score);
  const diffs = dimensionDiffs(site, target, weights);
  const { parecidos, fallas } = analogyLists(diffs);
  const cuerpo = target.body === "luna" ? "la Luna" : "Marte";

  return (
    <article
      key={`${site.name}-${target.id}`}
      className="rise rounded-2xl border border-line bg-panel-2 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
    >
      <h3 className="font-display text-lg leading-tight font-semibold">{site.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {site.estado === "candidato" ? (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#111] uppercase">
            Candidato
          </span>
        ) : null}
        {site.analogoDe?.map((body) => (
          <span
            key={body}
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#111] ${
              body.toLowerCase() === "marte" ? "bg-mars" : "bg-moon"
            }`}
          >
            {body}
          </span>
        ))}
      </div>
      {site.tipoAnalogo ? <p className="mt-2 text-sm text-muted">{site.tipoAnalogo}</p> : null}
      <p className="mt-1 text-xs text-muted">
        {site.where}
        {site.nuevo && site.estado !== "candidato" ? " · poco estudiado como análogo" : ""}
      </p>
      <p className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
        <span
          className="font-mono text-5xl leading-none font-extrabold"
          style={{ color, textShadow: `0 0 28px ${color}66` }}
        >
          {score}
        </span>
        <span className="pb-1 text-sm text-muted">/ 100 de parecido con {target.name}</span>
      </p>
      {!site.p && site.similitud ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Este puntaje es el promedio de la similitud del expediente (terreno, suelo, clima, vida y
          aislamiento). Todavía no usa las 9 categorías con peso.
        </p>
      ) : null}

      {site.desc ? <p className="mt-3 text-sm leading-relaxed">{site.desc}</p> : null}

      <Dossier site={site} />

      {diffs.length > 0 ? (
        <>
          <h4 className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Se parece en</h4>
          <ul className="ok-list">
            {parecidos.length > 0 ? (
              parecidos.map((item) => (
                <li key={item.key}>
                  {item.name} <SourceTag dim={item.key} site={site} />
                </li>
              ))
            ) : (
              <li>Ninguna categoría muy cercana</li>
            )}
          </ul>

          <h4 className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Dónde falla la analogía
          </h4>
          <ul className="fail-list">
            {fallas.map((item) => (
              <li key={item.key}>
                {item.name} <SourceTag dim={item.key} site={site} />:{" "}
                {item.earth > item.target ? "mucho más" : "mucho menos"} que en {cuerpo}
              </li>
            ))}
            <li>{LIMITES[target.body]}</li>
          </ul>
        </>
      ) : null}

      {site.pruebas && site.pruebas.length > 0 ? null : site.prueba ? (
        <>
          <h4 className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Qué se podría probar aquí
          </h4>
          <p className="mt-1 text-sm leading-relaxed">{site.prueba}</p>
        </>
      ) : null}

      <NasaPower site={site} />

      {diffs.length > 0 ? (
        <>
          <h4 className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Comparación por categoría
          </h4>
          <div className="mt-2 space-y-2.5">
            {diffs.map((item) => (
              <div key={item.key}>
                <div className="flex justify-between gap-3 text-[11px] text-muted">
                  <span>
                    {item.name} <SourceTag dim={item.key} site={site} />
                  </span>
                  <span className="font-mono">
                    {item.earth} vs {item.target}
                  </span>
                </div>
                <div className="relative mt-1 h-2 rounded-full bg-canvas">
                  <div
                    className="absolute top-0 left-0 h-2 rounded-full bg-earth"
                    style={{ width: `${item.earth * 10}%` }}
                  />
                  <div
                    className="absolute -top-[3px] h-3.5 w-[3px] rounded-sm bg-accent"
                    style={{ left: `calc(${item.target * 10}% - 1px)` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2 w-2.5 rounded-sm bg-earth" />
              Tierra
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2 w-2.5 rounded-sm bg-accent" />
              {bodyLabel(target.body)}
            </span>
          </div>
        </>
      ) : null}
    </article>
  );
}

function Dossier({ site }: { site: Site }) {
  const hasFacts = site.altitud || site.ubicacion || site.tipoTerreno;
  if (
    !hasFacts &&
    !site.geologia?.length &&
    !site.comparacion &&
    !site.pruebas?.length &&
    !site.limitaciones?.length &&
    !site.verificacionNasa?.length &&
    !site.fuentes?.length &&
    !site.proyectos?.length
  ) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {hasFacts ? (
        <dl className="grid gap-2 text-sm">
          {site.altitud ? (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Altitud</dt>
              <dd className="mt-0.5 leading-relaxed">{site.altitud}</dd>
            </div>
          ) : null}
          {site.ubicacion ? (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Ubicación</dt>
              <dd className="mt-0.5 leading-relaxed">{site.ubicacion}</dd>
            </div>
          ) : null}
          {site.tipoTerreno ? (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Tipo de terreno</dt>
              <dd className="mt-0.5 leading-relaxed">{site.tipoTerreno}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <FactList title="Geología" items={site.geologia} />

      {site.comparacion ? (
        <section>
          <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Comparación</h4>
          <p className="mt-1 text-sm font-semibold">{site.comparacion.lugar}</p>
          <p className="mt-1 text-sm leading-relaxed">{site.comparacion.explicacion}</p>
        </section>
      ) : null}

      <FactList title="Pruebas que permite" items={site.pruebas} />
      <FactList title="Limitaciones" items={site.limitaciones} />

      {site.verificacionNasa && site.verificacionNasa.length > 0 ? (
        <section>
          <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Cómo verificarlo con datos de NASA
          </h4>
          <ul className="mt-1 space-y-1.5 text-sm leading-relaxed">
            {site.verificacionNasa.map((item) => (
              <li key={item.recurso}>
                <span className="font-semibold">{item.recurso}.</span> {item.uso}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <FactList title="Fuentes" items={site.fuentes} />
      <FactList title="Proyectos recomendados" items={site.proyectos} />
    </div>
  );
}

function FactList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h4 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">{title}</h4>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function NasaPower({ site }: { site: Site }) {
  const climate = nasaRecord(site);
  if (!climate) return null;
  const profile = earthProfile(site);
  const rows = [
    ["Temperatura media anual", measure(climate.T2M, "°C")],
    ["Temperatura máxima", measure(climate.T2M_MAX, "°C")],
    ["Temperatura mínima", measure(climate.T2M_MIN, "°C")],
    ["Precipitación", measure(climate.PRECTOTCORR, "mm/día")],
  ] as const;

  return (
    <section className="mt-4 rounded-xl border border-earth/30 bg-canvas/50 p-3">
      <h4 className="text-[11px] font-semibold tracking-[0.16em] text-earth uppercase">
        Datos reales · NASA POWER
      </h4>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-panel/80 px-2.5 py-2">
            <dt className="text-[10px] leading-tight text-muted">{label}</dt>
            <dd className="mt-0.5 font-mono text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Frío {profile.frio}/10 con la temperatura media y aridez {profile.aridez}/10 con la precipitación.
        El valor anual de la máxima es el mes más cálido y el de la mínima, el mes más frío. Las demás
        categorías siguen siendo estimaciones.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        Fuente:{" "}
        <a
          href={powerQueryUrl(site)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2"
        >
          NASA POWER
        </a>
        {" · climatología por punto, comunidad RE."}
      </p>
    </section>
  );
}
