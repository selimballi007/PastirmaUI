// lib/hooks/useAuth.ts - Client-side auth hooks
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { logoutAction } from '@/app/lib/actions/auth';

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
            // ✅ Server Action ile logout - cookies'leri manuel olarak siler
            // Backend'e de logout isteği gönderir (token invalidation için)
            await logoutAction();

            // Client-side temizlik (Zustand store)
            logoutStore();

            // Yönlendirme
            router.push('/');

        } catch (error) {
            console.error('❌ [useAuth] Logout error:', error);

            // Hata olsa bile client state'i temizle
            logoutStore();
            router.push('/');
        }
    }, [logoutStore, router]);

    return { logOut };
};
