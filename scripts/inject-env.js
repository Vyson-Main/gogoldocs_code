// ── Vercel Build Script ───────────────────────────────────────────────────────
// Replaces the __VITE_API_URL__ placeholder in index.html with the
// actual Render backend URL from the VITE_API_URL environment variable.
// Vercel runs this automatically via the "vercel-build" npm script.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const apiUrl = process.env.VITE_API_URL;

if (!apiUrl) {
  console.error('❌ VITE_API_URL environment variable is not set in Vercel.');
  console.error('   Go to Vercel → Project → Settings → Environment Variables');
  console.error('   and add: VITE_API_URL = https://your-app.onrender.com/api');
  process.exit(1);
}

const htmlPath = resolve('client/index.html');
const html     = readFileSync(htmlPath, 'utf8');
const updated  = html.replace('__VITE_API_URL__', apiUrl);

writeFileSync(htmlPath, updated);
console.log(`✅ Injected API URL: ${apiUrl}`);
