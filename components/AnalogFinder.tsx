"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AboutDialog from "@/components/AboutDialog";
import AnalogMap from "@/components/AnalogMap";
import { LanguageToggle, useI18n } from "@/components/LocaleProvider";
import PlanetGame from "@/components/PlanetGame";
import PointPanel from "@/components/PointPanel";
import RadarChart from "@/components/RadarChart";
import WelcomeScreen from "@/components/WelcomeScreen";
import { DIMS, SITES, TARGETS, type DimKey, type Site, type Target } from "@/lib/data";
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
import { dimName, missionName, pickEn, siteName, targetText } from "@/lib/i18n";
import {
  analogyLists,
  coveredCategories,
  dimensionDiffs,
  initialWeights,
  hasCompleteProfile,
  mismatchedBodyNote,
  scoreSite,
  type Weights,
} from "@/lib/score";
import type { Round } from "@/lib/game";
import type { FlyTarget } from "@/lib/view";

function BodyTag({ body }: { body: string }) {
  const { t } = useI18n();
  const mars = body.toLowerCase().startsWith("mar");
  return (
    <span className="kicker inline-flex items-center gap-1.5 text-ink">
      <i
        className="inline-block h-1.5 w-1.5 shrink-0"
        style={{ background: mars ? "var(--marte)" : "var(--luna)" }}
      />
      {mars ? t("mars") : t("moon")}
    </span>
  );
}

function SourceTag({ dim, site, missing }: { dim: DimKey; site?: Site; missing?: boolean }) {
  const { t } = useI18n();
  if (missing) {
    return <span className="kicker mt-0.5 block w-fit whitespace-nowrap text-muted">{t("missing")}</span>;
  }
  const nasa = categoryLabel(dim, site) === "Dato NASA";
  return (
    <span className={`kicker mt-0.5 block w-fit whitespace-nowrap ${nasa ? "text-accent" : "text-muted"}`}>
      {nasa ? t("nasaData") : t("estimate")}
    </span>
  );
}

function measure(value: number, unit: string) {
  return `${value.toFixed(2)} ${unit}`;
}

function Mark() {
  return <img src="/logo.png?v=2" alt="" width={40} height={40} className="h-10 w-10 shrink-0" />;
}

function scoreInk(score: number) {
  return 0.3 + (0.7 * Math.max(0, Math.min(100, score))) / 100;
}

function ScoreTicker({ score }: { score: number }) {
  const [shown, setShown] = useState(score);
  const [delta, setDelta] = useState<number | null>(null);
  const fromRef = useRef(score);

  useEffect(() => {
    const from = fromRef.current;
    if (from === score) return;
    const diff = score - from;
    setDelta(diff);
    const hide = window.setTimeout(() => setDelta(null), 2000);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(score);
      fromRef.current = score;
      return () => window.clearTimeout(hide);
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 300);
      setShown(Math.round(from + diff * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = score;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hide);
    };
  }, [score]);

  const change = delta === null || delta === 0 ? null : delta > 0 ? `▲ +${delta}` : `▼ ${delta}`;

  return (
    <span className="inline-flex items-baseline justify-end gap-1.5 whitespace-nowrap">
      {change ? <span className="font-mono text-[10px] font-medium text-accent tabular-nums">{change}</span> : null}
      <span className="font-mono text-sm font-medium text-accent tabular-nums" style={{ opacity: scoreInk(score) }}>
        {shown}
      </span>
    </span>
  );
}

