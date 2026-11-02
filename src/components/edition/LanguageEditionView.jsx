import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import EditionBlocks from "@/components/edition/EditionBlocks";
import { LOCALES, localizeInternalHref } from "@/lib/localization";
import { normalizeEditionBlocks } from "@/lib/pageEditions";

export default function LanguageEditionView({ edition, preview = false }) {
  const locale = edition.locale;
  const blocks = normalizeEditionBlocks(edition.content_blocks);
  const ctaTarget = localizeInternalHref(edition.primary_cta_url, locale);

  return (
    <div className={preview ? "pb-20 pt-6" : "pb-20 pt-28"} lang={locale} dir={LOCALES[locale].direction}>
      <header className="border-b border-white/10 px-5 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          {edition.hero_eyebrow && <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">{edition.hero_eyebrow}</p>}
          <h1 className="mt-3 max-w-5xl font-heading text-5xl leading-[0.95] text-white sm:text-6xl lg:text-8xl">{edition.hero_heading}</h1>
          {edition.hero_body && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">{edition.hero_body}</p>}
          {edition.primary_cta_label && ctaTarget && (/^https?:\/\//i.test(ctaTarget)
            ? <a href={ctaTarget} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 bg-gold px-7 py-3 font-heading text-obsidian clip-tag">{edition.primary_cta_label}<ArrowRight className="h-4 w-4" /></a>
            : <Link to={ctaTarget} className="mt-8 inline-flex items-center gap-2 bg-gold px-7 py-3 font-heading text-obsidian clip-tag">{edition.primary_cta_label}<ArrowRight className="h-4 w-4" /></Link>)}
        </div>
      </header>

      <main className="px-5 py-10 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1400px]">
          <EditionBlocks blocks={blocks} locale={locale} pageKey={edition.page_key} interactive={!preview} />
        </div>
      </main>
    </div>
  );
}
