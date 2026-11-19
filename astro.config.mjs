// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages with a custom domain: `site` is the full domain, and no `base` is needed.
export default defineConfig({
  site: 'https://devarshiojha.dev',
  vite: {
    plugins: [tailwindcss()],
  },
});
