import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { ArrowRight, Target, Users, TrendingUp, Heart } from "lucide-react";

const GOALS = [
  { icon: TrendingUp, title: "Build Strength", desc: "Progressive overload programming to move heavier iron, safely." },
  { icon: Target, title: "Lose Weight", desc: "Structured training + nutrition guidance for sustainable fat loss." },
  { icon: Users, title: "Bodybuilding", desc: "Hypertrophy-focused programming for size, symmetry and stage prep." },
  { icon: Heart, title: "General Fitness", desc: "Beginner-friendly coaching to build a foundation that lasts." },
];

export default function PersonalTraining() {
  useSeo({
    title: "Personal Training",
    description: "1-on-1 personal training at Gold's Gym Hurghada. Work with elite coaches to reach your strength, fat loss or bodybuilding goals faster.",
    canonical: "https://goldsgymhurghada.com/personal-training",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Personal Training", url: "https://goldsgymhurghada.com/personal-training" }]),
  });

  const [trainers, setTrainers] = useState([]);
  useEffect(() => { base44.entities.Trainer.list("display_order").then(setTrainers).catch(() => setTrainers([])); }, []);
  const list = trainers.length ? trainers : [{ name: "Ahmed Mohamed", title: "Head Strength Coach", slug: "ahmed-mohamed" }, { name: "Sara Hassan", title: "Women's Fitness Specialist", slug: "sara-hassan" }, { name: "Omar Khalil", title: "Functional Training Coach", slug: "omar-khalil" }, { name: "Lina Farouk", title: "Yoga & Mobility Coach", slug: "lina-farouk" }];

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Personal Training" title="YOUR TRAINER." subtitle="YOUR GOAL. YOUR PROGRAM." />
          <p className="mt-5 text-white/55 text-lg max-w-2xl">One-on-one coaching with Gold's Gym Hurghada's elite trainers. Personalized programming, accountability, and results — faster than you'd reach them alone.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/trainers" onClick={() => track(EVENTS.trainerView, { location: "pt_hero" })} className="inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
              BROWSE TRAINERS <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={whatsappUrl("Hi, I'd like to know about personal training.")} target="_blank" rel="noreferrer" onClick={() => track(EVENTS.whatsappClick, { location: "pt_hero" })} className="inline-flex items-center border border-white/20 text-white font-heading tracking-wide px-8 py-4 hover:border-gold hover:text-gold transition-all">
              <WhatsAppIcon className="w-4 h-4" /> TALK ON WHATSAPP
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/10">
          {GOALS.map((g, i) => (
            <Reveal key={g.title} delay={i * 70}>
              <div className="bg-obsidian p-7 h-full hover:bg-white/[0.03] transition-colors">
                <g.icon className="w-8 h-8 text-gold mb-4" />
                <h3 className="font-heading text-xl text-white mb-2">{g.title}</h3>
                <p className="text-white/50 text-sm">{g.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Pick Your Coach" title="CHOOSE A" accent="TRAINER" />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {list.map((t, i) => (
              <Reveal key={t.slug || i} delay={i * 70}>
                <Link to={t.slug ? `/trainers/${t.slug}` : "/trainers"} onClick={() => track(EVENTS.trainerView, { trainer: t.name, location: "pt_page" })}
                  className="group block border border-white/10 p-6 hover:border-gold hover:bg-gold/5 transition-all h-full">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center font-heading text-2xl text-gold mb-4">{t.name.charAt(0)}</div>
                  <h3 className="font-heading text-lg text-white group-hover:text-gold">{t.name}</h3>
                  <p className="text-xs text-white/45">{t.title}</p>
                  <span className="inline-flex items-center gap-1 text-gold text-sm font-heading mt-4 group-hover:gap-2 transition-all">BOOK <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-10 py-20">
        <Reveal className="max-w-[1400px] mx-auto">
          <div className="border-l-2 border-gold pl-6">
            <h3 className="font-heading text-3xl text-white mb-3">HOW IT WORKS</h3>
            <ol className="space-y-3 text-white/60">
              <li><span className="text-gold font-heading">01.</span> Browse trainers and pick your coach.</li>
              <li><span className="text-gold font-heading">02.</span> Submit a booking request with your goal and preferred time.</li>
              <li><span className="text-gold font-heading">03.</span> Your trainer contacts you to confirm and build your program.</li>
              <li><span className="text-gold font-heading">04.</span> Start training. Track progress. Become more.</li>
            </ol>
          </div>
        </Reveal>
      </section>
    </div>
  );
}