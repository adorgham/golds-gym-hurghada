import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import { LOCALES, localeFromPath } from "@/lib/localization";

export default function Layout() {
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const direction = LOCALES[locale].direction;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col" lang={locale} dir={direction}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
}
