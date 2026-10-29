export const DEFAULT_LOCALE = "en";

export const LOCALES = Object.freeze({
  en: Object.freeze({ code: "en", label: "English", direction: "ltr", prefix: "" }),
  ar: Object.freeze({ code: "ar", label: "العربية", direction: "rtl", prefix: "/ar" }),
  de: Object.freeze({ code: "de", label: "Deutsch", direction: "ltr", prefix: "/de" }),
  ru: Object.freeze({ code: "ru", label: "Русский", direction: "ltr", prefix: "/ru" }),
});

export const SUPPORTED_LOCALES = Object.freeze(Object.keys(LOCALES));

export const PAGE_IDENTITIES = Object.freeze({
  home: Object.freeze({ key: "home", basePath: "/" }),
  memberships: Object.freeze({ key: "memberships", basePath: "/memberships" }),
  passes: Object.freeze({ key: "passes", basePath: "/passes" }),
  personal_training: Object.freeze({ key: "personal_training", basePath: "/personal-training" }),
  class_schedule: Object.freeze({ key: "class_schedule", basePath: "/classes/schedule" }),
});

function normalizePathname(pathname = "/") {
  const withoutQueryOrHash = String(pathname || "/").split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = withoutQueryOrHash.startsWith("/") ? withoutQueryOrHash : `/${withoutQueryOrHash}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(String(locale || "").toLowerCase());
}

export function isRtlLocale(locale) {
  return LOCALES[locale]?.direction === "rtl";
}

export function localeFromPath(pathname) {
  const normalizedPath = normalizePathname(pathname);
  const candidate = normalizedPath.split("/").filter(Boolean)[0];
  return isSupportedLocale(candidate) && candidate !== DEFAULT_LOCALE ? candidate : DEFAULT_LOCALE;
}

export function localizedPath(pageKey, locale = DEFAULT_LOCALE) {
  const page = PAGE_IDENTITIES[pageKey];
  if (!page) throw new Error(`Unknown page identity: ${pageKey}`);
  if (!isSupportedLocale(locale)) throw new Error(`Unsupported locale: ${locale}`);

  const prefix = LOCALES[locale].prefix;
  if (page.basePath === "/") return prefix || "/";
  return `${prefix}${page.basePath}`;
}

export function localizedAlternates(pageKey) {
  return Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, localizedPath(pageKey, locale)]));
}

export function resolveLocalizedPage(pathname) {
  const normalizedPath = normalizePathname(pathname);

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of Object.values(PAGE_IDENTITIES)) {
      if (localizedPath(page.key, locale) === normalizedPath) {
        return Object.freeze({ pageKey: page.key, locale, pathname: normalizedPath });
      }
    }
  }

  return null;
}

export function localizeInternalHref(href, locale = DEFAULT_LOCALE) {
  const value = String(href || "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  const resolved = resolveLocalizedPage(value);
  return resolved ? localizedPath(resolved.pageKey, locale) : value;
}
