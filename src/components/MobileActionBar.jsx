import { Link } from "react-router-dom";
import { Calendar, MessageCircle, Zap } from "lucide-react";
import { whatsappUrl, track, EVENTS } from "@/lib/site";

export default function MobileActionBar() {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-gold/30">
      <div className="grid grid-cols-3">
        <Link
          to="/memberships"
          onClick={() => track(EVENTS.membershipSelect, { location: "mobile_bar" })}
          className="flex flex-col items-center gap-0.5 py-3 text-obsidian bg-gold"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">JOIN</span>
        </Link>
        <Link
          to="/classes/schedule"
          className="flex flex-col items-center gap-0.5 py-3 text-white/80 border-x border-white/10"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">SCHEDULE</span>
        </Link>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(EVENTS.whatsappClick, { location: "mobile_bar" })}
          className="flex flex-col items-center gap-0.5 py-3 text-white/80"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-heading tracking-[0.1em]">WHATSAPP</span>
        </a>
      </div>
    </div>
  );
}