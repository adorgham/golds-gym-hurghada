import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve("dist");
const siteUrl = String(process.env.VITE_PUBLIC_SITE_URL || "https://www.goldsgymhurgahda.co").trim().replace(/\/+$/, "");
const allowIndexing = process.env.VITE_PUBLIC_ALLOW_INDEXING === "true";
const staticPaths = [
  "/",
  "/memberships",
  "/passes",
  "/trainers",
  "/classes/schedule",
  "/personal-training",
  "/facilities",
  "/about",
  "/contact",
  "/blog",
  "/fitness-guides",
  "/workouts",
  "/fitness-tips",
  "/privacy",
  "/terms",
];

await mkdir(outputDirectory, { recursive: true });

const robots = allowIndexing
  ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  : `User-agent: *\nDisallow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(resolve(outputDirectory, "robots.txt"), robots);
await writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap);

const indexPath = resolve(outputDirectory, "index.html");
const index = await readFile(indexPath, "utf8");
const robotsContent = allowIndexing ? "index, follow, max-image-preview:large" : "noindex, nofollow, noarchive, nosnippet";
await writeFile(indexPath, index.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${robotsContent}" />`));
