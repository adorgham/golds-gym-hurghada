import { useEffect } from "react";
import { ADDRESS, PHONE } from "@/lib/site";

const SITE_NAME = "Gold's Gym Hurghada";
// Owner-confirmed future production domain. Keep indexing disabled until cutover.
export const SITE_URL = String(import.meta.env.VITE_PUBLIC_SITE_URL || "https://www.goldsgymhurgahda.co").trim().replace(/\/+$/, "");
export const SITE_WIDE_NOINDEX = import.meta.env.VITE_PUBLIC_ALLOW_INDEXING !== "true";
const DEFAULT_OG_IMAGE = `${SITE_URL}/golds-gym-logo.webp`;

export function absoluteUrl(path = "/") {
  const normalized = String(path || "/");
  return `${SITE_URL}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (el) el.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export function useSeo({ title = "", description = "", canonical = "", image = "", jsonLd = null, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = canonical ? (canonical.startsWith("http") ? canonical : absoluteUrl(canonical)) : "";
    document.head.querySelectorAll('script[type="application/ld+json"][id^="ld-"]').forEach((el) => el.remove());
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image || DEFAULT_OG_IMAGE);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image || DEFAULT_OG_IMAGE);
    setLink("canonical", canonicalUrl);
    if (SITE_WIDE_NOINDEX || noindex) {
      setMeta("name", "robots", "noindex, nofollow, noarchive, nosnippet");
    } else {
      setMeta("name", "robots", "index, follow, max-image-preview:large");
    }
    if (jsonLd) {
      const id = Array.isArray(jsonLd) ? "ld-multi" : "ld-single";
      if (Array.isArray(jsonLd)) {
        jsonLd.forEach((d, i) => setJsonLd(`ld-${i}`, d));
      } else {
        setJsonLd(id, jsonLd);
      }
    }
  }, [title, description, canonical, image, JSON.stringify(jsonLd), noindex]);
}

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: "Gold's Gym Hurghada",
  description: "The Mecca of Fitness on the Red Sea. Memberships, day passes, group classes and elite personal training.",
  url: SITE_URL,
  ...(PHONE ? { telephone: PHONE } : {}),
  ...(ADDRESS ? { address: ADDRESS } : {}),
};

export const breadcrumbsLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});
