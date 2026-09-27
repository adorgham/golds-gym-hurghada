import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, organizationLd } from "@/lib/seo";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import SectionHeading from "@/components/SectionHeading";
import { ArrowRight, Dumbbell, Flame, Users, Activity, Heart, Zap } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1534438327276-1ff8e2a4f5a3?auto=format&fit=crop&w=2000&q=80";
const EXPERIENCE_IMG = "https://images.unsplash.com/photo-1571902943202-507ec2610f02?auto=format&fit=crop&w=1600&q=80";

const CATEGORIES = [
{ name: "Bodybuilding", icon: Dumbbell, desc: "Build mass, sculpt symmetry, train like a champion." },
{ name: "Strength", icon: Zap, desc: "Move heavy iron. Build raw, functional power." },
{ name: "Functional", icon: Activity, desc: "Train movement patterns for real-world athleticism." },
{ name: "Cardio", icon: Heart, desc: "Engineer endurance. Burn fat. Forge conditioning." },
{ name: "Group Training", icon: Users, desc: "Energy of the pack. Classes that push you further." },
{ name: "Personal Training", icon: Flame, desc: "One-on-one coaching tailored to your goal." }];


export default function Home() {
  useSeo({
    title: "The Mecca of Fitness",
    description: "Gold's Gym Hurghada — train stronger, move better, become more. Memberships, day passes, group classes and elite personal trainers on the Red Sea.",
    canonical: "https://goldsgymhurghada.com/",
    jsonLd: organizationLd
  });

  const [memberships, setMemberships] = useState([]);
  const [passes, setPasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    Promise.all([
    base44.entities.Membership.list().catch(() => []),
    base44.entities.Pass.list("display_order").catch(() => []),
    base44.entities.Trainer.filter({ is_featured: true }).catch(() => base44.entities.Trainer.list().catch(() => [])),
    base44.entities.ClassSession.list().catch(() => []),
    base44.entities.Article.filter({ is_featured: true }).catch(() => base44.entities.Article.list("-published_date", 4).catch(() => []))]
    ).then(([m, p, t, s, a]) => {
      setMemberships(m || []);
      setPasses(p || []);
      setTrainers(t || []);
      setSessions(s || []);
      setArticles(a || []);
    });
  }, []);

  const quickOptions = [
  ...memberships.map((m) => ({ ...m, kind: "membership", to: `/memberships`, price: m.price, label: m.name })),
  ...passes.map((p) => ({ ...p, kind: "pass", to: `/passes/${p.slug}`, price: p.price, label: p.days === 1 ? "Day Pass" : `${p.days}-Day Pass` }))].
  slice(0, 5);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Athlete training at Gold's Gym Hurghada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/60" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-10 w-full pt-32 pb-16">
          <Reveal>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-12 bg-gold" />
              <span className="text-gold text-xs font-bold tracking-[0.35em] uppercase">The Mecca of Fitness</span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-heading text-[10.5vw] sm:text-[4.2rem] lg:text-[6.3rem] leading-[0.75] tracking-tighter text-white">
              BORN IN<br />
              <span className="gold-text">VENICE.</span><br />
              REBORN IN<br />
              HURGHADA.
            </h1>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-7 text-lg sm:text-xl text-white/70 max-w-xl font-light">
              Train stronger. Move better. Become more. The legendary Gold's Gym experience, in Hurghada.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/memberships" onClick={() => track(EVENTS.membershipSelect, { location: "hero" })}
              className="group inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
                JOIN GOLD'S GYM
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/memberships" className="inline-flex items-center border border-white/25 text-white font-heading tracking-wide px-8 py-4 hover:border-gold hover:text-gold transition-all">
                EXPLORE MEMBERSHIPS
              </Link>
              <Link to="/passes/day-pass" onClick={() => track(EVENTS.passView, { pass: "day-pass", location: "hero" })}
              className="inline-flex items-center text-white/70 font-semibold hover:text-gold transition-colors px-2">
                Get a Day Pass →
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
      </section>

      {/* QUICK MEMBERSHIP SELECTOR */}
      <section className="relative -mt-10 z-10 px-5 lg:px-10">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="glass border border-white/10 shadow-box p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="font-heading text-xl text-white">CHOOSE YOUR ACCESS</h2>
              <span className="text-xs tracking-[0.2em] text-gold font-semibold uppercase">One day or every day</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {quickOptions.length === 0 ?
              <>
                  {[["Monthly", "/memberships"], ["Day Pass", "/passes/day-pass"], ["3-Day", "/passes/3-day-pass"], ["5-Day", "/passes/5-day-pass"], ["7-Day", "/passes/7-day-pass"]].map(([l, to]) =>
                <Link key={l} to={to} className="group border border-white/10 p-4 hover:border-gold hover:bg-gold/5 transition-all">
                      <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-1">{to.includes("memberships") ? "Resident" : "Visitor"}</div>
                      <div className="font-heading text-lg text-white group-hover:text-gold">{l}</div>
                      <div className="text-xs text-white/40 mt-1">Tap to view →</div>
                    </Link>
                )}
                </> :
              quickOptions.map((o) =>
              <Link key={o.to + o.label} to={o.to}
              onClick={() => track(o.kind === "membership" ? EVENTS.membershipView : EVENTS.passView, { location: "quick_selector", item: o.label })}
              className="group border border-white/10 p-4 hover:border-gold hover:bg-gold/5 transition-all">
                  <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-1">{o.kind === "membership" ? "Resident" : "Visitor"}</div>
                  <div className="font-heading text-lg text-white group-hover:text-gold">{o.label}</div>
                  {o.price != null && <div className="text-sm text-white/50 mt-1">{o.price} {o.currency || "EGP"}</div>}
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* EXPERIENCE / STATS */}
      <section className="py-24 lg:py-32 px-5 lg:px-10">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <SectionHeading
              eyebrow="The Experience"
              title="AN ARCHITECTURE OF"
              accent="STRENGTH"
              subtitle="Step into a training environment engineered for results. Every zone, every plate, every meter is built to push you past your limits." />
            
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
              { v: 2000, s: "+", l: "m² Training Floor" },
              { v: 80, s: "+", l: "Machines" },
              { v: 24, s: "/7", l: "Open Daily" }].
              map((stat) =>
              <Reveal key={stat.l}>
                  <div className="border-l-2 border-gold pl-4">
                    <div className="font-heading text-4xl lg:text-5xl text-white">
                      <AnimatedCounter value={stat.v} suffix={stat.s} />
                    </div>
                    <div className="text-xs text-white/50 mt-1 uppercase tracking-wide">{stat.l}</div>
                  </div>
                </Reveal>
              )}
            </div>
            <Reveal delay={200}>
              <Link to="/facilities" className="mt-10 inline-flex items-center gap-2 text-gold font-heading tracking-wide hover:gap-3 transition-all">
                EXPLORE FACILITIES <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={EXPERIENCE_IMG} alt="Gold's Gym Hurghada training floor" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-gold/20" />
              <div className="absolute bottom-4 left-4 glass px-4 py-3 border-l-2 border-gold">
                <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase">Free Weights Zone</div>
                <div className="font-heading text-white text-sm">Dumbbells up to 60kg</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRAINING CATEGORIES */}
      <section className="py-20 px-5 lg:px-10 bg-teal-textured border-y border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Training Categories" title="CHOOSE YOUR" accent="DISCIPLINE" align="center" />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px">
            {CATEGORIES.map((c, i) =>
            <Reveal key={c.name} delay={i * 60}>
                <div className="group p-8 h-full hover:bg-white/[0.06] transition-colors cursor-default border border-white/5">
                  <c.icon className="w-8 h-8 text-gold mb-5 group-hover:scale-110 transition-transform" />
                  <h3 className="font-heading text-2xl text-white mb-2 tracking-[0.03em] uppercase">{c.name}</h3>
                  <p className="text-white/60 text-sm">{c.desc}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* GROUP CLASSES PREVIEW */}
      <section className="py-24 px-5 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <SectionHeading eyebrow="Group Classes" title="THE PULSE OF" accent="THE FLOOR" subtitle="Energy of the pack. Classes that push you further than you'd push yourself." />
            <Link to="/classes/schedule" className="inline-flex items-center gap-2 text-gold font-heading tracking-wide hover:gap-3 transition-all">
              VIEW FULL SCHEDULE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(sessions.length ? sessions.slice(0, 4) : [
            { class_name: "BODY PUMP", day_of_week: "Tuesday", start_time: "18:00", trainer_name: "Coach", difficulty: "Intermediate" },
            { class_name: "SPINNING", day_of_week: "Wednesday", start_time: "07:00", trainer_name: "Coach", difficulty: "All Levels" },
            { class_name: "YOGA FLOW", day_of_week: "Thursday", start_time: "19:30", trainer_name: "Coach", difficulty: "Beginner" },
            { class_name: "FUNCTIONAL HIIT", day_of_week: "Friday", start_time: "10:00", trainer_name: "Coach", difficulty: "Advanced" }]).
            map((s, i) =>
            <Reveal key={i} delay={i * 70}>
                <Link to="/classes/schedule" onClick={() => track(EVENTS.classView, { class: s.class_name, location: "home_preview" })}
              className="group block border border-white/10 p-5 hover:border-gold hover:bg-gold/5 transition-all h-full">
                  <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-3">{s.day_of_week} · {s.start_time}</div>
                  <h3 className="font-heading text-xl text-white group-hover:text-gold mb-2">{s.class_name}</h3>
                  <div className="text-xs text-white/40">{s.trainer_name || "TBA"} · {s.difficulty || "All Levels"}</div>
                </Link>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* TRAINERS PREVIEW */}
      <section className="py-24 px-5 lg:px-10 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <SectionHeading eyebrow="The Titans" title="MEET THE" accent="TRAINERS" subtitle="Elite coaches. Proven results. Your transformation starts with the right mentor." />
            <Link to="/trainers" className="inline-flex items-center gap-2 text-gold font-heading tracking-wide hover:gap-3 transition-all">
              MEET OUR TRAINERS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(trainers.length ? trainers.slice(0, 4) : [
            { name: "Ahmed Mohamed", title: "Head Strength Coach", slug: "ahmed-mohamed", specializations: ["Strength", "Bodybuilding"] },
            { name: "Sara Hassan", title: "Women's Fitness Specialist", slug: "sara-hassan", specializations: ["Weight Loss", "Women's Fitness"] },
            { name: "Omar Khalil", title: "Functional Training Coach", slug: "omar-khalil", specializations: ["Functional", "Mobility"] },
            { name: "Lina Farouk", title: "Yoga & Mobility Coach", slug: "lina-farouk", specializations: ["Mobility", "Recovery"] }]).
            map((t, i) =>
            <Reveal key={t.slug || i} delay={i * 70}>
                <Link to={t.slug ? `/trainers/${t.slug}` : "/trainers"}
              onClick={() => track(EVENTS.trainerView, { trainer: t.name, location: "home_preview" })}
              className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-4 relative">
                    {t.photo_url && <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />}
                    {!t.photo_url && <div className="w-full h-full flex items-center justify-center text-white/20 font-heading text-6xl">{t.name.charAt(0)}</div>}
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-gold/40 transition-colors" />
                  </div>
                  <h3 className="font-heading text-lg text-white group-hover:text-gold">{t.name}</h3>
                  <p className="text-xs text-white/45">{t.title}</p>
                </Link>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA */}
      <section className="relative py-32 px-5 lg:px-10 overflow-hidden bg-teal-textured">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c6e1f?auto=format&fit=crop&w=2000&q=80" alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative max-w-[1400px] mx-auto text-center">
          <Reveal>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-5">Your strongest version starts here</p>
            <h2 className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tighter">
              ONE DAY OR<br /><span className="gold-text">EVERY DAY.</span><br />START HERE.
            </h2>
            <Link to="/memberships" onClick={() => track(EVENTS.membershipSelect, { location: "home_cta" })}
            className="mt-10 inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-10 py-5 hover:brightness-110 transition-all clip-tag">
              CHOOSE YOUR MEMBERSHIP <ArrowRight className="w-5 h-5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FITNESS KNOWLEDGE */}
      <section className="py-24 px-5 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <SectionHeading eyebrow="Knowledge Hub" title="TRAIN YOUR" accent="MIND" subtitle="Workouts, guides and tips from our coaches — built to make you smarter in the gym." />
            <Link to="/blog" className="inline-flex items-center gap-2 text-gold font-heading tracking-wide hover:gap-3 transition-all">
              ALL ARTICLES <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(articles.length ? articles.slice(0, 3) : [
            { title: "The Push Day Blueprint", slug: "push-day-workout", section: "workouts", excerpt: "A complete push workout for strength and hypertrophy.", category: "Strength" },
            { title: "Nutrition for Fat Loss: A No-Nonsense Guide", slug: "nutrition-fat-loss", section: "fitness-guides", excerpt: "How to structure your diet to shed fat without losing muscle.", category: "Nutrition" },
            { title: "5 Mobility Drills Every Lifter Needs", slug: "mobility-drills", section: "fitness-tips", excerpt: "Move better, lift heavier, stay injury-free.", category: "Mobility" }]).
            map((a, i) => {
              const to = `/${a.section}/${a.slug}`;
              return (
                <Reveal key={a.slug || i} delay={i * 80}>
                  <Link to={to} className="group block h-full">
                    <div className="aspect-[16/10] overflow-hidden bg-white/5 mb-4">
                      {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase mb-2">{a.category} · {a.section.replace("-", " ")}</div>
                    <h3 className="font-heading text-xl text-white group-hover:text-gold leading-tight">{a.title}</h3>
                    <p className="text-white/45 text-sm mt-2">{a.excerpt}</p>
                  </Link>
                </Reveal>);

            })}
          </div>
        </div>
      </section>

      {/* WHATSAPP STRIP */}
      <section className="px-5 lg:px-10 pb-24">
        <Reveal className="max-w-[1400px] mx-auto">
          <a href={whatsappUrl("Hi Gold's Gym Hurghada, I'd like to know more.")} target="_blank" rel="noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: "home_strip" })}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gold text-obsidian p-6 lg:p-8 clip-tag hover:brightness-105 transition-all">
            <span className="font-heading text-2xl lg:text-3xl tracking-tight text-[hsl(var(--background))] flex items-center gap-3"><WhatsAppIcon className="w-7 h-7" /> TALK TO US ON WHATSAPP</span>
            <span className="font-heading text-sm tracking-wide flex items-center gap-2 text-[hsl(var(--background))]">CHAT NOW <ArrowRight className="w-5 h-5" /></span>
          </a>
        </Reveal>
      </section>
    </div>);

}