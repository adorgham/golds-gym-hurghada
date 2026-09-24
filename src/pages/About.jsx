import { useSeo, breadcrumbsLd } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  useSeo({
    title: "About",
    description: "Gold's Gym Hurghada — the Mecca of Fitness on the Red Sea. Heritage of Venice, reborn in Egypt. Train where fitness history lives.",
    canonical: "https://goldsgymhurghada.com/about",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "About", url: "https://goldsgymhurghada.com/about" }]),
  });

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Our Story" title="TRAIN WHERE" accent="HISTORY LIVES" subtitle="Born in Venice Beach, 1965. Reborn on the Red Sea. Gold's Gym Hurghada carries the legacy of the Mecca of Bodybuilding to Egypt's premier coast." />
        </div>
      </section>

      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="aspect-[4/5] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534438327276-1ff8e2a4f5a3?auto=format&fit=crop&w=1200&q=80" alt="Gold's Gym Hurghada" className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="space-y-5 text-white/65 leading-relaxed">
              <p>For over 60 years, Gold's Gym has been the global symbol of serious training. From the original Venice Beach "Mecca" that shaped bodybuilding legends, to a worldwide network of performance centers — the name means one thing: <span className="text-gold font-semibold">where champions train.</span></p>
              <p>Gold's Gym Hurghada brings that heritage to the Red Sea. A 2,000m² facility built for strength, conditioning and community — open to residents, tourists and athletes alike.</p>
              <p>Whether you're here for a day, a week, or a lifetime, you're training in a space designed to make you more.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 lg:px-10 py-16">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { v: 1965, l: "Founded in Venice" },
            { v: 60, s: "+", l: "Years of Heritage" },
            { v: 20, s: "+", l: "Elite Trainers" },
            { v: 7, l: "Days a Week" },
          ].map((s) => (
            <Reveal key={s.l}>
              <div className="border-l-2 border-gold pl-5">
                <div className="font-heading text-5xl text-white"><AnimatedCounter value={s.v} suffix={s.s || ""} /></div>
                <div className="text-xs text-white/50 mt-1 uppercase tracking-wide">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 lg:px-10 py-16">
        <Reveal className="max-w-[1400px] mx-auto text-center">
          <h2 className="font-heading text-4xl lg:text-6xl text-white leading-tight">HURGHADA.<br />THIS IS YOUR GYM.</h2>
          <Link to="/memberships" className="mt-8 inline-flex items-center gap-2 bg-gold text-obsidian font-heading tracking-wide px-8 py-4 hover:brightness-110 transition-all clip-tag">
            JOIN NOW <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}