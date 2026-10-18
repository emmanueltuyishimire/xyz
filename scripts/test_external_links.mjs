import fs from 'fs';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const f1 = fs.readFileSync('src/content/social-security/social-security-cola-2027.md', 'utf8');
const f2 = fs.readFileSync('src/pages/tools/social-security-cola-calculator.astro', 'utf8');

const urlRegex = /https?:\/\/[^\s"'<>)]+/g;
const urls1 = [...new Set(f1.match(urlRegex) || [])];
const urls2 = [...new Set(f2.match(urlRegex) || [])];

console.log('URLs in social-security-cola-2027.md:');
console.log(urls1);

console.log('\nURLs in social-security-cola-calculator.astro:');
console.log(urls2);

async function checkUrl(targetUrl) {
  return new Promise((resolve) => {
    try {
      const u = new URL(targetUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(u, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        timeout: 8000
      }, (res) => {
        resolve({ url: targetUrl, status: res.statusCode, location: res.headers.location });
      });

      req.on('error', (err) => {
        // Try GET if HEAD failed
        const req2 = client.request(u, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*'
          },
          timeout: 8000
        }, (res2) => {
          res2.destroy();
          resolve({ url: targetUrl, status: res2.statusCode, location: res2.headers.location });
        });
        req2.on('error', (e) => resolve({ url: targetUrl, error: e.message }));
        req2.on('timeout', () => { req2.destroy(); resolve({ url: targetUrl, error: 'TIMEOUT' }); });
        req2.end();
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ url: targetUrl, error: 'TIMEOUT' });
      });

      req.end();
    } catch (e) {
      resolve({ url: targetUrl, error: e.message });
    }
  });
}

const allUrls = [...new Set([...urls1, ...urls2])];
console.log(`\nTesting ${allUrls.length} unique external URLs...\n`);

for (const u of allUrls) {
  const res = await checkUrl(u);
  console.log(`${res.status || 'ERR'} | ${u} ${res.error ? `(${res.error})` : ''} ${res.location ? `-> ${res.location}` : ''}`);
}
