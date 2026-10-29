import { Link, useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PHONE, EMAIL, ADDRESS, OPENING_HOURS, HAS_WHATSAPP, whatsappUrl, track, EVENTS } from "@/lib/site";
import GoldsLogo from "@/components/GoldsLogo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { localeFromPath, localizedPath } from "@/lib/localization";
import { uiText } from "@/lib/uiTranslations";

export default function Footer() {
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const text = uiText(locale);
  const localizedExplore = [
    { label: text.nav.memberships, to: localizedPath("memberships", locale) },
    { label: text.nav.passes, to: localizedPath("passes", locale) },
    { label: text.nav.class_schedule, to: localizedPath("class_schedule", locale) },
    { label: text.nav.personal_training, to: localizedPath("personal_training", locale) },
  ];

  return (
    <footer className="bg-obsidian border-t border-white/10 mt-0">
      {/* Legacy ticker */}
      {locale === "en" && <div className="border-y border-brand-orange/30 overflow-hidden py-4 bg-brand-orange/5">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 items-center">
              {["THE MECCA OF FITNESS", "TRAIN STRONGER", "MOVE BETTER", "BECOME MORE", "HURGHADA", "EST. VENICE 1965", "REBORN ON THE RED SEA"].map((t) => (
                <span key={t} className="font-heading text-2xl text-white/15 tracking-[0.04em] flex items-center gap-12 uppercase">
                  {t} <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>}

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <GoldsLogo variant="full" size={44} className="mb-5" />
          {locale === "en" && <p className="text-white/55 text-sm leading-relaxed max-w-sm mb-6">
            The Mecca of Fitness on the Red Sea. Where champions are forged and ordinary becomes legendary. Train where fitness history lives.
          </p>}
        </div>

        <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">{text.footer.explore}</h4>
          <ul className="space-y-2.5 text-sm text-white/55">
            {(locale === "en" ? [
              { label: "Memberships", to: "/memberships" }, { label: "Passes", to: "/passes" },
              { label: "Class Schedule", to: "/classes/schedule" }, { label: "Trainers", to: "/trainers" },
              { label: "Personal Training", to: "/personal-training" }, { label: "Facilities", to: "/facilities" },
            ] : localizedExplore).map((item) => <li key={item.to}><Link to={item.to} className="hover:text-white">{item.label}</Link></li>)}
          </ul>
        </div>

        {locale === "en" && <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">Knowledge</h4>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/fitness-guides" className="hover:text-white">Fitness Guides</Link></li>
            <li><Link to="/workouts" className="hover:text-white">Workouts</Link></li>
            <li><Link to="/fitness-tips" className="hover:text-white">Fitness Tips</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>}

        <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">{text.footer.contact}</h4>
          <ul className="space-y-3 text-sm text-white/55">
            {ADDRESS && <li className="flex gap-2.5"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {ADDRESS}</li>}
            {OPENING_HOURS && <li className="flex gap-2.5"><Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {OPENING_HOURS}</li>}
            {PHONE && <li>
              <a href={`tel:${PHONE}`} onClick={() => track(EVENTS.phoneClick, { location: "footer" })} className="flex gap-2.5 hover:text-white">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {PHONE}
              </a>
            </li>}
            {EMAIL && <li>
              <a href={`mailto:${EMAIL}`} onClick={() => track(EVENTS.emailClick, { location: "footer" })} className="flex gap-2.5 hover:text-white">
                <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {EMAIL}
              </a>
            </li>}
            {HAS_WHATSAPP && <li>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" onClick={() => track(EVENTS.whatsappClick, { location: "footer" })} className="inline-flex items-center gap-2 mt-1 text-gold font-semibold">
                <WhatsAppIcon className="w-4 h-4" /> {text.actions.whatsapp} →
              </a>
            </li>}
            {!ADDRESS && !OPENING_HOURS && !PHONE && !EMAIL && !HAS_WHATSAPP && locale === "en" && <li><Link to="/contact" className="text-gold hover:text-white">Send an enquiry →</Link></li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 pb-20 lg:pb-6">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-white/35">
          <p>© {new Date().getFullYear()} Gold's Gym Hurghada. {text.footer.rights}</p>
          {locale === "en" && <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white/70">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white/70">Terms</Link>
            <Link to="/contact" className="hover:text-white/70">Contact</Link>
          </div>}
        </div>
      </div>
    </footer>
  );
}
