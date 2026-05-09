export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com';
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /admin/login

Sitemap: ${BASE_URL}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
