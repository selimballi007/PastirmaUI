import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/about',
          '/contact',
          '/blog',
          '/blog/*',
        ],
        disallow: [
          '/account/*',
          '/dashboard/*',
          '/checkout',
          '/cart',
          '/orders',
          '/orders/*',
          '/api/*',
          '/_next/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/about',
          '/contact',
          '/blog',
          '/blog/*',
        ],
        disallow: [
          '/account/*',
          '/dashboard/*',
          '/checkout',
          '/cart',
          '/orders',
          '/orders/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
