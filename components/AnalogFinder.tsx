"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutDialog from "@/components/AboutDialog";
import AnalogMap from "@/components/AnalogMap";
import PlanetGame from "@/components/PlanetGame";
import PointPanel from "@/components/PointPanel";
import RadarChart from "@/components/RadarChart";
import WelcomeScreen from "@/components/WelcomeScreen";
import { DIMS, LIMITES, SITES, TARGETS, type DimKey, type Site, type Target } from "@/lib/data";
import { MISSIONS, sameWeights } from "@/lib/missions";
import {
  cachedPowerPoint,
  categoryKnown,
  categoryLabel,
  earthProfile,
  fetchPowerPoint,
  nasaRecord,
  powerPointUrl,
  powerQueryUrl,
  rememberPowerPoint,
} from "@/lib/nasa";
import {
  cacheKey,
  climateScore,
  formatCoord,
  loadCandidates,
  roundCoord,
  saveCandidates,
  type Candidate,
  type Probe,
} from "@/lib/point";
import {
  analogyLists,
  dimensionDiffs,
  initialWeights,
  partialScoreLabel,
  scoreSite,
  type Weights,
} from "@/lib/score";
import type { Round } from "@/lib/game";
import type { FlyTarget } from "@/lib/view";

function BodyTag({ body }: { body: string }) {
  const mars = body.toLowerCase().startsWith("mar");
  return (
    <span className="kicker inline-flex items-center gap-1.5 text-ink">
      <i
        className="inline-block h-1.5 w-1.5 shrink-0"
        style={{ background: mars ? "var(--marte)" : "var(--luna)" }}
      />
      {mars ? "MARTE" : "LUNA"}
    </span>
  );
}

function SourceTag({ dim, site, missing }: { dim: DimKey; site?: Site; missing?: boolean }) {
  if (missing) {
    return <span className="kicker mt-0.5 block w-fit whitespace-nowrap text-muted">~ Sin dato</span>;
  }
  const nasa = categoryLabel(dim, site) === "Dato NASA";
  return (
    <span className={`kicker mt-0.5 block w-fit whitespace-nowrap ${nasa ? "text-accent" : "text-muted"}`}>
      {nasa ? "▲ Dato NASA" : "~ Estimado"}
    </span>
  );
}

