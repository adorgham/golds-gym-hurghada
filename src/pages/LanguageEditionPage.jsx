import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LanguageEditionView from "@/components/edition/LanguageEditionView";
import PageNotFound from "@/lib/PageNotFound";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  localizedPath,
} from "@/lib/localization";
import { editionKey } from "@/lib/pageEditions";
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

  return <LanguageEditionView edition={edition} />;
}
