const ATTRIBUTION_KEY = "ggh_first_touch_attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function readStoredAttribution() {
  try {
    return JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || "null") || {};
  } catch {
    return {};
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const stored = readStoredAttribution();
  const campaign = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)]).filter(([, value]) => value)
  );
  const attribution = {
    ...campaign,
    ...stored,
    landing_page: stored.landing_page || `${window.location.pathname}${window.location.search}`,
    referrer: stored.referrer || document.referrer || "",
  };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution must never block a public journey.
  }

  return attribution;
}

export function getAttribution() {
  return captureAttribution();
}
