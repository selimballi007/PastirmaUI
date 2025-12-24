// lib/hooks/useAuth.ts - Client-side auth hooks
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { fetchAPI } from '@/app/lib/api/client';

/**
 * Auth actions hook for client-side auth operations
 *
 * @example
 * const { logOut } = useAuthActions();
 * await logOut();
 */
export const useAuthActions = () => {
    const router = useRouter();
    const logoutStore = useAuthStore((state) => state.logout);

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
};
