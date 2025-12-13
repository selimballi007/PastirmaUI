// lib/api/client.ts
'use client';

import { useAuthStore } from '@/app/lib/store/authStore';

let refreshPromise: Promise<{ accessToken: string; user: any } | null> | null = null;

async function refreshAccessToken() {
    if (refreshPromise) {
        console.log('[API] Waiting for ongoing refresh...');
        return refreshPromise;
    }

    console.log('[API] Starting token refresh...');
    refreshPromise = (async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}user/refresh-token`;

            // ✅ Store'dan accessToken al
            const store = useAuthStore.getState();

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // ✅ AccessToken varsa ekle
            if (store.accessToken) {
                headers['Authorization'] = `Bearer ${store.accessToken}`;
                console.log('[API] Adding accessToken to refresh request');
            }
            const response = await fetch(url, {
                method: 'POST',
                headers,
                credentials: 'include',
            });

            console.log('[API] Refresh response status:', response.status);

            if (!response.ok) {
                console.error('[API] Refresh failed with status:', response.status);

                // ✅ Logout ama redirect YAPMA (guest mode'a dön)
                useAuthStore.getState().logout();

                return null;
            }

            const data = await response.json();
            console.log('[API] Refresh successful');

            useAuthStore.getState().login(data.accessToken, data.user);

            return { accessToken: data.accessToken, user: data.user };
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
        hasAccessToken: !!store.accessToken,
        mode: store.accessToken ? 'authenticated' : 'guest',
    });

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    // ✅ Token varsa ekle, yoksa guest mode
    if (store.accessToken) {
        headers.set('Authorization', `Bearer ${store.accessToken}`);
        console.log('[API] Authorization header set');
        console.log('Headers:', Object.fromEntries(headers.entries()));
        console.log('URL:', url);
    } else {
        console.log('[API] Guest mode - no token');
    }

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    console.log('[API] Response status:', response.status);

    // ✅ 401 durumunda: Token varsa refresh dene, yoksa guest olarak devam et
    if (response.status === 401) {
        console.log('[API] Got 401');

        // Eğer token varsa refresh dene
        if (store.accessToken) {
            console.log('[API] Attempting token refresh...');
            const refreshResult = await refreshAccessToken();

            if (refreshResult?.accessToken) {
                console.log('[API] Refresh successful, retrying request');

                // Retry with new token
                headers.set('Authorization', `Bearer ${refreshResult.accessToken}`);
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: 'include',
                });

                console.log('[API] Retry response status:', response.status);
            } else {
                console.log('[API] Refresh failed, continuing as guest');
            }
        } else {
            console.log('[API] No token, this is a guest request - 401 is expected');
        }
    }

    return response;
}