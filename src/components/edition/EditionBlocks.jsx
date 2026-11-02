import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import LeadForm from "@/components/LeadForm";
import { publishedOnly } from "@/lib/content";
import { localizeInternalHref, localizedPath } from "@/lib/localization";
import { addDays, getCairoToday, resolveSchedule } from "@/lib/schedule";
import { uiText } from "@/lib/uiTranslations";

const intlLocales = Object.freeze({ en: "en-EG", ar: "ar-EG", de: "de-DE", ru: "ru-RU" });

function BlockHeading({ children }) {
  return children ? <h2 className="font-heading text-3xl text-white lg:text-4xl">{children}</h2> : null;
}

function InternalOrExternalLink({ to, className, children }) {
  if (/^https?:\/\//i.test(to)) return <a href={to} target="_blank" rel="noreferrer" className={className}>{children}</a>;
  return <Link to={to || "/"} className={className}>{children}</Link>;
}

export default function EditionBlocks({ blocks, locale, pageKey, interactive = true }) {
  return <div className="space-y-6 lg:space-y-8">
    {blocks.map((block) => {
      if (block.type === "rich_text") return <section key={block.block_key} className="border border-white/10 bg-white/[0.02] p-6 lg:p-10"><BlockHeading>{block.heading}</BlockHeading><div className="prose-content mt-4 max-w-none text-white/65"><ReactMarkdown>{block.body}</ReactMarkdown></div>{block.cta_label && block.cta_url && <EditionCta block={block} locale={locale} />}</section>;
      if (block.type === "faq") return <details key={block.block_key} className="group border border-white/10 bg-white/[0.02] p-5"><summary className="cursor-pointer list-none font-heading text-xl text-white marker:hidden">{block.heading}</summary><div className="prose-content mt-3 text-white/60"><ReactMarkdown>{block.body}</ReactMarkdown></div></details>;
      if (block.type === "cta") return <section key={block.block_key} className="border border-gold/25 bg-gold/[0.04] p-7 lg:flex lg:items-center lg:justify-between lg:gap-8"><div><BlockHeading>{block.heading}</BlockHeading>{block.body && <div className="prose-content mt-3 text-white/60"><ReactMarkdown>{block.body}</ReactMarkdown></div>}</div><EditionCta block={block} locale={locale} /></section>;
      if (block.type === "offer_grid") return <CanonicalOfferGrid key={block.block_key} block={block} locale={locale} pageKey={pageKey} />;
      if (block.type === "trainer_grid") return <CanonicalTrainerGrid key={block.block_key} block={block} locale={locale} />;
      if (block.type === "schedule") return <CanonicalScheduleSummary key={block.block_key} block={block} locale={locale} />;
      if (block.type === "lead_form") return <section key={block.block_key} className="border border-white/10 bg-white/[0.02] p-6 lg:p-10">{interactive ? <LeadForm locale={locale} leadType={pageKey === "memberships" ? "membership" : pageKey === "passes" ? "pass" : pageKey === "personal_training" ? "trainer_booking" : "contact"} service={pageKey} title={block.heading || undefined} subtitle={block.body} ctaLabel={block.cta_label || undefined} /> : <LeadFormPreview block={block} />}</section>;
      return null;
    })}
  </div>;
}

function LeadFormPreview({ block }) {
  return <div aria-label="Disabled form preview"><BlockHeading>{block.heading}</BlockHeading>{block.body && <p className="mt-3 max-w-3xl text-white/60">{block.body}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2" aria-hidden="true"><div className="h-11 border border-white/10 bg-white/[0.02]" /><div className="h-11 border border-white/10 bg-white/[0.02]" /><div className="h-24 border border-white/10 bg-white/[0.02] sm:col-span-2" /><div className="h-11 w-44 bg-gold/30 sm:col-span-2" /></div><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-300">Form submission disabled in administrator preview</p></div>;
}

function EditionCta({ block, locale }) {
  if (!block.cta_label || !block.cta_url) return null;
  const target = localizeInternalHref(block.cta_url, locale);
  return <InternalOrExternalLink to={target} className="mt-5 inline-flex shrink-0 items-center gap-2 bg-gold px-6 py-3 font-heading text-obsidian clip-tag">{block.cta_label}<ArrowRight className="h-4 w-4" /></InternalOrExternalLink>;
}

function CanonicalOfferGrid({ block, locale, pageKey }) {
  const [records, setRecords] = useState([]);
  const text = uiText(locale);

  useEffect(() => {
    const memberships = pageKey === "memberships" || pageKey === "home" ? base44.entities.Membership.list("display_order").catch(() => []) : Promise.resolve([]);
    const passes = pageKey === "passes" || pageKey === "home" ? base44.entities.Pass.list("display_order").catch(() => []) : Promise.resolve([]);
    Promise.all([memberships, passes]).then(([membershipRecords, passRecords]) => setRecords([
      ...publishedOnly(membershipRecords).map((record) => ({ ...record, kind: "membership" })),
      ...publishedOnly(passRecords).map((record) => ({ ...record, kind: "pass" })),
    ]));
  }, [pageKey]);

  return <section className="border border-white/10 bg-white/[0.02] p-6 lg:p-10"><BlockHeading>{block.heading}</BlockHeading>{block.body && <p className="mt-3 max-w-3xl text-white/55">{block.body}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{records.map((record) => <article key={`${record.kind}:${record.id || record.slug}`} className="border border-white/10 p-5"><h3 className="font-heading text-2xl text-white">{record.name}</h3><p className="mt-2 text-gold"><span className="font-heading text-3xl">{new Intl.NumberFormat(intlLocales[locale]).format(record.price)}</span> {record.currency || "EGP"}</p>{record.kind === "pass" && <p className="mt-2 text-sm text-white/50">{new Intl.NumberFormat(intlLocales[locale]).format(record.days)} {text.units.days}</p>}{record.kind === "membership" && locale === "en" && <p className="mt-2 text-sm text-white/50">{record.duration}</p>}</article>)}{records.length === 0 && <p className="col-span-full text-sm text-white/40">{text.states.noItems}</p>}</div>{block.cta_label && block.cta_url && <EditionCta block={block} locale={locale} />}</section>;
}

function CanonicalTrainerGrid({ block, locale }) {
  const [records, setRecords] = useState([]);
  const text = uiText(locale);
  useEffect(() => { base44.entities.Trainer.list("display_order").then((items) => setRecords(publishedOnly(items))).catch(() => setRecords([])); }, []);
  return <section className="border border-white/10 bg-white/[0.02] p-6 lg:p-10"><BlockHeading>{block.heading}</BlockHeading>{block.body && <p className="mt-3 max-w-3xl text-white/55">{block.body}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{records.map((trainer) => <article key={trainer.id || trainer.slug} className="border border-white/10 p-5"><UserRound className="h-6 w-6 text-gold" /><h3 className="mt-3 font-heading text-xl text-white">{trainer.name}</h3>{trainer.title && locale === "en" && <p className="mt-1 text-sm text-white/45">{trainer.title}</p>}</article>)}{records.length === 0 && <p className="col-span-full text-sm text-white/40">{text.states.noItems}</p>}</div>{block.cta_label && block.cta_url && <EditionCta block={block} locale={locale} />}</section>;
}

function CanonicalScheduleSummary({ block, locale }) {
  const [sessions, setSessions] = useState([]);
  const text = uiText(locale);

  useEffect(() => {
    Promise.all([
      base44.entities.ClassSession.list().catch(() => []),
      base44.entities.ScheduleOverride.list().catch(() => []),
      base44.entities.OneOffSession.list().catch(() => []),
      base44.entities.FitnessClass.list().catch(() => []),
      base44.entities.Trainer.list().catch(() => []),
    ]).then(([recurring, overrides, oneOffs, classes, trainers]) => {
      const today = getCairoToday();
      setSessions(resolveSchedule({ recurring, overrides, oneOffs, classes, trainers, fromDate: today, toDate: addDays(today, 6) }).filter((session) => !session.is_cancelled).slice(0, 12));
    });
  }, []);

  const dateFormatter = new Intl.DateTimeFormat(intlLocales[locale], { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Cairo" });
  return <section className="border border-white/10 bg-white/[0.02] p-6 lg:p-10"><BlockHeading>{block.heading}</BlockHeading>{block.body && <p className="mt-3 max-w-3xl text-white/55">{block.body}</p>}<div className="mt-6 grid gap-3 md:grid-cols-2">{sessions.map((session) => <article key={session.occurrence_key} className="flex items-start gap-4 border border-white/10 p-4"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><div><p className="text-xs uppercase tracking-wide text-white/40">{dateFormatter.format(new Date(`${session.occurrence_date}T12:00:00Z`))}</p><h3 className="font-heading text-xl text-white">{session.class_name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-white/50"><Clock3 className="h-3.5 w-3.5" />{session.start_time}{session.trainer_name ? ` · ${session.trainer_name}` : ""}</p></div></article>)}{sessions.length === 0 && <p className="col-span-full text-sm text-white/40">{text.states.noItems}</p>}</div><InternalOrExternalLink to={localizedPath("class_schedule", locale)} className="mt-6 inline-flex items-center gap-2 text-gold font-heading">{text.actions.schedule}<ArrowRight className="h-4 w-4" /></InternalOrExternalLink></section>;
}
