import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { getSitemapLastmod } from "../src/lib/sitemap-lastmod.mjs";

const root = path.resolve("dist");
const base = (process.env.BASE_PATH || "").replace(/\/$/, "");
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
}
const files = (await walk(root)).filter((f) => f.endsWith(".html"));
assert(
  files.length >= 17,
  "Les routes principales et les fiches doivent être générées.",
);
let linkCount = 0;
const pageTitles = new Set();
const canonicalUrls = new Set();
const sitemapUrls = new Set();
const sitemapLastmods = new Map();
let articleSchemaCount = 0;
for (const file of files) {
  const html = await readFile(file, "utf8");
  assert(
    !/a-renseigner@example\.com/i.test(
      html,
    ),
    `${file}: contenu personnel ou coordonnées provisoires à retirer`,
  );
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) || []).length,
    1,
    `${file}: un seul H1 attendu`,
  );
  assert.match(html, /<html lang="fr"/, `${file}: langue française absente`);
  assert.match(
    html,
    /<meta name="description" content="[^"]+"/,
    `${file}: description absente`,
  );
  assert.match(html, /<title>[^<]+<\/title>/, `${file}: titre absent`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(!pageTitles.has(title), `${file}: titre SEO déjà utilisé (${title})`);
  pageTitles.add(title);
  assert.match(html, /<meta property="og:title" content="[^"]+"/, `${file}: og:title absent`);
  assert.match(html, /<meta property="og:description" content="[^"]+"/, `${file}: og:description absent`);
  assert.match(html, /<meta property="og:image" content="https:\/\//, `${file}: og:image absolue absente`);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, `${file}: carte Twitter/X absente`);
  const is404 = file.endsWith(`${path.sep}404.html`);
  if (is404) {
    assert.match(html, /<meta name="robots" content="noindex, follow"/, `${file}: la 404 doit rester noindex`);
    assert(!html.includes('rel="canonical"'), `${file}: la 404 ne doit pas annoncer de canonical vers une route inexistante`);
  } else {
    assert(!/name="robots" content="noindex/i.test(html), `${file}: noindex inattendu`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert(canonical?.startsWith("https://www.afrap.fr/"), `${file}: canonical AFRAP absent ou incorrect`);
    assert(!canonicalUrls.has(canonical), `${file}: canonical dupliqué (${canonical})`);
    canonicalUrls.add(canonical);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\bwidth="\d+"/, `${file}: image sans largeur déclarée`);
    assert.match(image[0], /\bheight="\d+"/, `${file}: image sans hauteur déclarée`);
  }
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch {
      throw new Error(`${file}: JSON-LD invalide`);
    }
  });
  const schemaTypes = schemas.map((schema) => schema["@type"]);
  assert(schemaTypes.includes("Organization"), `${file}: schema Organization absent`);
  assert(schemaTypes.includes("WebSite"), `${file}: schema WebSite absent`);
  const isResourceDetail = file.includes(`${path.sep}ressources${path.sep}`) && !file.endsWith(path.join("ressources", "index.html"));
  const isTrainingDetail = file.includes(`${path.sep}formations${path.sep}`) && !file.endsWith(path.join("formations", "index.html"));
  if (isResourceDetail) {
    assert(schemaTypes.includes("Article"), `${file}: schema Article absent`);
    articleSchemaCount++;
  }
  if (isTrainingDetail) {
    assert(schemaTypes.includes("BreadcrumbList"), `${file}: fil d’Ariane structuré absent`);
  }
  for (const anchor of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(anchor[0], /rel="[^"]*noopener[^"]*noreferrer|[^"]*noreferrer[^"]*noopener[^"]*"/, `${file}: lien externe sans noopener noreferrer`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (href.startsWith("mailto:")) {
      const parsed = new URL(href);
      assert.equal(
        parsed.pathname,
        "contact@afrap.fr",
        `${file}: les emails doivent être adressés à contact@afrap.fr`,
      );
      const subject = parsed.searchParams.get("subject") || "";
      const body = parsed.searchParams.get("body") || "";
      if (subject === "Demande de devis") {
        assert.match(
          body,
          /Bonjour,\n\nJe vous écris pour une demande de devis\./,
          `${file}: le message de demande de devis de base est absent`,
        );
      } else if (subject.startsWith("Demande de devis formation ")) {
        assert.match(
          body,
          /Bonjour,\n\nJe vous contacte concernant la formation .+ Serait-il possible d’échanger sur les besoins de ma structure afin d’établir un devis \?/,
          `${file}: le message de demande de devis formation est absent`,
        );
      }
      continue;
    }
    if (/^(?:https?:|tel:|data:)/.test(href)) continue;
    if (href.startsWith("#")) {
      assert(
        html.includes(`id="${href.slice(1)}"`),
        `${file}: ancre absente ${href}`,
      );
      continue;
    }
    if (!href.startsWith("/")) continue;
    assert(
      !base || href.startsWith(`${base}/`),
      `${file}: sous-chemin GitHub Pages absent dans ${href}`,
    );
    const relative = decodeURIComponent(href.slice(base.length)).split(
      /[?#]/,
    )[0];
    let target = path.join(root, relative);
    if (relative.endsWith("/")) target = path.join(target, "index.html");
    await access(target).catch(() => {
      throw new Error(`${file}: lien ou asset absent ${href}`);
    });
    linkCount++;
  }
}
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
assert.match(robots, /User-agent:\s*\*/i, "robots.txt absent ou invalide");
assert.match(robots, /Sitemap:\s*https:\/\/www\.afrap\.fr\/sitemap-index\.xml/i, "référence au sitemap absente de robots.txt");
await access(path.join(root, "sitemap-index.xml"));
const sitemapFiles = (await readdir(root)).filter((name) => /^sitemap-\d+\.xml$/.test(name));
for (const sitemapFile of sitemapFiles) {
  const xml = await readFile(path.join(root, sitemapFile), "utf8");
  for (const [, urlEntry] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = urlEntry.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    sitemapUrls.add(loc);
    const lastmod = urlEntry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    const expectedLastmod = getSitemapLastmod(new URL(loc).pathname);
    if (expectedLastmod) {
      assert(
        lastmod &&
          Date.parse(lastmod) === Date.parse(`${expectedLastmod}T00:00:00.000Z`),
        `${sitemapFile}: lastmod absent ou incorrect pour ${loc}`,
      );
    } else {
      assert.equal(lastmod, undefined, `${sitemapFile}: lastmod non fiable pour ${loc}`);
    }
    if (lastmod) sitemapLastmods.set(loc, lastmod);
  }
}
assert.equal(articleSchemaCount, 6, "Chaque article publié doit avoir un schéma Article.");
assert.equal(sitemapUrls.size, canonicalUrls.size, "Le sitemap doit correspondre aux routes indexables.");
for (const canonical of canonicalUrls) assert(sitemapUrls.has(canonical), `Canonical absent du sitemap : ${canonical}`);
assert(![...sitemapUrls].some((loc) => /\/404(?:\.html|\/)$/i.test(loc)), "La page 404 ne doit pas figurer dans le sitemap.");
const expectedLastmodCount = [...canonicalUrls].filter((canonical) =>
  getSitemapLastmod(new URL(canonical).pathname),
).length;
assert.equal(
  sitemapLastmods.size,
  expectedLastmodCount,
  "Le sitemap ne doit dater que les articles et formations ayant une date source fiable.",
);
console.log(
  `${files.length} pages contrôlées : titres/meta/canoniques/JSON-LD, images, robots, sitemap, ancres, emails de devis et ${linkCount} liens/assets internes valides (base : ${base || "/"}).`,
);
