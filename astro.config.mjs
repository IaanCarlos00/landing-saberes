// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  vite: {
    plugins: [tailwindcss()],
  }
});