import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.seniorsaudit.com',
  integrations: [
    react(),
    sitemap({
      // Exclude admin and draft pages from sitemap
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  output: 'static',
  build: {
    // Inline small assets for performance
    inlineStylesheets: 'auto',
  },
  image: {
    // Optimize images at build time
    remotePatterns: [{ protocol: 'https' }],
  },
});
