// api/hooks.ts
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation'
import { apiCall } from '@/app/lib/api/client';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log('Fetching:', url);

    const response = await apiCall(url, options);
    console.log(response);
    if (!response.ok) {
        console.error('Response not ok:', response.status);
        const error = await response.json().catch(() => ({
            message: 'Unknown error',
        }));
        throw new Error(error.message || 'API call failed');
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        console.log('[fetchAPI] No JSON content');
        return {} as T;
    }

    try {
        const text = await response.text();
        if (!text) {
            console.log('[fetchAPI] Empty response body');
            return {} as T;
        }

        const data = JSON.parse(text);
        console.log('[fetchAPI] Returning data:', data);
        return data;
    } catch (error) {
        console.error('[fetchAPI] JSON parse error:', error);
        throw new Error('Failed to parse response');
    }
}

export const useAuthActions = () => {
    const router = useRouter()
    const logoutStore = useAuthStore((state) => state.logout)
    const logOut = useCallback(async () => {
        try {
            // Backend'e logout isteği gönder
            await fetchAPI('user/logout', {
                method: 'POST'
            }).catch(error => {
                // Backend logout hatasında bile devam et
                console.log('Backend logout failed, continuing with client cleanup');
            });

            // Client-side temizlik
            logoutStore();
            console.log('Logout request finished');

            // Yönlendirme
            router.push('/');

        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [logoutStore, router]);

    return { logOut };
}

export function useFetchForTestToken() {
    return useCallback(async (endpoint: string, options?: RequestInit) => {
        const url = `${API_BASE_URL}${endpoint}`;
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
    }, []);
}