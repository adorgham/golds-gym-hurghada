import { Link, useLocation } from "react-router-dom";
import { useSeo } from "@/lib/seo";

export default function PageNotFound() {
  const location = useLocation();
  useSeo({ title: "Page not found", description: "The requested Gold's Gym Hurghada page could not be found.", noindex: true });

  return (
    <main className="grid min-h-screen place-items-center bg-obsidian px-5 text-white">
      <div className="max-w-lg text-center">
        <p className="font-heading text-8xl text-gold">404</p>
        <h1 className="mt-3 font-heading text-4xl">PAGE NOT FOUND</h1>
        <p className="mt-4 text-white/55">The page <span className="text-white/75">{location.pathname}</span> is unavailable or may have moved.</p>
        <Link to="/" className="mt-8 inline-flex bg-gold px-7 py-3 font-heading text-obsidian">RETURN HOME</Link>
      </div>
    </main>
  );
}
