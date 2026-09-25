import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from "lucide-react";
import { PHONE, EMAIL, ADDRESS, whatsappUrl, track, EVENTS } from "@/lib/site";
import GoldsLogo from "@/components/GoldsLogo";

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/10 mt-0">
      {/* Legacy ticker */}
      <div className="border-y border-brand-orange/30 overflow-hidden py-4 bg-brand-orange/5">
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
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <GoldsLogo variant="full" size={44} className="mb-5" />
          <p className="text-white/55 text-sm leading-relaxed max-w-sm mb-6">
            The Mecca of Fitness on the Red Sea. Where champions are forged and ordinary becomes legendary. Train where fitness history lives.
          </p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-colors" aria-label="Social">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">Explore</h4>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li><Link to="/memberships" className="hover:text-white">Memberships</Link></li>
            <li><Link to="/passes" className="hover:text-white">Passes</Link></li>
            <li><Link to="/classes/schedule" className="hover:text-white">Class Schedule</Link></li>
            <li><Link to="/trainers" className="hover:text-white">Trainers</Link></li>
            <li><Link to="/personal-training" className="hover:text-white">Personal Training</Link></li>
            <li><Link to="/facilities" className="hover:text-white">Facilities</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">Knowledge</h4>
          <ul className="space-y-2.5 text-sm text-white/55">
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link to="/fitness-guides" className="hover:text-white">Fitness Guides</Link></li>
            <li><Link to="/workouts" className="hover:text-white">Workouts</Link></li>
            <li><Link to="/fitness-tips" className="hover:text-white">Fitness Tips</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-gold text-sm tracking-[0.1em] mb-4 uppercase">Contact</h4>
          <ul className="space-y-3 text-sm text-white/55">
            <li className="flex gap-2.5"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {ADDRESS}</li>
            <li className="flex gap-2.5"><Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" /> Daily 06:00 – 24:00</li>
            <li>
              <a href={`tel:${PHONE}`} onClick={() => track(EVENTS.phoneClick, { location: "footer" })} className="flex gap-2.5 hover:text-white">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} onClick={() => track(EVENTS.emailClick, { location: "footer" })} className="flex gap-2.5 hover:text-white">
                <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {EMAIL}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" onClick={() => track(EVENTS.whatsappClick, { location: "footer" })} className="inline-flex items-center gap-2 mt-1 text-gold font-semibold">
                WhatsApp Us →
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-white/35">
          <p>© {new Date().getFullYear()} Gold's Gym Hurghada. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-white/70">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white/70">Terms</Link>
            <Link to="/contact" className="hover:text-white/70">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}