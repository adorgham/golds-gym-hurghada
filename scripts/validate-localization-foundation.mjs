import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  LOCALES,
  PAGE_IDENTITIES,
  SUPPORTED_LOCALES,
  isRtlLocale,
  localeFromPath,
  localizeInternalHref,
  localizedAlternates,
  localizedPath,
  resolveLocalizedPage,
} from "../src/lib/localization.js";
import { uiText } from "../src/lib/uiTranslations.js";

assert.equal(DEFAULT_LOCALE, "en");
assert.deepEqual(SUPPORTED_LOCALES, ["en", "ar", "de", "ru"]);
assert.equal(LOCALES.ar.direction, "rtl");
assert.equal(isRtlLocale("ar"), true);
assert.equal(isRtlLocale("de"), false);
assert.equal(localeFromPath("/ar/memberships"), "ar");
assert.equal(localeFromPath("/memberships"), "en");
assert.equal(localeFromPath("/fr/memberships"), "en");

assert.deepEqual(Object.keys(PAGE_IDENTITIES), [
  "home",
  "memberships",
  "passes",
  "personal_training",
  "class_schedule",
]);

assert.equal(localizedPath("home", "en"), "/");
assert.equal(localizedPath("home", "ar"), "/ar");
assert.equal(localizedPath("memberships", "en"), "/memberships");
assert.equal(localizedPath("memberships", "de"), "/de/memberships");
assert.equal(localizedPath("class_schedule", "ru"), "/ru/classes/schedule");

const launchPaths = Object.keys(PAGE_IDENTITIES).flatMap((pageKey) =>
  SUPPORTED_LOCALES.map((locale) => localizedPath(pageKey, locale)),
);
assert.equal(launchPaths.length, 20);
assert.equal(new Set(launchPaths).size, 20, "Launch language-edition paths must be unique");

assert.deepEqual(localizedAlternates("passes"), {
  en: "/passes",
  ar: "/ar/passes",
  de: "/de/passes",
  ru: "/ru/passes",
});

assert.deepEqual(resolveLocalizedPage("/ar/personal-training/"), {
  pageKey: "personal_training",
  locale: "ar",
  pathname: "/ar/personal-training",
});
assert.deepEqual(resolveLocalizedPage("/de/classes/schedule?week=2026-10-26"), {
  pageKey: "class_schedule",
  locale: "de",
  pathname: "/de/classes/schedule",
});
assert.equal(resolveLocalizedPage("/de/not-a-page"), null);
assert.equal(resolveLocalizedPage("/fr/memberships"), null);
assert.equal(localizeInternalHref("/memberships", "de"), "/de/memberships");
assert.equal(localizeInternalHref("/contact", "ar"), "/contact");
assert.equal(localizeInternalHref("https://example.com", "ru"), "https://example.com");

assert.throws(() => localizedPath("missing", "en"), /Unknown page identity/);
assert.throws(() => localizedPath("home", "fr"), /Unsupported locale/);

for (const locale of SUPPORTED_LOCALES) {
  const text = uiText(locale);
  assert.ok(text.nav.memberships, `${locale} membership navigation label is missing`);
  assert.ok(text.actions.join, `${locale} join action is missing`);
  assert.ok(text.form.error, `${locale} form error is missing`);
  assert.ok(text.states.notFoundTitle, `${locale} not-found title is missing`);
}

console.log("Localization foundation validation passed.");
