import { useEffect } from "react";

const SITE_NAME = "Gold's Gym Hurghada";
const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1534438327276-1ff8e2a4f5a3?auto=format&fit=crop&w=1200&q=80";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
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

export function useSeo({ title, description, canonical, image, jsonLd, noindex }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image || DEFAULT_OG_IMAGE);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setLink("canonical", canonical);
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      const r = document.head.querySelector('meta[name="robots"]');
      if (r) r.remove();
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
  url: "https://goldsgymhurghada.com",
  telephone: "+20-65-000-0000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hurghada Marina, Red Sea",
    addressLocality: "Hurghada",
    addressCountry: "EG",
  },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    opens: "06:00", closes: "23:59",
  }],
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