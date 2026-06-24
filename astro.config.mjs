// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.PUBLIC_GA_ID': JSON.stringify(
        process.env.PUBLIC_GA_ID || ''
      ),
    },
  }
});