import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  DEFAULT_LOCALE,
  LOCALES,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  localizedPath,
  resolveLocalizedPage,
} from "@/lib/localization";
import { uiText } from "@/lib/uiTranslations";

const DEFAULT_AVAILABLE = Object.freeze([DEFAULT_LOCALE]);

export default function LanguageSwitcher({ mobile = false }) {
  const location = useLocation();
  const resolved = useMemo(() => resolveLocalizedPage(location.pathname), [location.pathname]);
  const currentLocale = resolved?.locale || DEFAULT_LOCALE;
  const [available, setAvailable] = useState(DEFAULT_AVAILABLE);
  const [open, setOpen] = useState(false);
  const text = uiText(currentLocale);

  useEffect(() => {
    setOpen(false);
    if (!resolved?.pageKey) {
      setAvailable(DEFAULT_AVAILABLE);
      return undefined;
    }

    let active = true;
    base44.entities.SitePage.filter({ page_key: resolved.pageKey, is_published: true })
      .then((records) => {
        if (!active) return;
        const publishedLocales = records.map((record) => record.locale).filter(isSupportedLocale);
        setAvailable([...new Set([DEFAULT_LOCALE, currentLocale, ...publishedLocales])]);
      })
      .catch(() => {
        if (active) setAvailable([...new Set([DEFAULT_LOCALE, currentLocale])]);
      });

    return () => { active = false; };
  }, [resolved?.pageKey, currentLocale]);

  if (!resolved?.pageKey) return null;

  if (mobile) {
    return (
      <div className="mt-7 border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold"><Languages className="h-4 w-4" />{text.actions.language}</div>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LOCALES.map((locale) => {
            const enabled = available.includes(locale);
            const active = locale === currentLocale;
            return enabled ? (
              <Link key={locale} to={localizedPath(resolved.pageKey, locale)} hrefLang={locale} className={`flex items-center justify-between border px-3 py-2 text-sm ${active ? "border-gold text-gold" : "border-white/15 text-white/70"}`}>
                <span dir={LOCALES[locale].direction}>{LOCALES[locale].label}</span>{active && <Check className="h-3.5 w-3.5" />}
              </Link>
            ) : (
              <span key={locale} className="border border-white/5 px-3 py-2 text-sm text-white/20" title={text.states.notPublished}>{LOCALES[locale].label}</span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={text.actions.language} className="inline-flex items-center gap-1 px-2 py-2 text-xs font-heading uppercase tracking-wide text-white/70 hover:text-gold">
        <Languages className="h-4 w-4" /><span>{currentLocale.toUpperCase()}</span><ChevronDown className="h-3 w-3" />
      </button>
      {open && <div className="absolute right-0 top-full z-20 mt-1 w-44 border border-white/10 bg-obsidian py-1 shadow-box">
        {available.map((locale) => <Link key={locale} to={localizedPath(resolved.pageKey, locale)} hrefLang={locale} className="flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-gold">
          <span dir={LOCALES[locale].direction}>{LOCALES[locale].label}</span>{locale === currentLocale && <Check className="h-3.5 w-3.5" />}
        </Link>)}
      </div>}
    </div>
  );
}
