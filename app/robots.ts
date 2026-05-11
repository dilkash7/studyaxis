import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/india',
        '/abroad',
        '/search',
        '/college',
        '/course',
        '/apply',
      ],
      disallow: [
        '/admin/',
        '/api/private/',
        '/private/',
        '/*.json$',
        '/search?*',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://studyaxis.com'}/sitemap.xml`,
  };
}
