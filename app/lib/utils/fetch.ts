// lib/utils/fetch.ts - Shared fetch utilities
/**
 * Shared response parsing logic for both server and client-side fetches
 */
export async function parseFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        console.error('[fetchUtils] Response not ok:', response.status);
        const error = await response.json().catch(() => ({
            message: 'Unknown error',
        }));
        throw new Error(error.message || `API call failed: ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        console.log('[fetchUtils] No JSON content');
        return {} as T;
    }

    try {
        const text = await response.text();
        if (!text) {
            console.log('[fetchUtils] Empty response body');
            return {} as T;
        }

        const data = JSON.parse(text);
        return data;
    } catch (error) {
        console.error('[fetchUtils] JSON parse error:', error);
        throw new Error('Failed to parse response');
    }
}

/**
 * Get API base URL
 * During build (SSG): Uses API_URL (full backend URL with /api/ included)
 * During runtime: Uses NEXT_PUBLIC_API_URL (relative /api for same-domain)
 */
export function getApiBaseUrl(): string {
    // Server-side during build: use full backend URL
    // API_URL should already include /api/ (e.g., https://backend.com/api/)
    if (typeof window === 'undefined' && process.env.API_URL) {
        return process.env.API_URL;
    }
    // Client-side or server-side runtime: use relative URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5296/api/';
}

/**
 * Build full API URL from endpoint
 */
export function buildApiUrl(endpoint: string): string {
    // If endpoint is already a full URL, return as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        return endpoint;
    }

    const baseUrl = getApiBaseUrl();
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}${cleanEndpoint}`;
}