function RankedSites({
  ranked,
  selectedName,
  onSelect,
  noteFor,
}: {
  ranked: Array<Site & { score: number }>;
  selectedName: string | null;
  onSelect: (site: Site) => void;
  noteFor?: (site: Site) => string | null;
}) {
  const { locale, t } = useI18n();
  const rootRef = useRef<HTMLOListElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const tops = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    if (rootRect.height === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    for (const [name, el] of rowRefs.current) {
      const top = el.getBoundingClientRect().top - rootRect.top;
      const prev = tops.current.get(name);
      if (!reduce && prev !== undefined && Math.abs(prev - top) > 0.5) {
        el.getAnimations().forEach((animation) => animation.cancel());
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: "translateY(0)" }], {
          duration: 250,
          easing: "ease-out",
        });
      }
      next.set(name, top);
    }
    tops.current = next;
  });

  return (
    <ol ref={rootRef}>
      {ranked.map((site, index) => {
        const active = site.name === selectedName;
        const covered = coveredCategories(site);
        return (
          <li
            key={site.name}
            ref={(node) => {
              if (node) rowRefs.current.set(site.name, node);
              else rowRefs.current.delete(site.name);
            }}
            className="border-b border-line"
          >
            <button
              type="button"
              data-site={site.name}
              onClick={() => onSelect(site)}
              className={`grid w-full grid-cols-[1.4rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 text-left text-sm sm:px-5 ${
                active ? "border-l-2 border-l-accent bg-white/[0.04]" : "hover:bg-white/[0.03]"
              }`}
            >
              <span className="font-mono text-[11px] text-muted tabular-nums">{index + 1}</span>
              <span className="min-w-0 leading-snug">
                <span>
                  {siteName(locale, site)}
                  <SiteMark site={site} className="ml-2" />
                </span>
                {covered ? (
                  <span className="mt-0.5 block font-mono text-[10px] leading-snug tracking-[0.04em] text-muted">
                    {t("partialScore", covered)}
                  </span>
                ) : null}
                {noteFor?.(site) ? (
                  <span className="mt-0.5 block font-mono text-[10px] leading-snug tracking-[0.04em] text-muted">
                    {noteFor(site)}
                  </span>
                ) : null}
              </span>
              <ScoreTicker score={site.score} />
            </button>
          </li>
        );
      })}
    </ol>
  );
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

