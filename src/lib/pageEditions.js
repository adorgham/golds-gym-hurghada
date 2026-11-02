import {
  DEFAULT_LOCALE,
  LOCALES,
  PAGE_IDENTITIES,
  isSupportedLocale,
  localizedPath,
} from "./localization.js";

export const PAGE_EDITION_STATUSES = Object.freeze(["draft", "review", "approved", "published"]);

export const PAGE_BLOCK_TYPES = Object.freeze([
  Object.freeze({ value: "rich_text", label: "Editorial section" }),
  Object.freeze({ value: "faq", label: "FAQ item" }),
  Object.freeze({ value: "cta", label: "Call to action" }),
  Object.freeze({ value: "offer_grid", label: "Canonical membership/pass offers" }),
  Object.freeze({ value: "trainer_grid", label: "Canonical trainer profiles" }),
  Object.freeze({ value: "schedule", label: "Canonical class schedule" }),
  Object.freeze({ value: "lead_form", label: "Enquiry form" }),
]);

export const PAGE_IDENTITY_OPTIONS = Object.freeze([
  Object.freeze({ value: "home", label: "Home" }),
  Object.freeze({ value: "memberships", label: "Memberships" }),
  Object.freeze({ value: "passes", label: "Passes" }),
  Object.freeze({ value: "personal_training", label: "Personal training" }),
  Object.freeze({ value: "class_schedule", label: "Classes / schedule" }),
]);

export function editionKey(pageKey, locale = DEFAULT_LOCALE) {
  if (!PAGE_IDENTITIES[pageKey]) throw new Error(`Unknown page identity: ${pageKey}`);
  if (!isSupportedLocale(locale)) throw new Error(`Unsupported locale: ${locale}`);
  return `${pageKey}:${locale}`;
}

export function editionSlug(pageKey) {
  const path = localizedPath(pageKey, DEFAULT_LOCALE);
  return path === "/" ? "home" : path.slice(1);
}

export function editionIdentity(pageKey, locale = DEFAULT_LOCALE) {
  return Object.freeze({
    page_key: pageKey,
    locale,
    edition_key: editionKey(pageKey, locale),
    path: localizedPath(pageKey, locale),
    slug: editionSlug(pageKey),
    direction: LOCALES[locale].direction,
  });
}

export function isLanguageEdition(record) {
  return Boolean(record && PAGE_IDENTITIES[record.page_key] && isSupportedLocale(record.locale));
}

export function canPublishEdition(previousStatus) {
  return previousStatus === "approved" || previousStatus === "published";
}

export function normalizeEditionBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const allowedTypes = new Set(PAGE_BLOCK_TYPES.map((type) => type.value));

  return blocks
    .filter((block) => block && allowedTypes.has(block.type))
    .map((block, index) => ({
      block_key: String(block.block_key || `block-${index + 1}`),
      type: block.type,
      heading: String(block.heading || "").trim(),
      body: String(block.body || "").trim(),
      cta_label: String(block.cta_label || "").trim(),
      cta_url: String(block.cta_url || "").trim(),
    }));
}

export function editionBlocksToMarkdown(blocks) {
  return normalizeEditionBlocks(blocks)
    .map((block) => {
      const headingPrefix = block.type === "faq" ? "###" : "##";
      const parts = [block.heading ? `${headingPrefix} ${block.heading}` : "", block.body];
      if (block.cta_label && block.cta_url) parts.push(`[${block.cta_label}](${block.cta_url})`);
      return parts.filter(Boolean).join("\n\n");
    })
    .filter(Boolean)
    .join("\n\n");
}
