// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://cagatayuresin.com",
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
