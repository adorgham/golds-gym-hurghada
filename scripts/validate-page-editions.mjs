import assert from "node:assert/strict";
import {
  PAGE_BLOCK_TYPES,
  PAGE_EDITION_STATUSES,
  editionBlocksToMarkdown,
  editionIdentity,
  editionKey,
  editionSlug,
  canPublishEdition,
  isLanguageEdition,
  normalizeEditionBlocks,
} from "../src/lib/pageEditions.js";

assert.deepEqual(PAGE_EDITION_STATUSES, ["draft", "review", "approved", "published"]);
assert.equal(PAGE_BLOCK_TYPES.length, 7);
assert.equal(editionKey("memberships", "ar"), "memberships:ar");
assert.equal(editionSlug("home"), "home");
assert.equal(editionSlug("personal_training"), "personal-training");
assert.deepEqual(editionIdentity("class_schedule", "ru"), {
  page_key: "class_schedule",
  locale: "ru",
  edition_key: "class_schedule:ru",
  path: "/ru/classes/schedule",
  slug: "classes/schedule",
  direction: "ltr",
});
assert.equal(isLanguageEdition({ page_key: "home", locale: "de" }), true);
assert.equal(isLanguageEdition({ slug: "privacy" }), false);
assert.equal(canPublishEdition("draft"), false);
assert.equal(canPublishEdition("review"), false);
assert.equal(canPublishEdition("approved"), true);
assert.equal(canPublishEdition("published"), true);

const blocks = normalizeEditionBlocks([
  { block_key: "intro", type: "rich_text", heading: "Train", body: "Move better." },
  { block_key: "prices", type: "offer_grid", heading: "Choose access", body: "" },
  { block_key: "invalid", type: "unknown", body: "Drop me" },
]);
assert.equal(blocks.length, 2);
assert.equal(blocks[1].type, "offer_grid");
assert.equal(
  editionBlocksToMarkdown(blocks),
  "## Train\n\nMove better.\n\n## Choose access",
);

assert.throws(() => editionIdentity("missing", "en"), /Unknown page identity/);
assert.throws(() => editionIdentity("home", "fr"), /Unsupported locale/);

console.log("Page edition validation passed.");
