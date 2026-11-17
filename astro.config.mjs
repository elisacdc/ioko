import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/config/site.ts";
import { getSitemapLastmod } from "./src/lib/sitemap-lastmod.mjs";

// GitHub Actions fournit l’URL et le sous-chemin réels via configure-pages.
export default defineConfig({
  site: process.env.SITE_URL || SITE_URL,
  base: process.env.BASE_PATH || "/",
  output: "static",
  devToolbar: { enabled: false },
  trailingSlash: "always",
  integrations: [
    sitemap({
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const lastmod = getSitemapLastmod(pathname);
        if (lastmod) item.lastmod = lastmod;
        else delete item.lastmod;
        return item;
      },
    }),
  ],
});
