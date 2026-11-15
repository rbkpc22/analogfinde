"use client";

import Link from "next/link";
import { LanguageToggle, useI18n } from "@/components/LocaleProvider";
import { DIMS } from "@/lib/data";
import { dimList } from "@/lib/i18n";
import { NASA_POWER_HOME } from "@/lib/nasa";

const POWER_METHOD = "https://power.larc.nasa.gov/docs/methodology/";

export default function MetodologiaPage() {
  const { locale, t } = useI18n();
  const names = dimList(locale);

  return (
    <main className="starfield min-h-dvh text-ink">
      <header className="border-b border-line bg-panel/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="kicker text-muted">NASA Space Apps Challenge 2026</p>
            <h1 className="display text-2xl leading-none">{t("pageMethod")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/" className="kicker border border-line px-3 py-2 text-ink transition hover:border-accent hover:text-accent">
              {t("backToMap")}
            </Link>
          </div>
        </div>
        <div className="h-px bg-accent" />
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-5 py-8 text-sm leading-relaxed">
        <section>
          <h2 className="display mb-2 text-2xl text-muted">{t("pageHow")}</h2>
          <p>{t("pageHow1", { count: DIMS.length, names })}</p>
          <p className="mt-2">{t("pageHow2")}</p>
          <p className="mt-2 border border-line bg-panel px-3 py-2 font-mono text-[13px] text-accent tabular-nums">
            {t("formula")}
          </p>
          <p className="mt-2">{t("pageHow3")}</p>
          <p className="mt-2">{t("pageHow4")}</p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">{t("pagePower")}</h2>
          <p>{t("pagePowerBody")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>{t("pageCold")}</li>
            <li>{t("pageDry")}</li>
          </ul>
          <p className="mt-2">{t("pageLinear")}</p>
          <p className="mt-2">{t("pageTemps")}</p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">{t("pageEstimated")}</h2>
          <p>{t("pageEstimatedBody")}</p>
        </section>

        <section>
          <h2 className="display mb-2 text-2xl text-muted">{t("pageSources")}</h2>
          <ul className="space-y-2">
            <li>
              <a href={NASA_POWER_HOME} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2">
                NASA POWER
              </a>
              . {t("pagePowerLink")}
            </li>
            <li>
              <a href={POWER_METHOD} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2">
                {t("pagePowerMethodName")}
              </a>
              . {t("pagePowerMethod")}
            </li>
          </ul>
          <p className="mt-2">{t("pageSourcesNote")}</p>
        </section>
        <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">{t("versionNote")}</p>
      </article>
    </main>
  );
}
