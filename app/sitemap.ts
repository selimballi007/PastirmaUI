import { MetadataRoute } from 'next';
import { serverFetchAPI } from '@/app/lib/server/api';

interface Product {
  id: number;
  slug?: string;
  updatedDate?: string;
}

interface BlogPost {
  id: number;
  slug?: string;
  updatedDate?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Fetch all products
  let products: Product[] = [];
  try {
    products = await serverFetchAPI<Product[]>('product');
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  // Fetch all blog posts
  let blogPosts: BlogPost[] = [];
  try {
    blogPosts = await serverFetchAPI<BlogPost[]>('blogpost');
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Product pages
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedDate ? new Date(product.updatedDate) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog post pages
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.updatedDate ? new Date(post.updatedDate) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
