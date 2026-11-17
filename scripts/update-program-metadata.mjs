import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";

const directory = new URL("../src/content/formations/", import.meta.url);
const ignoredForProgramHash = new Set([
  "programUpdated",
  "programVersion",
  "programHash",
  "category",
  "illustration",
  "illustrationAlt",
  "illustrationWidth",
  "illustrationHeight",
  "seoTitle",
  "metaDescription",
  "relatedArticles",
  "order",
  "sourcePages",
]);

const today = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}).format(new Date());

function bumpMinorVersion(version) {
  const match = version.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return "1.0";
  return `${match[1]}.${Number(match[2] ?? 0) + 1}`;
}

function digestProgram(markdown) {
  const [, frontmatter = "", body = ""] = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/) ?? [];
  if (!frontmatter) throw new Error("Frontmatter Astro absent ou invalide.");

  const programFields = frontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const field = line.match(/^([A-Za-z][\w-]*):/);
      return !field || !ignoredForProgramHash.has(field[1]);
    })
    .join("\n");

  return createHash("sha256").update(`${programFields}\n---\n${body}`).digest("hex");
}

function readField(frontmatter, name) {
  return frontmatter.match(new RegExp(`^${name}:\\s*["']?([^"'\\r\\n]*)`, "m"))?.[1]?.trim() ?? "";
}

function setField(frontmatter, name, value) {
  const line = `${name}: "${value}"`;
  const pattern = new RegExp(`^${name}:.*$`, "m");
  if (pattern.test(frontmatter)) return frontmatter.replace(pattern, line);
  const versionPattern = /^programVersion:.*$/m;
  if (name === "programHash" && versionPattern.test(frontmatter)) {
    return frontmatter.replace(versionPattern, (match) => `${match}\n${line}`);
  }
  return `${frontmatter}\n${line}`;
}

const files = (await readdir(directory)).filter((name) => name.endsWith(".md")).sort();
let changedCount = 0;

for (const file of files) {
  const path = new URL(file, directory);
  const markdown = await readFile(path, "utf8");
  const match = markdown.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)([\s\S]*)$/);
  if (!match) throw new Error(`Frontmatter Astro absent ou invalide dans ${file}`);

  let [, opening, frontmatter, closing, body] = match;
  const currentHash = digestProgram(markdown);
  const previousHash = readField(frontmatter, "programHash");
  let updated = readField(frontmatter, "programUpdated");
  let version = readField(frontmatter, "programVersion");

  if (!previousHash) {
    if (!updated || /compl[eé]ter/i.test(updated)) updated = today;
    if (!version || /compl[eé]ter/i.test(version)) version = "1.0";
    frontmatter = setField(frontmatter, "programUpdated", updated);
    frontmatter = setField(frontmatter, "programVersion", version);
    frontmatter = setField(frontmatter, "programHash", currentHash);
  } else if (previousHash !== currentHash) {
    updated = today;
    version = bumpMinorVersion(version);
    frontmatter = setField(frontmatter, "programUpdated", updated);
    frontmatter = setField(frontmatter, "programVersion", version);
    frontmatter = setField(frontmatter, "programHash", currentHash);
  }

  const nextMarkdown = `${opening}${frontmatter}${closing}${body}`;
  if (nextMarkdown !== markdown) {
    await writeFile(path, nextMarkdown, "utf8");
    changedCount += 1;
  }
}

if (changedCount) console.log(`Métadonnées de programme initialisées ou actualisées : ${changedCount}/${files.length} fiche(s).`);