export default function AnalogFinder() {
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const [weights, setWeights] = useState<Weights>(initialWeights);
  const [onlyNew, setOnlyNew] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [targetMenuOpen, setTargetMenuOpen] = useState(false);
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
  const targetMenuRef = useRef<HTMLDivElement>(null);
  const followSelection = useRef(false);
  const rankedRef = useRef({ complete: [] as Array<Site & { score: number }>, partial: [] as Array<Site & { score: number }> });

  const { locale, t } = useI18n();
  const target = TARGETS.find((item) => item.id === targetId) ?? TARGETS[0];
  const targetLabel = targetText(locale, target.id, target);

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
  const completeRanked = useMemo(
    () => ranked.filter((site) => hasCompleteProfile(site) && !mismatchedBodyNote(site, target)),
    [ranked, target],
  );
  const partialRanked = useMemo(
    () => ranked.filter((site) => !hasCompleteProfile(site) || mismatchedBodyNote(site, target)),
    [ranked, target],
  );
  const bestSite = completeRanked[0] ?? partialRanked[0];
  rankedRef.current = { complete: completeRanked, partial: partialRanked };

  const selected = SITES.find((site) => site.name === selectedName) ?? null;
  const topFive = completeRanked.slice(0, 5);
  const shownComplete = listOpen ? completeRanked : topFive;
  const canExpandList = completeRanked.length > 5 || partialRanked.length > 0;

  const selectSite = useCallback((site: Site) => {
    followSelection.current = true;
    seq.current += 1;
    analyzeSeq.current += 1;
    setProbe(null);
    setSelectedName(site.name);
    setSheetOpen(true);
    const { complete, partial } = rankedRef.current;
    const rank = complete.findIndex((item) => item.name === site.name);
    if (rank >= 5 || partial.some((item) => item.name === site.name)) setListOpen(true);
    setFlyTarget({ lat: site.lat, lng: site.lng, seq: seq.current });
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setProbe(null);
  }, []);

  const closeWelcome = useCallback(() => setShowWelcome(false), []);

  useEffect(() => {
    setCandidates(loadCandidates());
    if (window.matchMedia("(max-width: 767px)").matches) setControlsOpen(false);
  }, []);

  useEffect(() => {
    if (!probe) return;
    if (window.matchMedia("(max-width: 1000px)").matches) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [probe]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || aboutOpen || gameOpen) return;
      if (sheetOpen) {
        setSheetOpen(false);
        setProbe(null);
        return;
      }
      if (analyzing) setAnalyzing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, analyzing, gameOpen, sheetOpen]);

  useEffect(() => {
    if (!targetMenuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!targetMenuRef.current?.contains(event.target as Node)) setTargetMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [targetMenuOpen]);

  const analyzePoint = useCallback((lat: number, lng: number) => {
    const queryLat = roundCoord(lat);
    const queryLng = roundCoord(lng);
    const request = ++analyzeSeq.current;
    const cached = cachedPowerPoint(queryLat, queryLng);
    if (cached) {
      setSelectedName(null);
      setSheetOpen(true);
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
    setSheetOpen(true);
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
    setSheetOpen(true);
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
      className="starfield flex h-dvh flex-col overflow-hidden"
      style={{ "--accent": target.body === "luna" ? "#E6EEF5" : "#FF5A1F" } as React.CSSProperties}
    >
      <header className={`relative z-50 border-b border-line bg-panel/95 ${showWelcome ? "hidden" : ""}`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex shrink-0 items-center gap-2">
            <Mark />
            <h1 className="display text-xl leading-none">AnalogFinder</h1>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto">
            <button
              type="button"
              aria-pressed={analyzing}
              onClick={() => setAnalyzing((current) => !current)}
              className={`kicker shrink-0 border px-3 py-2 ${
                analyzing ? "border-accent text-accent" : "border-line text-ink hover:border-accent hover:text-accent"
              }`}
            >
              {t("analyzePoint")}
            </button>
            <button
              type="button"
              onClick={() => setGameOpen(true)}
              className="kicker shrink-0 border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent"
            >
              {t("gameButton")}
            </button>
            <LanguageToggle />
            <button
              ref={aboutButtonRef}
              type="button"
              onClick={() => setAboutOpen(true)}
              className="kicker shrink-0 border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent"
            >
              {t("aboutButton")}
            </button>
          </div>
        </div>
        <div className="h-px bg-accent" />
      </header>

      <div className="relative z-10 min-h-0 flex-1">
        <section
          className={
            showWelcome
              ? "intro-globe fixed top-1/2 z-[60] -translate-y-1/2 max-md:left-1/2 max-md:-translate-x-1/2 md:left-[70%] md:-translate-x-1/2"
              : "map-stage absolute inset-0"
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
        </section>

        {showWelcome ? null : (
          <>
            {analyzing ? (
              <p className="pointer-events-none absolute top-3 left-1/2 z-20 max-w-xs -translate-x-1/2 border border-line bg-panel/90 px-3 py-2 text-center font-mono text-[11px] leading-snug tracking-[0.04em]">
                {t("clickPlanet")}
              </p>
            ) : null}

            <div className="pointer-events-none absolute bottom-3 left-3 z-20 w-32 max-md:bottom-[47vh]">
              <div
                className="h-1 w-full"
                style={{
                  background: "linear-gradient(90deg, color-mix(in srgb, var(--accent) 30%, transparent), var(--accent))",
                }}
              />
              <div className="relative mt-0.5 h-3 font-mono text-[10px] text-muted tabular-nums">
                <span className="absolute left-0">0</span>
                <span className="absolute left-1/2 -translate-x-1/2">50</span>
                <span className="absolute left-[80%] -translate-x-1/2">80</span>
                <span className="absolute right-0">100</span>
              </div>
            </div>

            {controlsOpen ? (
              <aside className="brackets absolute z-[35] flex min-h-0 flex-col overflow-hidden border border-line bg-panel/90 max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[72vh] max-md:w-full md:top-3 md:bottom-16 md:left-3 md:w-[320px]">
                <div className="flex justify-end px-2 pt-2">
                  <button
                    type="button"
                    aria-label={t("minimizePanel")}
                    onClick={() => setControlsOpen(false)}
                    className="kicker border border-line px-2 py-1 text-muted hover:border-accent hover:text-accent"
                  >
                    —
                  </button>
                </div>
                <div className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
                  <section>
                    <h2 className="display mb-2 text-2xl text-muted">{t("objective")}</h2>
                    <div ref={targetMenuRef}>
                      <button
                        type="button"
                        aria-expanded={targetMenuOpen}
                        onClick={() => setTargetMenuOpen((open) => !open)}
                        className="block w-full border border-line px-2 py-2 text-left hover:border-accent"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <BodyTag body={target.body} />
                          <span aria-hidden="true" className="text-muted">{targetMenuOpen ? "▴" : "▾"}</span>
                        </span>
                        <span className="mt-1 block text-sm">{targetLabel.name}</span>
                        <small className="mt-0.5 block text-[11px] text-muted">{targetLabel.sub}</small>
                      </button>
                      {targetMenuOpen ? (
                        <div className="border border-t-0 border-line">
                          {TARGETS.map((item) => {
                            const active = item.id === target.id;
                            const label = targetText(locale, item.id, item);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => {
                                  setTargetId(item.id);
                                  setTargetMenuOpen(false);
                                }}
                                className={`block w-full border-t border-line px-2 py-2 text-left ${
                                  active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                                }`}
                              >
                                <BodyTag body={item.body} />
                                <span className="mt-1 block text-sm">{label.name}</span>
                                <small className="mt-0.5 block text-[11px] text-muted">{label.sub}</small>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <section>
                    <h2 className="display mb-2 text-2xl text-muted">{t("whatToTest")}</h2>
                    <div className="grid grid-cols-6 gap-1.5">
                      {MISSIONS.map((mission, index) => {
                        const active = sameWeights(weights, mission.weights);
                        return (
                          <button
                            key={mission.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setWeights(mission.weights)}
                            className={`${index < 3 ? "col-span-2" : "col-span-3"} border px-2 py-2 text-left text-xs leading-snug ${
                              active ? "border-accent text-accent" : "border-line hover:border-accent"
                            }`}
                          >
                            {missionName(locale, mission.id, mission.name)}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <button
                      type="button"
                      aria-expanded={advancedOpen}
                      onClick={() => setAdvancedOpen((open) => !open)}
                      className="kicker w-full border border-line px-2 py-2 text-left hover:border-accent hover:text-accent"
                    >
                      {t("advancedSettings")} {advancedOpen ? "▴" : "▾"}
                    </button>
                    {advancedOpen ? (
                      <div className="mt-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="font-mono text-[11px] leading-snug tracking-[0.04em] text-accent">
                            {bestSite ? t("bestNow", { name: siteName(locale, bestSite), score: bestSite.score }) : t("bestNow", { name: "—", score: "—" })}
                          </p>
                          <button
                            type="button"
                            onClick={() => setWeights(initialWeights())}
                            disabled={DIMS.every((dim) => weights[dim.key] === 1)}
                            className="kicker shrink-0 border border-line px-2 py-1 hover:border-accent hover:text-accent disabled:text-muted"
                          >
                            {t("reset")}
                          </button>
                        </div>
                        <p className="mb-2 text-[11px] text-muted">{t("weightHint")}</p>
                        <div className="space-y-2.5">
                          {DIMS.map((dim) => (
                            <label key={dim.key} className="grid grid-cols-[minmax(0,1fr)_72px_1.2rem] items-center gap-2 text-xs">
                              <span className="block leading-tight">
                                {dimName(locale, dim.key)} <SourceTag dim={dim.key} />
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={3}
                                step={1}
                                value={weights[dim.key]}
                                aria-label={dimName(locale, dim.key)}
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
                          {t("onlyNew")}
                        </label>
                      </div>
                    ) : null}
                  </section>
                </div>
              </aside>
            ) : (
              <button
                type="button"
                aria-label={t("expandPanel")}
                onClick={() => setControlsOpen(true)}
                className="brackets absolute top-3 left-3 z-[35] flex h-10 w-10 items-center justify-center border border-line bg-panel/90 text-lg text-ink hover:border-accent hover:text-accent"
              >
                ≡
              </button>
            )}

            <aside className={`brackets absolute z-30 flex min-h-0 flex-col overflow-hidden border border-line bg-panel/90 max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[46vh] max-md:w-full md:top-3 md:right-3 md:bottom-3 md:w-[320px] ${sheetOpen ? "max-md:hidden" : ""}`}>
              <div className="px-3 pt-3">
                <h2 className="display text-2xl text-muted">{t("similarPlaces")}</h2>
              </div>
              <div className="scroll-thin mt-2 min-h-0 flex-1 overflow-y-auto border-t border-line">
                <RankedSites ranked={shownComplete} selectedName={selectedName} onSelect={selectSite} />
                {listOpen && partialRanked.length > 0 ? (
                  <section className="border-t border-line">
                    <h3 className="px-4 pt-3 pb-1 font-mono text-[11px] leading-snug tracking-[0.04em] text-muted">
                      {t("partialSection")}
                    </h3>
                    <RankedSites
                      ranked={partialRanked}
                      selectedName={selectedName}
                      onSelect={selectSite}
                      noteFor={(site) => {
                        const note = mismatchedBodyNote(site, target);
                        if (note === "Análogo de Marte") return t("analogOfMars");
                        if (note === "Análogo de Luna") return t("analogOfMoon");
                        return null;
                      }}
                    />
                  </section>
                ) : null}
                {candidates.length > 0 ? (
                  <section className="border-t border-line px-3 py-3">
                    <h3 className="display text-xl text-muted">{t("myCandidates")}</h3>
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
                              {t("delete")}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </div>
              {canExpandList ? (
                <button
                  type="button"
                  aria-expanded={listOpen}
                  onClick={() => setListOpen((open) => !open)}
                  className="kicker border-t border-line px-3 py-2 text-left text-accent hover:bg-white/[0.03]"
                >
                  {listOpen ? t("seeLess") : t("seeAll", { count: ranked.length })}
                </button>
              ) : null}
            </aside>

            {selected || probe ? (
              <aside
                ref={detailRef}
                role="dialog"
                aria-modal="false"
                aria-hidden={!sheetOpen}
                className={`sheet-slide brackets absolute z-40 flex min-h-0 flex-col overflow-hidden border border-line bg-panel/90 max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[88vh] max-md:w-full md:top-3 md:right-3 md:bottom-3 md:w-[420px] ${
                  sheetOpen
                    ? "translate-x-0 translate-y-0"
                    : "pointer-events-none max-md:translate-x-0 max-md:translate-y-full md:translate-x-[calc(100%+1rem)] md:translate-y-0"
                }`}
              >
                <div className="flex justify-end px-2 pt-2">
                  <button
                    type="button"
                    onClick={closeSheet}
                    aria-label={t("close")}
                    className="kicker border border-line px-2 py-1 text-muted hover:border-accent hover:text-accent"
                  >
                    X
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  {probe ? (
                    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                      <PointPanel
                        probe={probe}
                        target={target}
                        weights={weights}
                        saved={candidates.some((item) => item.id === cacheKey(probe.queryLat, probe.queryLng))}
                        onRetry={() => analyzePoint(probe.lat, probe.lng)}
                        onSave={saveProbe}
                        onGoToSite={selectSite}
                      />
                    </div>
                  ) : selected ? (
                    <Detail site={selected} target={target} weights={weights} />
                  ) : null}
                </div>
              </aside>
            ) : null}
          </>
        )}
      </div>
      {showWelcome ? <WelcomeScreen onDone={closeWelcome} siteCount={SITES.length} /> : null}
      {aboutOpen ? <AboutDialog onClose={closeAbout} /> : null}
      {gameOpen ? <PlanetGame onClose={() => setGameOpen(false)} onShow={showRound} /> : null}
    </div>
  );
}

function Detail({ site, target, weights }: { site: Site; target: Target; weights: Weights }) {
  const { locale, t } = useI18n();
  const score = scoreSite(site, target, weights);
  const diffs = dimensionDiffs(site, target, weights);
  const known = diffs.filter((item) => !item.missing);
  const { parecidos, fallas } = analogyLists(known);
  const cuerpo = target.body === "luna" ? t("theMoon") : t("mars");
  const objetivo = target.body === "luna" ? t("moon") : t("mars");
  const targetLabel = targetText(locale, target.id, target);
  const covered = coveredCategories(site);
  const [tab, setTab] = useState<"resumen" | "nasa" | "comparar" | "fuentes">("resumen");
  const tabs = [
    ["resumen", t("tabSummary")],
    ["nasa", t("tabNasa")],
    ["comparar", t("tabCompare")],
    ["fuentes", t("tabSources")],
  ] as const;
  const tests = locale === "en" && site.pruebasEn?.length ? site.pruebasEn : site.pruebas;

  return (
    <article key={`${site.name}-${target.id}`} className="flex h-full min-h-0 flex-col">
      <div className="px-3 pt-1">
      <h3 className="display text-2xl leading-none">{siteName(locale, site)}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <SiteMark site={site} />
        {site.analogoDe?.map((body) => (
          <BodyTag key={body} body={body} />
        ))}
      </div>
      {site.tipoAnalogo ? <p className="mt-2 text-sm text-muted">{site.tipoAnalogo}</p> : null}
      <p className="mt-1 text-xs text-muted">
        {pickEn(locale, site.where, site.whereEn)}
        {site.nuevo && site.estado !== "candidato" ? t("littleStudied") : ""}
      </p>
      </div>
      <div role="tablist" className="mt-3 flex border-y border-line">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`kicker flex-1 px-1 py-2 ${tab === id ? "bg-white/10 text-accent" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-3">
      {tab === "resumen" ? (
        <>
      <p className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <CountUp value={score} />
        <span className="pb-2 font-mono text-sm text-muted tabular-nums">{t("likeTarget", { name: targetLabel.name })}</span>
      </p>
      {covered ? (
        <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted">{t("partialScore", covered)}</p>
      ) : null}
      {!site.p && site.similitud ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">{t("similarityNote")}</p>
      ) : null}
      {pickEn(locale, site.desc, site.descEn) ? (
        <p className="mt-3 text-sm leading-relaxed">{pickEn(locale, site.desc, site.descEn)}</p>
      ) : null}

      {diffs.length > 0 ? (
        <>
          <h4 className="display mt-4 text-2xl text-muted">{t("resemblesIn")}</h4>
          <ul className="ok-list">
            {parecidos.length > 0 ? (
              parecidos.map((item) => (
                <li key={item.key}>
                  {dimName(locale, item.key)} <SourceTag dim={item.key} site={site} missing={item.missing} />
                </li>
              ))
            ) : (
              <li>{t("noCloseCategory")}</li>
            )}
          </ul>

          <h4 className="display mt-4 text-2xl text-muted">{t("analogyFails")}</h4>
          <ul className="fail-list">
            {fallas.map((item) => (
              <li key={item.key}>
                {dimName(locale, item.key)} <SourceTag dim={item.key} site={site} missing={item.missing} />:{" "}
                {item.earth > item.target ? t("muchMore") : t("muchLess")} {t("thanOn", { body: cuerpo })}
              </li>
            ))}
            <li>{target.body === "luna" ? t("limitsMoon") : t("limitsMars")}</li>
          </ul>
        </>
      ) : null}

      {tests && tests.length > 0 ? (
        <div className="mt-4">
          <FactList title={t("couldTest")} items={tests} />
        </div>
      ) : pickEn(locale, site.prueba, site.pruebaEn) ? (
        <>
          <h4 className="display mt-4 text-2xl text-muted">{t("couldTest")}</h4>
          <p className="mt-1 text-sm leading-relaxed">{pickEn(locale, site.prueba, site.pruebaEn)}</p>
        </>
      ) : null}
        </>
      ) : null}

      {tab === "nasa" ? (
        <>
      <NasaPower site={site} />
      {site.p ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">{t("profile")}</h4>
          <RadarChart
            earth={earthProfile(site)}
            target={target.p}
            targetName={objetivo}
            known={DIMS.map((dim) => categoryKnown(site, dim.key))}
          />
        </section>
      ) : null}
      <Dossier site={site} parts={["facts", "geology", "verify"]} />
        </>
      ) : null}

      {tab === "comparar" ? (
        <>
          {diffs.length > 0 ? (
          <>
          <h4 className="display text-2xl text-muted">{t("byCategory")}</h4>
          <div className="mt-3 space-y-3">
            {diffs.map((item) => (
              <div key={item.key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span>
                    {dimName(locale, item.key)} {item.missing ? null : <SourceTag dim={item.key} site={site} />}
                  </span>
                </div>
                {item.missing ? (
                  <p className="mt-1 font-mono text-[11px] text-muted">{t("noData")}</p>
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
              {t("earth")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-1.5 w-1.5 bg-accent" />
              {objetivo}
            </span>
          </div>
          </>
          ) : null}
          <Dossier site={site} parts={["comparison", "limits"]} />
        </>
      ) : null}

      {tab === "fuentes" ? (
        <>
          <SiteSources site={site} />
          <Logistics site={site} />
          <Dossier site={site} parts={["projects"]} />
        </>
      ) : null}
      </div>
    </article>
  );
}

function Logistics({ site }: { site: Site }) {
  const { t } = useI18n();
  const rows = [
    [t("access"), site.logistica?.acceso],
    [t("permits"), site.logistica?.permisos],
    [t("season"), site.logistica?.temporada],
    [t("nearestCity"), site.logistica?.ciudad],
  ].filter((row): row is [string, string] => Boolean(row[1]?.trim()));
  if (rows.length === 0) return null;

  return (
    <section className="mt-4">
      <h4 className="display text-2xl text-muted">{t("logistics")}</h4>
      <dl className="mt-2 border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-right text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Dossier({
  site,
  parts,
}: {
  site: Site;
  parts: Array<"facts" | "geology" | "comparison" | "limits" | "verify" | "projects">;
}) {
  const { t } = useI18n();
  const hasFacts = site.altitud || site.ubicacion || site.tipoTerreno;
  const show = (part: (typeof parts)[number]) => parts.includes(part);

  return (
    <div className="mt-4 space-y-4">
      {show("facts") && hasFacts ? (
        <dl className="grid gap-2 text-sm">
          {site.altitud ? (
            <div>
              <dt className="kicker text-muted">{t("altitude")}</dt>
              <dd className="mt-0.5 leading-relaxed">{site.altitud}</dd>
            </div>
          ) : null}
          {site.ubicacion ? (
            <div>
              <dt className="kicker text-muted">{t("location")}</dt>
              <dd className="mt-0.5 leading-relaxed">{site.ubicacion}</dd>
            </div>
          ) : null}
          {site.tipoTerreno ? (
            <div>
              <dt className="kicker text-muted">{t("terrainType")}</dt>
              <dd className="mt-0.5 leading-relaxed">{site.tipoTerreno}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {show("geology") ? <FactList title={t("geology")} items={site.geologia} /> : null}

      {show("comparison") && site.comparacion ? (
        <section>
          <h4 className="display text-2xl text-muted">{t("comparison")}</h4>
          <p className="mt-1 text-sm font-semibold">{site.comparacion.lugar}</p>
          <p className="mt-1 text-sm leading-relaxed">{site.comparacion.explicacion}</p>
        </section>
      ) : null}

      {show("limits") ? <FactList title={t("limits")} items={site.limitaciones} /> : null}

      {show("verify") && site.verificacionNasa && site.verificacionNasa.length > 0 ? (
        <section>
      <h4 className="section-title">{t("howToVerify")}</h4>
          <ul className="mt-1 space-y-1.5 text-sm leading-relaxed">
            {site.verificacionNasa.map((item) => (
              <li key={item.recurso}>
                <span className="font-semibold">{item.recurso}.</span> {item.uso}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("projects") ? <FactList title={t("recommended")} items={site.proyectos} /> : null}
    </div>
  );
}

function SiteMark({ site, className = "" }: { site: Site; className?: string }) {
  const { t } = useI18n();
  const kind = site.estado === "candidato" ? "candidate" : site.usoNasa ? "nasa" : site.nuevo ? "new" : null;
  if (!kind) return null;
  const label = kind === "candidate" ? t("candidate") : kind === "nasa" ? "NASA" : t("new");
  const tone = kind === "new" ? "text-muted" : "text-accent";
  return <span className={`kicker ${tone} ${className}`}>{label}</span>;
}

function SiteSources({ site }: { site: Site }) {
  const { locale, t } = useI18n();
  const nasaUse = pickEn(locale, site.usoNasa, site.usoNasaEn);
  if (!nasaUse && !site.fuentes?.length) return null;
  return (
    <>
      {nasaUse ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">{t("nasaUse")}</h4>
          <p className="mt-1 text-sm leading-relaxed">{nasaUse}</p>
        </section>
      ) : null}
      {site.fuentes && site.fuentes.length > 0 ? (
        <section className="mt-4">
          <h4 className="display text-2xl text-muted">{t("sources")}</h4>
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
  const { t } = useI18n();
  const climate = nasaRecord(site);
  if (!climate) return null;
  const profile = earthProfile(site);
  const rows = [
    [t("tempMean"), measure(climate.T2M, "°C")],
    [t("tempMax"), measure(climate.T2M_MAX, "°C")],
    [t("tempMin"), measure(climate.T2M_MIN, "°C")],
    [t("precip"), measure(climate.PRECTOTCORR, t("perDay"))],
  ] as const;

  return (
    <section className="mt-4 border-t border-line pt-3">
      <h4 className="display mt-4 text-2xl text-muted">{t("realData")}</h4>
      <dl className="mt-2 border-t border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-1.5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-mono text-sm tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t("climateExplainSite", { frio: profile.frio ?? 0, aridez: profile.aridez ?? 0 })}{" "}
        {DIMS.some((dim) => dim.key !== "frio" && dim.key !== "aridez" && typeof site.p?.[dim.key] === "number")
          ? t("otherStillEstimates")
          : t("otherNoData")}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        <a
          href={powerQueryUrl(site)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-2"
        >
          {t("powerSourceShort")}
        </a>
      </p>
    </section>
  );
}
