import { useSeo, breadcrumbsLd } from "@/lib/seo";
import { track, EVENTS, PHONE, EMAIL, ADDRESS, whatsappUrl } from "@/lib/site";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import LeadForm from "@/components/LeadForm";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  useSeo({
    title: "Contact",
    description: "Contact Gold's Gym Hurghada. Request a tour, callback, or membership info. Reach us by phone, WhatsApp or email.",
    canonical: "https://goldsgymhurghada.com/contact",
    jsonLd: breadcrumbsLd([{ name: "Home", url: "https://goldsgymhurghada.com/" }, { name: "Contact", url: "https://goldsgymhurghada.com/contact" }]),
  });

  return (
    <div className="pt-28">
      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading eyebrow="Contact" title="GET IN" accent="TOUCH" subtitle="Questions, tours, callbacks — we're here. Reach the Mecca of Fitness on the Red Sea." />
        </div>
      </section>

      <section className="px-5 lg:px-10 py-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: "Call Us", value: PHONE, href: `tel:${PHONE}`, event: EVENTS.phoneClick },
            { icon: MessageCircle, label: "WhatsApp", value: "Chat now", href: whatsappUrl(), event: EVENTS.whatsappClick, ext: true },
            { icon: Mail, label: "Email", value: EMAIL, href: `mailto:${EMAIL}`, event: EVENTS.emailClick },
          ].map((c) => (
            <Reveal key={c.label}>
              <a href={c.href} target={c.ext ? "_blank" : undefined} rel={c.ext ? "noreferrer" : undefined}
                onClick={() => track(c.event, { location: "contact_page" })}
                className="group flex items-center gap-4 border border-white/10 p-6 hover:border-gold hover:bg-gold/5 transition-all h-full">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold"><c.icon className="w-5 h-5" /></div>
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-gold font-semibold uppercase">{c.label}</div>
                  <div className="text-white font-heading group-hover:text-gold">{c.value}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 lg:px-10 py-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-heading text-3xl text-white mb-6">VISIT US</h3>
            <div className="space-y-4 text-white/60">
              <div className="flex gap-3"><MapPin className="w-5 h-5 text-gold shrink-0" /> {ADDRESS}</div>
              <div className="flex gap-3"><Clock className="w-5 h-5 text-gold shrink-0" /> Open daily 06:00 – 24:00</div>
              <div className="flex gap-3"><Phone className="w-5 h-5 text-gold shrink-0" /> {PHONE}</div>
            </div>
            <div className="mt-8 aspect-[16/10] bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.02] p-7">
            <LeadForm leadType="contact" sourcePage="/contact" title="Send a Message" ctaLabel="SEND MESSAGE" />
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <LinkLike href={whatsappUrl("Hi, I'd like to book a gym tour.")} ext label="Request a Gym Tour" />
              <LinkLike href={whatsappUrl("Hi, please call me back about Gold's Gym.")} ext label="Request a Callback" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LinkLike({ href, label, ext }) {
  return (
    <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}
      onClick={() => track(EVENTS.leadSubmit, { lead_type: label.toLowerCase().includes("tour") ? "tour" : "callback", source: "contact_page" })}
      className="flex items-center justify-between border border-white/10 px-4 py-3 hover:border-gold hover:text-gold text-white/70 transition-all">
      <span className="font-heading text-sm">{label}</span>
      <span>→</span>
    </a>
  );
}