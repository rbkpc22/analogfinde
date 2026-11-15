"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readLocale, translate, writeLocale, type Locale, type MessageKey } from "@/lib/i18n";

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<I18n | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "en" ? "en" : "es";
    writeLocale(locale);
  }, [locale, ready]);

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useI18n");
  return value;
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="flex shrink-0 border border-line" role="group" aria-label={t("language")}>
      {(["es", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          onClick={() => setLocale(item)}
          className={`kicker px-2 py-2 ${locale === item ? "bg-white/10 text-accent" : "text-muted hover:text-ink"}`}
        >
          {item === "es" ? "ES" : "EN"}
        </button>
      ))}
    </div>
  );
}
