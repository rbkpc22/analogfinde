"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { DIMS } from "@/lib/data";
import { dimList } from "@/lib/i18n";

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
  const { locale, t } = useI18n();
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
        aria-label={t("aboutCloseAria")}
        className="absolute inset-0 bg-[#05070f]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="brackets rise relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden border border-line bg-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="kicker text-muted">NASA Space Apps Challenge 2026</p>
            <h2 id="about-title" className="font-display text-xl font-medium">
              {t("aboutTitle")}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="kicker shrink-0 border border-line px-3 py-2 text-muted transition hover:border-accent hover:text-accent"
          >
            {t("close")}
          </button>
        </div>

        <div className="scroll-thin space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
          <section>
            <h3 className="display mb-1 text-2xl text-muted">{t("theChallenge")}</h3>
            <p>{t("challengeBody")}</p>
          </section>

          <section>
            <h3 className="display mb-1 text-2xl text-muted">{t("methodHeading")}</h3>
            <p>{t("methodIntro", { count: DIMS.length, names: dimList(locale) })}</p>
            <p className="mt-2">{t("methodZero")}</p>
            <p className="mt-2 border border-line bg-canvas px-3 py-2 font-mono text-[13px] text-accent tabular-nums">
              {t("formula")}
            </p>
            <p className="mt-2">{t("methodDiff")}</p>
            <p className="mt-2">{t("methodPower")}</p>
            <p className="mt-2">{t("methodEstimate")}</p>
            <a href="/metodologia" className="kicker mt-3 inline-block text-accent">
              {t("seeMethod")}
            </a>
          </section>

          <section>
            <h3 className="mb-1 section-title">{t("limitsTitle")}</h3>
            <p>{t("limitsLead")}</p>
            <ul className="mt-2 space-y-2">
              <li>
                <span className="kicker mr-2 inline-flex items-center gap-1.5 text-ink">
                  <i className="inline-block h-1.5 w-1.5 bg-moon" />
                  {t("moon")}
                </span>
                {t("limitsMoon")}
              </li>
              <li>
                <span className="kicker mr-2 inline-flex items-center gap-1.5 text-ink">
                  <i className="inline-block h-1.5 w-1.5 bg-mars" />
                  {t("mars")}
                </span>
                {t("limitsMars")}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="display mb-1 text-2xl text-muted">{t("team")}</h3>
            <ul className="divide-y divide-line border-y border-line">
              {TEAM.map((person, index) => (
                <li key={index} className="px-3 py-2.5">
                  <p className={person.name ? "text-ink" : "text-muted"}>
                    {person.name || t("memberName")}
                  </p>
                  <p className="text-xs text-muted">{person.role || t("memberRole")}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
