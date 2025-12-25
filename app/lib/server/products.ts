// lib/server/products.ts - Server-side data fetching for products
import type { Product, Review, ReviewFilters } from '@/app/types/dashboard';
import { buildApiUrl, parseFetchResponse } from '@/app/lib/utils/fetch';

/**
 * Server-side API call helper for public endpoints (no auth required)
 * Uses shared utilities for consistency
 */
async function serverFetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(endpoint);

    console.log('[Server] Fetching:', url);

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        // Revalidate data every 60 seconds for fresh content
        next: { revalidate: 60 },
    });

    return parseFetchResponse<T>(response);
}

/**
 * Filters for products listing
 */
export interface ProductFilters {
    categoryId?: number;
    isBestSeller?: boolean;
    isCampaign?: boolean;
    isNew?: boolean;
    limit?: number;
}

/**
 * Get products list with optional filters
 */
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
        const params = new URLSearchParams();

        if (filters?.categoryId) {
            params.set('categoryId', filters.categoryId.toString());
        }
        if (filters?.isBestSeller) {
            params.set('isBestSeller', 'true');
        }
        if (filters?.isCampaign) {
            params.set('isCampaign', 'true');
        }
        if (filters?.isNew) {
            params.set('isNew', 'true');
        }
        if (filters?.limit) {
            params.set('limit', filters.limit.toString());
        }

        const queryString = params.toString();
        const endpoint = queryString ? `product?${queryString}` : 'product';

        return await serverFetchAPI<Product[]>(endpoint);
    } catch (error) {
        console.error('[Server] Error fetching products:', error);
        return [];
    }
}

/**
 * Get single product by ID
 * @param id Product ID
 * @param incrementView Whether to increment view count
 */
export async function getProductById(id: number, incrementView: boolean = false): Promise<Product | null> {
    try {
        const params = new URLSearchParams();
        if (incrementView) {
            params.set('incrementView', 'true');
        }

        const queryString = params.toString();
        const endpoint = queryString ? `product/${id}?${queryString}` : `product/${id}`;

        // Don't cache when incrementing view count
        if (incrementView) {
            return await fetch(buildApiUrl(endpoint), {
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            }).then(parseFetchResponse<Product>);
        }

        return await serverFetchAPI<Product>(endpoint);
    } catch (error) {
        console.error(`[Server] Error fetching product ${id}:`, error);
        return null;
    }
}

/**
 * Get product reviews
 */
export async function getProductReviews(filters: ReviewFilters): Promise<Review[]> {
    try {
        const params = new URLSearchParams();

        if (filters.productId) {
            params.set('productId', filters.productId.toString());
        }
        if (filters.page) {
            params.set('page', filters.page.toString());
        }
        if (filters.pageSize) {
            params.set('pageSize', filters.pageSize.toString());
        }

        const queryString = params.toString();
        const endpoint = queryString ? `reviews?${queryString}` : 'reviews';

        return await serverFetchAPI<Review[]>(endpoint);
    } catch (error) {
        console.error('[Server] Error fetching product reviews:', error);
        return [];
    }
}

/**
 * Get related products by category
 */
export async function getRelatedProducts(categoryId: number, excludeId: number, limit: number = 4): Promise<Product[]> {
    try {
        const products = await getProducts({ categoryId, limit: limit + 1 });

        // Filter out the current product and limit results
        return products
            .filter(p => p.id !== excludeId)
            .slice(0, limit);
    } catch (error) {
        console.error('[Server] Error fetching related products:', error);
        return [];
    }
}

/**
 * Get categories with product count
 */
export async function getCategoriesWithCount() {
    try {
        return await serverFetchAPI<any[]>('categories/with-product-count');
    } catch (error) {
        console.error('[Server] Error fetching categories:', error);
        return [];
    }
}
