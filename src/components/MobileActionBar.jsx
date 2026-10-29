import { Link, useLocation } from "react-router-dom";
import { Calendar, MessageCircle, Zap } from "lucide-react";
import { HAS_WHATSAPP, whatsappUrl, track, EVENTS } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { localeFromPath, localizedPath } from "@/lib/localization";
import { uiText } from "@/lib/uiTranslations";

export default function MobileActionBar() {
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const text = uiText(locale);

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-gold/30">
      <div className="grid grid-cols-3">
        <Link
          to={localizedPath("memberships", locale)}
          onClick={() => track(EVENTS.membershipSelect, { location: "mobile_bar" })}
          className="flex flex-col items-center gap-0.5 py-3 text-obsidian bg-gold"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">{text.actions.join}</span>
        </Link>
        <Link
          to={localizedPath("class_schedule", locale)}
          className="flex flex-col items-center gap-0.5 py-3 text-white/80 border-x border-white/10"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">{text.actions.schedule}</span>
        </Link>
        {HAS_WHATSAPP ? <a
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: "mobile_bar" })}
          className="flex flex-col items-center gap-0.5 py-3 text-white/80"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">{text.actions.whatsapp}</span>
        </a> : <Link to="/contact" className="flex flex-col items-center gap-0.5 py-3 text-white/80"><MessageCircle className="w-5 h-5" /><span className="text-[10px] font-heading tracking-[0.1em]">{text.actions.contact}</span></Link>}
      </div>
    </div>
  );
}
