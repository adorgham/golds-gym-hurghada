import { Link, useLocation } from "react-router-dom";
import { useSeo } from "@/lib/seo";
import { localeFromPath, localizedPath } from "@/lib/localization";
import { uiText } from "@/lib/uiTranslations";

export default function PageNotFound() {
  const location = useLocation();
  const locale = localeFromPath(location.pathname);
  const text = uiText(locale);
  useSeo({ title: text.states.notFoundTitle, description: text.states.notFoundBody, noindex: true });

  return (
    <main className="grid min-h-screen place-items-center bg-obsidian px-5 text-white">
      <div className="max-w-lg text-center">
        <p className="font-heading text-8xl text-gold">404</p>
        <h1 className="mt-3 font-heading text-4xl">{text.states.notFoundTitle}</h1>
        <p className="mt-4 text-white/55">{text.states.notFoundBody}</p>
        <Link to={localizedPath("home", locale)} className="mt-8 inline-flex bg-gold px-7 py-3 font-heading text-obsidian">{text.actions.returnHome}</Link>
      </div>
    </main>
  );
}
