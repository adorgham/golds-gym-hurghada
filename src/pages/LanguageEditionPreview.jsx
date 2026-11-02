import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LanguageEditionView from "@/components/edition/LanguageEditionView";
import { useAuth } from "@/lib/AuthContext";
import { LOCALES, isSupportedLocale } from "@/lib/localization";
import { isLanguageEdition } from "@/lib/pageEditions";
import { useSeo } from "@/lib/seo";

export default function LanguageEditionPreview() {
  const { editionId = "", locale = "" } = useParams();
  const { user } = useAuth();
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSeo({
    title: edition ? `Preview — ${edition.title}` : "Language edition preview",
    description: "Administrator-only draft preview",
    noindex: true,
  });

  useEffect(() => {
    if (user?.role !== "admin" || !editionId || !isSupportedLocale(locale)) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError("");
    base44.entities.SitePage.get(editionId)
      .then((record) => {
        if (!active) return;
        if (!isLanguageEdition(record)) throw new Error("This record is not a language edition.");
        if (record.locale !== locale) throw new Error("The preview language does not match this edition.");
        setEdition(record);
      })
      .catch((cause) => {
        if (active) setError(cause.message || "Could not load this edition preview.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editionId, locale, user?.role]);

  useEffect(() => {
    if (!edition) return undefined;
    document.documentElement.lang = edition.locale;
    document.documentElement.dir = edition.direction || LOCALES[edition.locale]?.direction || "ltr";
    return undefined;
  }, [edition]);

  if (user?.role !== "admin") {
    return <div className="min-h-screen px-5 pt-32 text-center"><h1 className="font-heading text-4xl text-white">ADMIN ACCESS ONLY</h1><p className="mt-3 text-white/55">Draft previews are restricted to administrators.</p></div>;
  }
  if (loading) return <div className="grid min-h-[70vh] place-items-center px-5 pt-28 text-sm text-white/45" role="status">Loading preview…</div>;
  if (error || !edition) return <div className="min-h-screen px-5 pt-32 text-center"><h1 className="font-heading text-4xl text-white">PREVIEW UNAVAILABLE</h1><p className="mt-3 text-white/55">{error || "The edition could not be found."}</p><Link to="/admin" className="mt-6 inline-block text-gold hover:underline">← Back to CMS</Link></div>;

  const status = edition.workflow_status || (edition.is_published ? "published" : "draft");
  return <>
    <aside className="sticky top-24 z-40 border-y border-gold/30 bg-obsidian/95 px-5 py-3 shadow-xl backdrop-blur" dir="ltr">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-sm">
        <div><strong className="text-gold">ADMIN PREVIEW</strong><span className="ml-3 text-white/60">{LOCALES[edition.locale]?.label} · {status} · v{edition.version || 1}</span></div>
        <div className="flex items-center gap-4"><span className="text-xs text-white/45">Forms are disabled. This URL is protected and noindex.</span><Link to="/admin" className="font-semibold text-gold hover:underline">Back to CMS</Link></div>
      </div>
    </aside>
    <LanguageEditionView edition={edition} preview />
  </>;
}
