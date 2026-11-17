import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const lastModifiedByPath = new Map();

function frontmatterValue(frontmatter, field) {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = frontmatter.match(
    new RegExp(`^${escapedField}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\s#]+))\\s*$`, "m"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function normalizedDate(value) {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const french = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const parts = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : french
      ? [Number(french[3]), Number(french[2]), Number(french[1])]
      : undefined;
  if (!parts) return undefined;

  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function readCollection(collection, routePrefix, dateFields) {
  const directory = join(projectRoot, "src", "content", collection);
  for (const filename of readdirSync(directory).filter((name) => name.endsWith(".md"))) {
    const markdown = readFileSync(join(directory, filename), "utf8");
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
    if (!frontmatter) continue;

    const slug = frontmatterValue(frontmatter, "slug");
    if (!slug) continue;

    let lastmod;
    for (const field of dateFields) {
      lastmod = normalizedDate(frontmatterValue(frontmatter, field));
      if (lastmod) break;
    }

    if (lastmod) lastModifiedByPath.set(`${routePrefix}/${slug}/`, lastmod);
  }
}

readCollection("articles", "/ressources", ["updatedDate", "date"]);
readCollection("formations", "/formations", ["programUpdated"]);

const configuredBase = (process.env.BASE_PATH || "/").replace(/\/$/, "");

export function getSitemapLastmod(pathname) {
  const normalizedPath = configuredBase && pathname.startsWith(`${configuredBase}/`)
    ? pathname.slice(configuredBase.length)
    : pathname;
  return lastModifiedByPath.get(normalizedPath);
}
