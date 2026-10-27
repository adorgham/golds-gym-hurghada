import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = String(process.env.VITE_PUBLIC_SITE_URL || "https://www.goldsgymhurgahda.co").trim().replace(/\/+$/, "");
const expectIndexing = process.env.VITE_PUBLIC_ALLOW_INDEXING === "true";
const requiredPaths = ["/", "/memberships", "/passes", "/trainers", "/classes/schedule", "/personal-training", "/facilities", "/about", "/contact", "/privacy", "/terms"];

const [index, robots, sitemap, manifest, seoSource] = await Promise.all([
  readFile(resolve("dist/index.html"), "utf8"),
  readFile(resolve("dist/robots.txt"), "utf8"),
  readFile(resolve("dist/sitemap.xml"), "utf8"),
  readFile(resolve("dist/manifest.json"), "utf8"),
  readFile(resolve("src/lib/seo.jsx"), "utf8"),
]);

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

expect(index.includes(expectIndexing ? "index, follow, max-image-preview:large" : "noindex, nofollow, noarchive, nosnippet"), "index.html robots directive does not match the release gate");
expect(robots.includes(expectIndexing ? "Allow: /" : "Disallow: /"), "robots.txt does not match the release gate");
expect(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), "robots.txt is missing the canonical sitemap URL");
expect(sitemap.includes(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`), "sitemap.xml is not a valid sitemap document");
requiredPaths.forEach((path) => expect(sitemap.includes(`<loc>${siteUrl}${path}</loc>`), `sitemap.xml is missing ${path}`));
expect(JSON.parse(manifest).start_url === "/", "manifest.json is invalid or missing start_url");
expect(!seoSource.includes("goldsgymhurghada.com"), "legacy .com domain remains in the SEO helper");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`SEO asset validation passed (${expectIndexing ? "indexing enabled" : "indexing blocked"}).`);
