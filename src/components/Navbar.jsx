import { useState, useEffect } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { Menu, X, ChevronDown, MapPin } from "lucide-react";
import { track, EVENTS } from "@/lib/site";
import GoldsLogo from "@/components/GoldsLogo";

const NAV = [
  { label: "Memberships", to: "/memberships" },
  { label: "Passes", to: "/passes" },
  { label: "Classes", to: "/classes/schedule" },
  { label: "Trainers", to: "/trainers" },
  { label: "Personal Training", to: "/personal-training" },
  { label: "About", to: "/about" },
];

const FITNESS_LINKS = [
  { label: "Blog", to: "/blog" },
  { label: "Fitness Guides", to: "/fitness-guides" },
  { label: "Workouts", to: "/workouts" },
  { label: "Fitness Tips", to: "/fitness-tips" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fitOpen, setFitOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    setOpen(false);
    setFitOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Orange top strip */}
      <div className="bg-brand-orange text-white">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex items-center justify-between py-1.5">
          <span className="text-[10px] sm:text-[11px] font-heading tracking-[0.15em] uppercase">The Mecca of</span>
          <span className="text-[10px] sm:text-[11px] font-heading tracking-[0.15em] uppercase">Body Building™</span>
        </div>
      </div>

      {/* Main nav bar */}
      <div className={`bg-obsidian border-b border-white/10 transition-all ${scrolled ? "py-2" : "py-3"}`}>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex items-center justify-between">
          {/* Left: hamburger (mobile) / nav (desktop) */}
          <div className="flex items-center gap-1 flex-1">
            <button
              className="lg:hidden text-white p-1 -ml-1"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV.slice(0, 3).map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-[13px] font-heading tracking-[0.08em] uppercase transition-colors ${
                      isActive ? "text-gold" : "text-white/80 hover:text-gold"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="relative" onMouseEnter={() => setFitOpen(true)} onMouseLeave={() => setFitOpen(false)}>
                <button className="px-3 py-2 text-[13px] font-heading tracking-[0.08em] uppercase text-white/80 hover:text-gold flex items-center gap-1">
                  Fitness <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {fitOpen && (
                  <div className="absolute top-full left-0 pt-1">
                    <div className="w-56 bg-obsidian border border-white/10 shadow-box py-2 animate-fade">
                      {FITNESS_LINKS.map((f) => (
                        <Link
                          key={f.to}
                          to={f.to}
                          className="block px-4 py-2.5 text-sm text-white/75 hover:text-gold hover:bg-white/5 transition-colors"
                        >
                          {f.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex items-center justify-center" aria-label="Gold's Gym Hurghada home">
            <GoldsLogo variant="full" size={36} />
          </Link>

          {/* Right: nav + find a club */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV.slice(3).map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-[13px] font-heading tracking-[0.08em] uppercase transition-colors ${
                      isActive ? "text-gold" : "text-white/80 hover:text-gold"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <Link
              to="/contact"
              onClick={() => track(EVENTS.membershipSelect, { location: "navbar_find" })}
              className="hidden sm:inline-flex items-center gap-1.5 text-gold font-heading text-[12px] tracking-[0.1em] uppercase px-3 py-2 hover:brightness-125 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              FIND A CLUB
            </Link>
            <Link
              to="/memberships"
              onClick={() => track(EVENTS.membershipSelect, { location: "navbar" })}
              className="hidden sm:inline-flex items-center bg-gold text-obsidian font-heading text-[13px] tracking-[0.08em] px-5 py-2.5 hover:brightness-110 transition-all clip-tag"
            >
              JOIN NOW
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-xl animate-fade" onClick={() => setOpen(false)} />
          <div className="relative h-full flex flex-col pt-6 px-6">
            <div className="flex items-center justify-between mb-10">
              <GoldsLogo variant="full" size={36} />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white">
                <X className="w-7 h-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n, i) => (
                <Link
                  key={n.to}
                  to={n.to}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-rise font-heading text-3xl tracking-[0.04em] uppercase text-white py-2 border-b border-white/5 hover:text-gold transition-colors"
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-4 mb-2 text-xs tracking-[0.3em] text-gold font-semibold">FITNESS</div>
              {FITNESS_LINKS.map((f) => (
                <Link key={f.to} to={f.to} className="text-lg text-white/70 py-1.5 hover:text-gold font-heading tracking-[0.04em] uppercase">
                  {f.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/memberships"
              className="mt-auto mb-8 text-center bg-gold text-obsidian font-heading text-lg tracking-[0.08em] py-4 clip-tag"
            >
              JOIN NOW
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
