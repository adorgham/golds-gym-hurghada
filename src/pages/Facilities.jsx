import { useSeo, breadcrumbsLd } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { Dumbbell, Heart, Activity, Users, Flame, Wind } from "lucide-react";

const ZONES = [
  { icon: Dumbbell, name: "Strength & Free Weights", desc: "Dumbbells to 60kg, racks, plates and benches. The iron that built legends." },
  { icon: Heart, name: "Cardio Zone", desc: "Treadmills, bikes, rowers and ellipticals with Red Sea views." },
  { icon: Activity, name: "Functional Training", desc: "Rigs, sleds, kettlebells, battle ropes and open turf." },
  { icon: Users, name: "Group Class Studios", desc: "Dedicated studios for cycling, pump, yoga and HIIT." },
  { icon: Flame, name: "Personal Training Area", desc: "Private bays for focused 1-on-1 coaching." },
  { icon: Wind, name: "Recovery & Stretching", desc: "Stretch zones, foam rollers and mobility space." },
];

export default function Facilities() {
  useSeo({
    title: "Facilities",
    description: "Explore Gold's Gym Hurghada facilities — strength and free weights, cardio, functional training, group class studios and recovery zones.",
    canonical: "https://goldsgymhurghada.com/facilities",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Facilities", url: "https://goldsgymhurghada.com/facilities" }]),
  });

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="The Facility" title="AN ARCHITECTURE" accent="OF STRENGTH" subtitle="Over 2,000m² of training space, engineered for every discipline and every level." />
        </div>
      </section>

      <section className="px-5 lg:px-10 pb-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6">
          {["https://images.unsplash.com/photo-1534438327276-1ff8e2a4f5a3?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1571902943202-507ec2610f02?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1540497077202-7c8a3999166c?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1581009146145-b5ef050c6e1f?auto=format&fit=crop&w=1200&q=80"].map((src, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="aspect-[16/10] overflow-hidden">
                <img src={src} alt="Gold's Gym Hurghada facility" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/10">
          {ZONES.map((z, i) => (
            <Reveal key={z.name} delay={i * 60}>
              <div className="bg-obsidian p-8 h-full hover:bg-white/[0.03] transition-colors">
                <z.icon className="w-8 h-8 text-gold mb-5" />
                <h3 className="font-heading text-xl text-white mb-2">{z.name}</h3>
                <p className="text-white/50 text-sm">{z.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}