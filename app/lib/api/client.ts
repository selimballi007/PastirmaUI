// lib/api/client.ts - Cookie-based API client (no client-side token storage)
'use client';

import { useAuthStore } from '@/app/lib/store/authStore';
import { parseFetchResponse, buildApiUrl } from '@/app/lib/utils/fetch';
import { refreshTokenAction } from '@/app/lib/actions/auth';

let refreshPromise: Promise<{ user: any } | null> | null = null;

async function refreshAccessToken() {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            // ✅ Use Server Action to properly handle cookie updates
            const result = await refreshTokenAction();

            if (!result.success) {
                console.error('[API] Refresh failed');
                useAuthStore.getState().logout();
                return null;
            }

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

    // ✅ 401 durumunda: User varsa refresh dene
    if (response.status === 401) {

        // User varsa (daha önce login yapmış), token refresh dene
        if (store.user) {
            const refreshResult = await refreshAccessToken();

            if (refreshResult?.user) {

                // Retry with new cookie (otomatik gönderilecek)
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: 'include',
                });

            }
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

    const response = await apiCall(url, options);
    return parseFetchResponse<T>(response);
}