function measure(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

function Mark() {
  return <img src="/logo.png?v=2" alt="" width={56} height={56} className="h-14 w-14 shrink-0" />;
}

function scoreInk(score: number) {
  return 0.3 + (0.7 * Math.max(0, Math.min(100, score))) / 100;
}

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

  return (
    <span className="display text-[72px] leading-none text-accent tabular-nums">{shown}</span>
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
  const [gameOpen, setGameOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [probe, setProbe] = useState<Probe | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const seq = useRef(0);
  const analyzeSeq = useRef(0);
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
    analyzeSeq.current += 1;
    setProbe(null);
    setSelectedName(site.name);
    setFlyTarget({ lat: site.lat, lng: site.lng, seq: seq.current });
  }, []);

  const closeWelcome = useCallback(() => setShowWelcome(false), []);

  useEffect(() => {
    setCandidates(loadCandidates());
  }, []);

  useEffect(() => {
    if (!probe) return;
    if (window.matchMedia("(max-width: 1000px)").matches) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [probe]);

  useEffect(() => {
    if (!analyzing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !aboutOpen && !gameOpen) setAnalyzing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, analyzing, gameOpen]);

  const analyzePoint = useCallback((lat: number, lng: number) => {
    const queryLat = roundCoord(lat);
    const queryLng = roundCoord(lng);
    const request = ++analyzeSeq.current;
    const cached = cachedPowerPoint(queryLat, queryLng);
    if (cached) {
      setSelectedName(null);
      setProbe({
        status: "ready",
        lat,
        lng,
        queryLat,
        queryLng,
        climate: cached.climate,
        elevation: cached.elevation,
      });
      return;
    }
    setSelectedName(null);
    setProbe({ status: "loading", lat, lng, queryLat, queryLng });
    fetchPowerPoint(queryLat, queryLng)
      .then((sample) => {
        if (analyzeSeq.current !== request) return;
        setProbe({
          status: "ready",
          lat,
          lng,
          queryLat,
          queryLng,
          climate: sample.climate,
          elevation: sample.elevation,
        });
      })
      .catch(() => {
        if (analyzeSeq.current !== request) return;
        setProbe({ status: "error", lat, lng, queryLat, queryLng });
      });
  }, []);

  const openCandidate = useCallback((id: string) => {
    const candidate = candidates.find((item) => item.id === id);
    if (!candidate) return;
    analyzeSeq.current += 1;
    rememberPowerPoint(candidate.queryLat, candidate.queryLng, {
      climate: candidate.climate,
      elevation: candidate.elevation,
    });
    setSelectedName(null);
    setProbe({
      status: "ready",
      lat: candidate.lat,
      lng: candidate.lng,
      queryLat: candidate.queryLat,
      queryLng: candidate.queryLng,
      climate: candidate.climate,
      elevation: candidate.elevation,
    });
    seq.current += 1;
    setFlyTarget({ lat: candidate.lat, lng: candidate.lng, seq: seq.current });
  }, [candidates]);

  const saveProbe = useCallback(() => {
    if (!probe || probe.status !== "ready") return;
    const candidate: Candidate = {
      id: cacheKey(probe.queryLat, probe.queryLng),
      lat: probe.lat,
      lng: probe.lng,
      queryLat: probe.queryLat,
      queryLng: probe.queryLng,
      climate: probe.climate,
      elevation: probe.elevation,
    };
    setCandidates((current) => {
      if (current.some((item) => item.id === candidate.id)) return current;
      const next = [candidate, ...current];
      saveCandidates(next);
      return next;
    });
  }, [probe]);

  const removeCandidate = useCallback((id: string) => {
    setCandidates((current) => {
      const next = current.filter((item) => item.id !== id);
      saveCandidates(next);
      return next;
    });
    setProbe((current) => (current && cacheKey(current.queryLat, current.queryLng) === id ? null : current));
  }, []);

  const closeAbout = useCallback(() => {
    setAboutOpen(false);
    aboutButtonRef.current?.focus();
  }, []);

  const showRound = useCallback(
    (round: Round) => {
      setGameOpen(false);
      if (round.planet === "tierra" && round.siteName) {
        const site = SITES.find((item) => item.name === round.siteName);
        if (site) selectSite(site);
        return;
      }
      if (round.targetId) setTargetId(round.targetId);
    },
    [selectSite],
  );

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
    <div
      className="starfield flex h-dvh flex-col overflow-hidden max-[1000px]:h-auto max-[1000px]:min-h-dvh max-[1000px]:overflow-x-hidden max-[1000px]:overflow-y-visible"
      style={{ "--accent": target.body === "luna" ? "#E6EEF5" : "#FF5A1F" } as React.CSSProperties}
    >
      <header className={`relative z-20 border-b border-line bg-panel/95 ${showWelcome ? "hidden" : ""}`}>
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Mark />
              <div className="min-w-0">
                <p className="kicker truncate text-muted">NASA Space Apps Challenge 2026</p>
                <h1 className="display text-2xl leading-none">AnalogFinder</h1>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setGameOpen(true)}
                className="kicker border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent"
              >
                ¿Tierra, Luna o Marte?
              </button>
              <button
                ref={aboutButtonRef}
                type="button"
                onClick={() => setAboutOpen(true)}
                className="kicker border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent"
              >
                Acerca del proyecto
              </button>
            </div>
          </div>
          <div className="lg:max-w-md lg:text-right">
            <p className="kicker text-muted">Centro de control de misión</p>
            <p className="text-sm text-muted">
              ¿Qué lugar de la Tierra se parece más a la Luna o a Marte… y en qué no?
            </p>
          </div>
        </div>
        <div className="h-px bg-accent" />
      </header>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 min-[1001px]:grid-cols-[minmax(280px,340px)_minmax(0,1fr)_minmax(300px,400px)]">
        <aside className={`scroll-thin border-line/80 bg-panel/88 min-[1001px]:overflow-y-auto min-[1001px]:border-r ${showWelcome ? "hidden" : ""}`}>
          <div className="space-y-5 p-4 sm:p-5">
            <section>
              <h2 className="display mb-2 text-2xl text-muted">1 · Elige un objetivo</h2>
              <div className="border-t border-line">
                {TARGETS.map((item) => {
                  const active = item.id === target.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTargetId(item.id)}
                      className={`block w-full border-b border-line px-2 py-2.5 text-left ${
                        active ? "border-l-2 border-l-accent bg-white/[0.03]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <BodyTag body={item.body} />
                      <span className="mt-1 block text-sm">{item.name}</span>
                      <small className="mt-0.5 block text-[11px] text-muted">{item.sub}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="display mb-2 text-2xl text-muted">¿Qué quieres probar?</h2>
              <div className="border-t border-line">
                {MISSIONS.map((mission) => {
                  const active = sameWeights(weights, mission.weights);
                  return (
                    <button
                      key={mission.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setWeights(mission.weights)}
                      className={`block w-full border-b border-line px-2 py-2.5 text-left text-sm ${
                        active ? "border-l-2 border-l-accent bg-white/[0.03]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {mission.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="display mb-1 text-2xl text-muted">2 · ¿Qué te importa más?</h2>
              <p className="mb-2 text-[11px] text-muted">0 ignora la categoría · 3 la prioriza</p>
              <div className="space-y-2.5">
                {DIMS.map((dim) => (
                  <label key={dim.key} className="grid grid-cols-[minmax(0,1fr)_92px_1.4rem] items-center gap-2 text-xs">
                    <span className="block leading-tight">
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
                    <b className="text-right font-mono text-sm text-accent tabular-nums">{weights[dim.key]}</b>
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

        <section
          className={
            showWelcome
              ? "intro-globe fixed top-1/2 z-[60] -translate-y-1/2 max-md:left-1/2 max-md:-translate-x-1/2 md:left-[70%] md:-translate-x-1/2"
              : "relative h-[52vh] min-h-[280px] border-line/80 min-[1001px]:h-full min-[1001px]:min-h-0 max-[1000px]:border-y sm:h-[58vh] sm:min-h-[320px]"
          }
          style={showWelcome ? { width: "min(100dvh, 100vw)", height: "min(100dvh, 100vw)" } : undefined}
        >
          <AnalogMap
            sites={mapSites}
            selectedName={selectedName}
            flyTarget={flyTarget}
            accent={target.body === "luna" ? "#E6EEF5" : "#FF5A1F"}
            analyzing={analyzing}
            probe={probe}
            candidates={candidates}
            onSelect={selectSite}
            onAnalyze={(lat, lng) => analyzePoint(lat, lng)}
            onOpenCandidate={openCandidate}
          />
          <div className="pointer-events-none absolute inset-0 z-[400]" />
          {showWelcome ? null : (
            <>
          <button
            type="button"
            aria-pressed={analyzing}
            onClick={() => setAnalyzing((current) => !current)}
            className={`absolute top-16 right-2.5 z-[500] border px-3 py-2 font-mono text-[11px] tracking-[0.08em] uppercase max-[640px]:top-14 max-[640px]:px-2 ${
              analyzing ? "border-accent bg-panel text-accent" : "border-line bg-panel/90 text-ink hover:border-accent"
            }`}
          >
            ⌖ Analizar un punto
          </button>
          {analyzing ? (
            <p className="pointer-events-none absolute top-28 right-2.5 z-[500] max-w-56 border border-line bg-[#050505] px-3 py-2 text-right font-mono text-[11px] leading-snug tracking-[0.04em] text-ink max-[640px]:top-24 max-[640px]:max-w-40">
              Da clic en cualquier lugar del planeta
            </p>
          ) : null}
          <div className="brackets pointer-events-none absolute top-3 left-3 z-[500] max-w-[min(68%,280px)] border border-line bg-panel/90 px-3 py-2 max-[640px]:max-w-[58%] max-[640px]:px-2.5 max-[640px]:py-1.5">
            <p className="kicker text-muted">Objetivo</p>
            <p className="text-sm leading-snug font-medium max-[640px]:text-xs">{target.name}</p>
            <span className="mt-1 inline-flex">
              <BodyTag body={target.body} />
            </span>
          </div>
          <div className="brackets pointer-events-none absolute bottom-10 left-3 z-[500] w-44 border border-line bg-panel/90 px-3 py-2 max-[640px]:right-auto max-[640px]:bottom-9 max-[640px]:w-36 max-[640px]:px-2.5">
            <p className="kicker mb-2 text-muted">Puntaje</p>
            <div
              className="h-1.5 w-full"
              style={{
                background: "linear-gradient(90deg, color-mix(in srgb, var(--accent) 30%, transparent), var(--accent))",
              }}
            />
            <div className="relative mt-1 h-4 font-mono text-[11px] text-muted tabular-nums">
              <span className="absolute left-0">0</span>
              <span className="absolute left-1/2 -translate-x-1/2">50</span>
              <span className="absolute left-[80%] -translate-x-1/2">80</span>
              <span className="absolute right-0">100</span>
            </div>
          </div>
            </>
          )}
        </section>

        <aside className={`scroll-thin flex min-h-0 flex-col bg-panel/88 min-[1001px]:h-full min-[1001px]:overflow-hidden min-[1001px]:border-l min-[1001px]:border-line/80 ${showWelcome ? "hidden" : ""}`}>
          <div className="px-4 pt-4 sm:px-5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="display text-2xl text-muted">Lugares más parecidos</h2>
              <p className="font-mono text-[11px] text-muted tabular-nums">
                {ranked.length} de {SITES.length}
              </p>
            </div>
          </div>
          <div className="scroll-thin max-h-72 overflow-y-auto border-t border-line min-[1001px]:max-h-[34%]">
          <ol>
            {ranked.map((site, index) => {
              const active = site.name === selectedName;
              return (
                <li key={site.name} className="border-b border-line">
                  <button
                    type="button"
                    data-site={site.name}
                    onClick={() => selectSite(site)}
                    className={`grid w-full grid-cols-[1.4rem_minmax(0,1fr)_2.6rem] items-center gap-2 px-4 py-2 text-left text-sm sm:px-5 ${
                      active ? "border-l-2 border-l-accent bg-white/[0.04]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-muted tabular-nums">{index + 1}</span>
                    <span className="min-w-0 leading-snug">
                      <span>
                        {site.name}
                        <SiteMark site={site} className="ml-2" />
                      </span>
                      {partialScoreLabel(site) ? (
                        <span className="mt-0.5 block font-mono text-[10px] leading-snug tracking-[0.04em] text-muted">
                          {partialScoreLabel(site)}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className="text-right font-mono text-sm font-medium text-accent tabular-nums"
                      style={{ opacity: scoreInk(site.score) }}
                    >
                      {site.score}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
            {candidates.length > 0 ? (
              <section className="border-t border-line px-4 py-3 sm:px-5">
                <h3 className="display text-xl text-muted">Mis candidatos</h3>
                <ul className="mt-2">
                  {candidates.map((candidate) => {
                    const score = climateScore(candidate.climate, target, weights);
                    const active =
                      probe?.status === "ready" &&
                      probe.queryLat === candidate.queryLat &&
                      probe.queryLng === candidate.queryLng;
                    return (
                      <li key={candidate.id} className="flex items-center gap-2 border-b border-line py-2">
                        <button
                          type="button"
                          onClick={() => openCandidate(candidate.id)}
                          className={`min-w-0 flex-1 text-left ${active ? "text-accent" : ""}`}
                        >
                          <span className="block font-mono text-[11px] tabular-nums">{formatCoord(candidate.lat, candidate.lng)}</span>
                          <span className="font-mono text-sm tabular-nums">{score === null ? "—" : score}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCandidate(candidate.id)}
                          className="kicker shrink-0 border border-line px-2 py-1 text-muted hover:border-accent hover:text-accent"
                        >
                          Borrar
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>

          <div ref={detailRef} className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-5 sm:px-5">
            <h2 className="display mb-2 text-2xl text-muted">Detalle</h2>
            {probe ? (
              <PointPanel
                probe={probe}
                target={target}
                weights={weights}
                saved={candidates.some((item) => item.id === cacheKey(probe.queryLat, probe.queryLng))}
                onRetry={() => analyzePoint(probe.lat, probe.lng)}
                onSave={saveProbe}
                onGoToSite={selectSite}
              />
            ) : selected ? (
              <Detail site={selected} target={target} weights={weights} />
            ) : (
              <p className="border border-line px-4 py-8 text-center text-sm text-muted">
                Haz clic en un lugar del mapa o de la lista.
              </p>
            )}
          </div>
        </aside>
      </div>
      {showWelcome ? <WelcomeScreen onDone={closeWelcome} siteCount={SITES.length} /> : null}
      {aboutOpen ? <AboutDialog onClose={closeAbout} /> : null}
      {gameOpen ? <PlanetGame onClose={() => setGameOpen(false)} onShow={showRound} /> : null}
    </div>
  );
}

function Detail({ site, target, weights }: { site: Site; target: Target; weights: Weights }) {
  const score = scoreSite(site, target, weights);
  const diffs = dimensionDiffs(site, target, weights);
  const known = diffs.filter((item) => !item.missing);
  const { parecidos, fallas } = analogyLists(known);
  const cuerpo = target.body === "luna" ? "la Luna" : "Marte";
  const objetivo = target.body === "luna" ? "Luna" : "Marte";

  return (
    <article key={`${site.name}-${target.id}`} className="brackets relative overflow-hidden border border-line bg-panel p-4">
      <span className="scan-line" aria-hidden="true" />
      <h3 className="display text-2xl leading-none">{site.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <SiteMark site={site} />
        {site.analogoDe?.map((body) => (
          <BodyTag key={body} body={body} />
        ))}
      </div>
      {site.tipoAnalogo ? <p className="mt-2 text-sm text-muted">{site.tipoAnalogo}</p> : null}
      <p className="mt-1 text-xs text-muted">
        {site.where}
        {site.nuevo && site.estado !== "candidato" ? " · poco estudiado como análogo" : ""}
      </p>
      <p className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
        <CountUp value={score} />
        <span className="pb-2 font-mono text-sm text-muted tabular-nums">/ 100 de parecido con {target.name}</span>
      </p>
      {partialScoreLabel(site) ? (
        <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted">{partialScoreLabel(site)}</p>
      ) : null}
      {!site.p && site.similitud ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Este puntaje es el promedio de la similitud del expediente (terreno, suelo, clima, vida y
          aislamiento). Todavía no usa las 9 categorías con peso.
        </p>
      ) : null}

      {site.desc ? <p className="mt-3 text-sm leading-relaxed">{site.desc}</p> : null}
      <SiteSources site={site} />

      <Dossier site={site} />
      <Logistics site={site} />

      {site.p ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">Perfil</h4>
          <RadarChart
            earth={earthProfile(site)}
            target={target.p}
            targetName={objetivo}
            known={DIMS.map((dim) => categoryKnown(site, dim.key))}
          />
        </section>
      ) : null}

      {diffs.length > 0 ? (
        <>
          <h4 className="display mt-4 text-2xl text-muted">Se parece en</h4>
          <ul className="ok-list">
            {parecidos.length > 0 ? (
              parecidos.map((item) => (
                <li key={item.key}>
                  {item.name} <SourceTag dim={item.key} site={site} missing={item.missing} />
                </li>
              ))
            ) : (
              <li>Ninguna categoría muy cercana</li>
            )}
          </ul>

          <h4 className="display mt-4 text-2xl text-muted">Dónde falla la analogía</h4>
          <ul className="fail-list">
            {fallas.map((item) => (
              <li key={item.key}>
                {item.name} <SourceTag dim={item.key} site={site} missing={item.missing} />:{" "}
                {item.earth > item.target ? "mucho más" : "mucho menos"} que en {cuerpo}
              </li>
            ))}
            <li>{LIMITES[target.body]}</li>
          </ul>
        </>
      ) : null}

      {site.pruebas && site.pruebas.length > 0 ? null : site.prueba ? (
        <>
          <h4 className="display mt-4 text-2xl text-muted">Qué se podría probar aquí</h4>
          <p className="mt-1 text-sm leading-relaxed">{site.prueba}</p>
        </>
      ) : null}

      <NasaPower site={site} />

      {diffs.length > 0 ? (
        <>
          <h4 className="display mt-4 text-2xl text-muted">Comparación por categoría</h4>
          <div className="mt-3 space-y-3">
            {diffs.map((item) => (
              <div key={item.key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span>
                    {item.name} {item.missing ? null : <SourceTag dim={item.key} site={site} />}
                  </span>
                </div>
                {item.missing ? (
                  <p className="mt-1 font-mono text-[11px] text-muted">— sin dato</p>
                ) : (
                  <>
                    <div className="mt-1 flex h-2 items-stretch">
                      <div className="flex w-1/2 justify-end bg-white/[0.04]">
                        <div className="h-full bg-[#d7d7d7]" style={{ width: `${item.earth * 10}%` }} />
                      </div>
                      <div className="w-px shrink-0 bg-accent" />
                      <div className="flex w-1/2 justify-start bg-white/[0.04]">
                        <div className="h-full bg-accent" style={{ width: `${item.target * 10}%` }} />
                      </div>
                    </div>
                    <div className="mt-0.5 flex justify-between font-mono text-[11px] tabular-nums">
                      <span>{item.earth}</span>
                      <span className="text-accent">{item.target}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-1.5 w-1.5 bg-[#d7d7d7]" />
              Tierra
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-1.5 w-1.5 bg-accent" />
              {target.body === "luna" ? "Luna" : "Marte"}
            </span>
          </div>
        </>
      ) : null}
    </article>
  );
}

function Logistics({ site }: { site: Site }) {
  const rows = [
    ["Acceso", site.logistica?.acceso],
    ["Permisos", site.logistica?.permisos],
    ["Mejor temporada", site.logistica?.temporada],
    ["Ciudad más cercana", site.logistica?.ciudad],
  ] as const;

  return (
    <section className="mt-4">
      <h4 className="display text-2xl text-muted">Logística de pruebas</h4>
      <dl className="mt-2 border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className={`text-right text-sm ${value ? "" : "text-muted"}`}>{value || "Por llenar"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-[11px] text-muted">Permisos: anótalo si el lugar es un área protegida.</p>
    </section>
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
              <dt className="kicker text-muted">Altitud</dt>
              <dd className="mt-0.5 leading-relaxed">{site.altitud}</dd>
            </div>
          ) : null}
          {site.ubicacion ? (
            <div>
              <dt className="kicker text-muted">Ubicación</dt>
              <dd className="mt-0.5 leading-relaxed">{site.ubicacion}</dd>
            </div>
          ) : null}
          {site.tipoTerreno ? (
            <div>
              <dt className="kicker text-muted">Tipo de terreno</dt>
              <dd className="mt-0.5 leading-relaxed">{site.tipoTerreno}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <FactList title="Geología" items={site.geologia} />

      {site.comparacion ? (
        <section>
          <h4 className="display text-2xl text-muted">Comparación</h4>
          <p className="mt-1 text-sm font-semibold">{site.comparacion.lugar}</p>
          <p className="mt-1 text-sm leading-relaxed">{site.comparacion.explicacion}</p>
        </section>
      ) : null}

      <FactList title="Pruebas que permite" items={site.pruebas} />
      <FactList title="Limitaciones" items={site.limitaciones} />

      {site.verificacionNasa && site.verificacionNasa.length > 0 ? (
        <section>
      <h4 className="section-title">Cómo verificarlo con datos de NASA</h4>
          <ul className="mt-1 space-y-1.5 text-sm leading-relaxed">
            {site.verificacionNasa.map((item) => (
              <li key={item.recurso}>
                <span className="font-semibold">{item.recurso}.</span> {item.uso}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <FactList title="Proyectos recomendados" items={site.proyectos} />
    </div>
  );
}

function SiteMark({ site, className = "" }: { site: Site; className?: string }) {
  const label = site.estado === "candidato" ? "Candidato" : site.usoNasa ? "NASA" : site.nuevo ? "Nuevo" : null;
  if (!label) return null;
  const tone = label === "Nuevo" ? "text-muted" : "text-accent";
  return <span className={`kicker ${tone} ${className}`}>{label}</span>;
}

function SiteSources({ site }: { site: Site }) {
  if (!site.usoNasa && !site.fuentes?.length) return null;
  return (
    <>
      {site.usoNasa ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">Uso de la NASA</h4>
          <p className="mt-1 text-sm leading-relaxed">{site.usoNasa}</p>
        </section>
      ) : null}
      {site.fuentes && site.fuentes.length > 0 ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">Fuentes</h4>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed">
            {site.fuentes.map((item) =>
              typeof item === "string" ? (
                <li key={item}>{item}</li>
              ) : (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline decoration-accent/40 underline-offset-2"
                  >
                    {item.nombre}
                  </a>
                </li>
              ),
            )}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function FactList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  const short = title.length <= 24;
  return (
    <section>
      <h4 className={short ? "display text-2xl text-muted" : "section-title"}>{title}</h4>
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
    <section className="mt-4 border-t border-line pt-3">
      <h4 className="display mt-4 text-2xl text-muted">Datos reales · NASA POWER</h4>
      <dl className="mt-2 border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-mono text-sm tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Frío {profile.frio}/10 con la temperatura media y aridez {profile.aridez}/10 con la precipitación.
        El valor anual de la máxima es el mes más cálido y el de la mínima, el mes más frío.{" "}
        {DIMS.some((dim) => dim.key !== "frio" && dim.key !== "aridez" && typeof site.p?.[dim.key] === "number")
          ? "Las demás categorías siguen siendo estimaciones."
          : "Las demás categorías de este lugar no tienen dato y no entran al puntaje."}
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
