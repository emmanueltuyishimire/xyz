import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Removes authoring comments from the generated HTML so internal build notes are not shipped to visitors.
// Keeps IE conditional comments and anything outside <body>/<head> markup untouched.
function stripHtmlComments() {
  const walk = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith('.html')) {
        const html = await fs.readFile(p, 'utf8');
        // Keep React/Astro hydration markers (<!-- -->, <!--$-->, <!--/$-->, <!--astro:...-->): removing them
        // makes React report hydration mismatch errors (#418/#423/#425) and re-render the tool on the client.
        const out = html.replace(/<!--(?!\[if|<!)([\s\S]*?)-->/g, (m, inner) =>
          inner.trim().length <= 3 || /^\s*astro:/.test(inner) ? m : '');
        if (out !== html) await fs.writeFile(p, out);
      }
    }
  };
  return {
    name: 'strip-html-comments',
    hooks: { 'astro:build:done': async ({ dir }) => { await walk(fileURLToPath(dir)); } },
  };
}

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
    stripHtmlComments(),
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
