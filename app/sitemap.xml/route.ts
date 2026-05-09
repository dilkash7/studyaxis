import { connectDB } from '@/lib/mongodb';
import College from '@/models/College';
import Blog from '@/models/Blog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com';

export async function GET() {
  await connectDB();

  const colleges = await College.find({ isActive: { $ne: false } }).select('_id updatedAt').lean();
  const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt').lean();

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/college-finder', priority: '0.9', changefreq: 'daily' },
    { url: '/india', priority: '0.8', changefreq: 'weekly' },
    { url: '/abroad', priority: '0.8', changefreq: 'weekly' },
    { url: '/apply', priority: '0.8', changefreq: 'monthly' },
    { url: '/compare', priority: '0.7', changefreq: 'weekly' },
    { url: '/visa-guidance', priority: '0.7', changefreq: 'monthly' },
    { url: '/career-guidance', priority: '0.7', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${colleges.map(c => `  <url>
    <loc>${BASE_URL}/college/${c._id}</loc>
    <lastmod>${new Date(c.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${blogs.map(b => `  <url>
    <loc>${BASE_URL}/blog/${b.slug}</loc>
    <lastmod>${new Date(b.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
