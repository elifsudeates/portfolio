// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://cagatayuresin.com",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // VS Code temaları — açık/koyu için ikisini de tanımlıyoruz
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: false,
    },
  },
});
