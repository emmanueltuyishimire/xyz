import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://www.seniorsaudit.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  adapter: netlify({
    imageCDN: false,
  }),

  integrations: [
    react(),
  ],
  build: {
    format: 'directory',
    // Inline small assets for performance
    inlineStylesheets: 'always',
  },
  image: {
    // Optimize images at build time
    remotePatterns: [{ protocol: 'https' }],
  },
});
