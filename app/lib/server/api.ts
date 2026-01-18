// lib/server/api.ts - Shared server-side API utilities
import { buildApiUrl, parseFetchResponse } from '@/app/lib/utils/fetch';

/**
 * Server-side API call helper for public endpoints (no auth required)
 * Uses shared utilities for consistency
 *
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options (headers, cache, etc.)
 * @returns Parsed response data
 */
export async function serverFetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(endpoint);

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
