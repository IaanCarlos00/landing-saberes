// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.saberes.cl',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  vite: {
    plugins: [tailwindcss()],
  }
});