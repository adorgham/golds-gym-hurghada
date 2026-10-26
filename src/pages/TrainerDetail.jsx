import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getAttribution } from "@/lib/attribution";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, HAS_WHATSAPP, whatsappUrl } from "@/lib/site";
import Reveal from "@/components/Reveal";
import { ArrowRight, Check, Award, Globe, Clock, Instagram, Loader2, Calendar } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ContentState from "@/components/ContentState";
import { isPublished } from "@/lib/content";

function safeUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === "http:" || u.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export default function TrainerDetail() {
  const { slug } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [booking, setBooking] = useState({ preferred_date: "", preferred_time: "", training_goal: "", is_member: false, name: "", phone: "", whatsapp: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef(Date.now());

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    base44.entities.Trainer.filter({ slug })
      .then((records) => setTrainer(records.find(isPublished) || null))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
    track(EVENTS.trainerView, { trainer: slug, location: "trainer_detail" });
    track(EVENTS.trainerBookingStart, { trainer: slug });
  }, [slug]);

  const t = trainer || {};
  useSeo({
    title: t.name ? `${t.name} — Personal Trainer` : "Personal Trainer",
    description: t.bio || `Book a personal training session with ${t.name} at Gold's Gym Hurghada.`,
    canonical: `https://goldsgymhurghada.com/trainers/${slug}`,
    noindex: !trainer,
    jsonLd: [
      breadcrumbsLd([
        { name: "Home", url: "https://goldsgymhurghada.com/" },
        { name: "Trainers", url: "https://goldsgymhurghada.com/trainers" },
        { name: t.name || "Trainer", url: `https://goldsgymhurghada.com/trainers/${slug}` },
      ]),
      { "@context": "https://schema.org", "@type": "Person", name: t.name, jobTitle: t.title, worksFor: { "@type": "HealthClub", name: "Gold's Gym Hurghada" } },
    ],
  });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError("");
    try {
      await base44.functions.invoke("submit-pt-enquiry", {
        ...booking,
        trainer_id: t.id,
        trainer_name: t.name,
        source_page: `/trainers/${slug}`,
        website,
        form_started_at: formStartedAt.current,
        ...getAttribution(),
      });
      track(EVENTS.trainerBookingSubmit, { trainer: t.name, source: "trainer_detail" });
      setDone(true);
    } catch (err) {
      setSubmissionError(err.response?.data?.error || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = "w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors";

  if (loading) return <div className="pt-32 px-5 text-white/40">Loading…</div>;
  if (!trainer) return <div className="min-h-[60vh] px-5 pb-24 pt-36 lg:px-10"><div className="mx-auto max-w-3xl"><ContentState title={failed ? "Trainer profile temporarily unavailable" : "Trainer not found"} message="This trainer profile is not currently published. Contact the gym for help choosing a coach." actionTo="/trainers" actionLabel="View trainers" /></div></div>;

  return (
    <div className="pt-28">
      <div className="px-5 lg:px-10 py-6">
        <div className="max-w-[1400px] mx-auto text-xs text-white/40 flex gap-2 items-center">
          <Link to="/" className="hover:text-gold">Home</Link> <span>/</span>
          <Link to="/trainers" className="hover:text-gold">Trainers</Link> <span>/</span>
          <span className="text-gold">{t.name}</span>
        </div>
      </div>

      {/* HERO */}
      <section className="px-5 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="aspect-[4/5] overflow-hidden bg-white/5 relative max-w-md">
              {t.photo_url ? <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-heading text-9xl text-white/15">{t.name?.charAt(0)}</div>}
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="text-[10px] tracking-[0.3em] text-gold font-semibold uppercase mb-3">{t.title}</div>
            <h1 className="font-heading text-6xl lg:text-7xl text-white leading-[0.9] tracking-tighter">{t.name}</h1>
            <div className="flex flex-wrap gap-2 mt-5">
              {(t.specializations || []).map((s) => (
                <span key={s} className="text-xs font-semibold tracking-wide uppercase border border-gold/40 text-gold px-3 py-1">{s}</span>
              ))}
            </div>
            <p className="text-white/60 text-lg mt-6 max-w-lg">{t.bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-7 py-4 hover:brightness-110 transition-all clip-tag">
                BOOK PERSONAL TRAINING <ArrowRight className="w-4 h-4" />
              </a>
              {HAS_WHATSAPP && <a href={whatsappUrl(`Hi, I'd like to ask about training with ${t.name}.`)} target="_blank" rel="noreferrer"
                onClick={() => track(EVENTS.whatsappClick, { location: "trainer_hero", trainer: t.name })}
                className="inline-flex items-center gap-2 border border-white/20 text-white font-heading tracking-wide px-7 py-4 hover:border-gold hover:text-gold transition-all">
                <WhatsAppIcon className="w-4 h-4" /> ASK ABOUT THIS TRAINER
              </a>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="px-5 lg:px-10 py-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/10">
          {[
            { icon: Clock, label: "Experience", value: `${t.years_experience}+ years` },
            { icon: Award, label: "Certifications", value: (t.certifications || []).length },
            { icon: Globe, label: "Languages", value: (t.languages || []).join(" · ") },
            { icon: Calendar, label: "Availability", value: t.availability || "Flexible" },
          ].map((s) => (
            <div key={s.label} className="bg-obsidian p-5">
              <s.icon className="w-5 h-5 text-gold mb-3" />
              <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase">{s.label}</div>
              <div className="font-heading text-white text-base mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DETAILS */}
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-heading text-3xl text-white mb-4">ABOUT</h2>
              <p className="text-white/60 leading-relaxed">{t.bio}</p>
            </div>
            <div>
              <h2 className="font-heading text-3xl text-white mb-4">TRAINING PHILOSOPHY</h2>
              <blockquote className="border-l-2 border-gold pl-5 text-white/70 text-lg italic">"{t.philosophy}"</blockquote>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-heading text-xl text-gold mb-3">CERTIFICATIONS</h3>
                <ul className="space-y-2">
                  {(t.certifications || []).map((c) => <li key={c} className="flex gap-2 text-white/65 text-sm"><Check className="w-4 h-4 text-gold shrink-0" /> {c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-xl text-gold mb-3">EXPERTISE</h3>
                <ul className="space-y-2">
                  {(t.expertise_areas || []).map((c) => <li key={c} className="flex gap-2 text-white/65 text-sm"><Check className="w-4 h-4 text-gold shrink-0" /> {c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-xl text-gold mb-3">CLIENT FOCUS</h3>
                <ul className="space-y-2">
                  {(t.client_focus || []).map((c) => <li key={c} className="flex gap-2 text-white/65 text-sm"><Check className="w-4 h-4 text-gold shrink-0" /> {c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-xl text-gold mb-3">LANGUAGES</h3>
                <p className="text-white/65 text-sm">{(t.languages || []).join(", ")}</p>
                {safeUrl(t.instagram_url) && (
                  <a href={safeUrl(t.instagram_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-gold text-sm mt-3 hover:underline">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* BOOKING FORM */}
          <div id="book" className="lg:sticky lg:top-28 h-fit">
            <div className="border border-gold/30 bg-white/[0.02] p-6">
              {done ? (
                <div className="text-center py-8 animate-scale-in">
                  <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7 text-gold" /></div>
                  <h3 className="font-heading text-2xl text-white mb-2">Booking Request Sent</h3>
                  <p className="text-white/55 text-sm mb-5">{t.name} will contact you to confirm your session.</p>
                  {HAS_WHATSAPP && <a href={whatsappUrl(`Hi, I just requested a session with ${t.name}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading px-6 py-3 clip-tag"><WhatsAppIcon className="w-4 h-4" /> Open WhatsApp</a>}
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-2xl text-white mb-1">BOOK A SESSION</h3>
                  <p className="text-white/45 text-sm mb-5">with {t.name}</p>
                  <form onSubmit={submit} className="space-y-3">
                    <div className="absolute -left-[10000px]" aria-hidden="true">
                      <label htmlFor="booking-website">Website</label>
                      <input id="booking-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="date" value={booking.preferred_date} onChange={(e) => setBooking((b) => ({ ...b, preferred_date: e.target.value }))} className={field} />
                      <input required type="time" value={booking.preferred_time} onChange={(e) => setBooking((b) => ({ ...b, preferred_time: e.target.value }))} className={field} />
                    </div>
                    <input placeholder="Training goal (e.g. fat loss, strength)" value={booking.training_goal} onChange={(e) => setBooking((b) => ({ ...b, training_goal: e.target.value }))} className={field} />
                    <input required placeholder="Your name" value={booking.name} onChange={(e) => setBooking((b) => ({ ...b, name: e.target.value }))} className={field} />
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="tel" placeholder="Phone" value={booking.phone} onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))} className={field} />
                      <input type="tel" placeholder="WhatsApp" value={booking.whatsapp} onChange={(e) => setBooking((b) => ({ ...b, whatsapp: e.target.value }))} className={field} />
                    </div>
                    <input type="email" placeholder="Email" value={booking.email} onChange={(e) => setBooking((b) => ({ ...b, email: e.target.value }))} className={field} />
                    <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                      <input type="checkbox" checked={booking.is_member} onChange={(e) => setBooking((b) => ({ ...b, is_member: e.target.checked }))} className="accent-[#D4AF37]" />
                      I'm an existing member
                    </label>
                    {submissionError && <p className="text-red-400 text-sm" role="alert">{submissionError}</p>}
                    <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-gold text-obsidian font-heading tracking-wide py-3.5 hover:brightness-110 disabled:opacity-60 transition-all clip-tag">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />} REQUEST SESSION
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
