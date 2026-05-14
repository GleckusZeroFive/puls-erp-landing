// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gleckuszerofive.github.io',
  base: '/puls-erp-landing',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()]
  }
});
