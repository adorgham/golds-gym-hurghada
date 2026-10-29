import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import EditionBlocks from "@/components/edition/EditionBlocks";
import PageNotFound from "@/lib/PageNotFound";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isSupportedLocale,
  localizeInternalHref,
  localizedPath,
} from "@/lib/localization";
import { editionKey, normalizeEditionBlocks } from "@/lib/pageEditions";
import { useSeo } from "@/lib/seo";
import { uiText } from "@/lib/uiTranslations";

export default function LanguageEditionPage({ pageKey }) {
  const { locale = "" } = useParams();
  const supported = isSupportedLocale(locale);
  const canonicalPath = supported ? localizedPath(pageKey, locale) : "";
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const text = uiText(supported ? locale : DEFAULT_LOCALE);

  useEffect(() => {
    if (!supported || locale === DEFAULT_LOCALE) {
      setLoading(false);
      setEdition(null);
      return undefined;
    }

    let active = true;
    setEdition(null);
    setLoading(true);
    base44.entities.SitePage.filter({ edition_key: editionKey(pageKey, locale), is_published: true })
      .then((records) => {
        if (active) setEdition(records.find((record) => record.page_key === pageKey && record.locale === locale && record.is_published === true) || null);
      })
      .catch(() => { if (active) setEdition(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [locale, pageKey, supported]);

  useSeo({
    title: edition?.seo_title || edition?.title || "",
    description: edition?.seo_description || "",
    canonical: canonicalPath,
    noindex: !edition,
  });

  if (locale === DEFAULT_LOCALE) return <Navigate to={localizedPath(pageKey, DEFAULT_LOCALE)} replace />;
  if (!supported) return <PageNotFound />;
  if (loading) return <div className="grid min-h-[70vh] place-items-center px-5 pt-28 text-sm text-white/45" role="status">{text.states.loading}</div>;
  if (!edition) return <PageNotFound />;

  const blocks = normalizeEditionBlocks(edition.content_blocks);
  const ctaTarget = localizeInternalHref(edition.primary_cta_url, locale);

  return (
    <div className="pb-20 pt-28" lang={locale} dir={LOCALES[locale].direction}>
      <header className="border-b border-white/10 px-5 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          {edition.hero_eyebrow && <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">{edition.hero_eyebrow}</p>}
          <h1 className="mt-3 max-w-5xl font-heading text-5xl leading-[0.95] text-white sm:text-6xl lg:text-8xl">{edition.hero_heading}</h1>
          {edition.hero_body && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">{edition.hero_body}</p>}
          {edition.primary_cta_label && ctaTarget && (/^https?:\/\//i.test(ctaTarget) ? <a href={ctaTarget} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 bg-gold px-7 py-3 font-heading text-obsidian clip-tag">{edition.primary_cta_label}<ArrowRight className="h-4 w-4" /></a> : <Link to={ctaTarget} className="mt-8 inline-flex items-center gap-2 bg-gold px-7 py-3 font-heading text-obsidian clip-tag">{edition.primary_cta_label}<ArrowRight className="h-4 w-4" /></Link>)}
        </div>
      </header>

      <main className="px-5 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1400px]">
          <EditionBlocks blocks={blocks} locale={locale} pageKey={pageKey} />
        </div>
      </main>
    </div>
  );
}
