// lib/api/client.ts - Cookie-based API client (no client-side token storage)
'use client';

import { useAuthStore } from '@/app/lib/store/authStore';
import { parseFetchResponse, buildApiUrl } from '@/app/lib/utils/fetch';
import { refreshTokenAction } from '@/app/lib/actions/auth';

let refreshPromise: Promise<{ user: any } | null> | null = null;

async function refreshAccessToken() {
    if (refreshPromise) {
        console.log('[API] Waiting for ongoing refresh...');
        return refreshPromise;
    }

    console.log('[API] Starting token refresh...');
    refreshPromise = (async () => {
        try {
            // ✅ Use Server Action to properly handle cookie updates
            const result = await refreshTokenAction();

            if (!result.success) {
                console.error('[API] Refresh failed');
                useAuthStore.getState().logout();
                return null;
            }

            console.log('[API] Refresh successful');

            // ✅ Update user in store
            if (result.user) {
                useAuthStore.getState().login(result.user);
            }

            return { user: result.user };
        } catch (error) {
            console.error('[API] Token refresh error:', error);
            useAuthStore.getState().logout();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiCall(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const store = useAuthStore.getState();

    console.log('[API] Request:', {
        url,
        method: options.method || 'GET',
        hasUser: !!store.user,
        mode: store.user ? 'authenticated' : 'guest',
    });

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    // ✅ Token cookie'de - Authorization header GEREK YOK
    // Sadece credentials: 'include' yeterli

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // ✅ Cookie otomatik gönderilir
    });

    console.log('[API] Response status:', response.status);

    // ✅ 401 durumunda: User varsa refresh dene
    if (response.status === 401) {
        console.log('[API] Got 401');

        // User varsa (daha önce login yapmış), token refresh dene
        if (store.user) {
            console.log('[API] Attempting token refresh...');
            const refreshResult = await refreshAccessToken();

            if (refreshResult?.user) {
                console.log('[API] Refresh successful, retrying request');

                // Retry with new cookie (otomatik gönderilecek)
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: 'include',
                });

                console.log('[API] Retry response status:', response.status);
            } else {
                console.log('[API] Refresh failed, logging out');
            }
        } else {
            console.log('[API] No user, this is a guest request - 401 is expected');
        }
    }

    return response;
}

/**
 * High-level fetch API for client-side requests with auth
 * Uses apiCall internally for automatic token refresh
 */
export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = buildApiUrl(endpoint);

    console.log('[fetchAPI] Fetching:', url);

    const response = await apiCall(url, options);
    return parseFetchResponse<T>(response);
}

/**
 * Fetch hook for test token (legacy support)
 * @deprecated Use fetchAPI instead
 */
export function useFetchForTestToken() {
    return async (endpoint: string, options?: RequestInit) => {
        const url = buildApiUrl(endpoint);
        const response = await apiCall(url, options);

        console.log('[useFetch] Got response, status:', response.status);

        if (!response.ok) {
            console.error('[useFetch] Response not ok');
            const error = await response.json().catch(() => ({
                message: 'Unknown error',
            }));
            console.error('[useFetch] Error data:', error);
            throw new Error(error.message || 'API call failed');
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            console.log('[useFetch] No JSON content, returning empty response');
            return { status: response.status, ok: true };
        }

        try {
            const text = await response.text();
            if (!text) {
                console.log('[useFetch] Empty response body');
                return { status: response.status, ok: true };
            }

            const data = JSON.parse(text);
            console.log('[useFetch] Returning data:', data);
            return data;
        } catch (error) {
            console.error('[useFetch] JSON parse error:', error);
            return { status: response.status, ok: true };
        }
    };
}