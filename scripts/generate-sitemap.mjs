import { writeFile } from 'node:fs/promises';

const origin = 'https://epaper.jawanbharat.com';
const entries = new Map([[`${origin}/`, new Date().toISOString().slice(0, 10)]]);
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    const endpoint = new URL('/rest/v1/newspaper?select=date_of_paper&order=date_of_paper.desc&limit=5000', supabaseUrl);
    const response = await fetch(endpoint, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
    if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}`);
    const editions = await response.json();
    for (const { date_of_paper: date } of editions) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) entries.set(`${origin}/edition/${date}`, date);
    }
  } catch (error) {
    console.warn(`Could not add edition URLs to sitemap: ${error.message}`);
  }
} else {
  console.warn('Supabase build credentials are not configured; sitemap contains the homepage only.');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...entries].map(([loc, lastmod]) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
