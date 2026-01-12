// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';

export default function ProtectedRoute({
    children
}: {
    children: React.ReactNode
}) {
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter();

    useEffect(() => {
        // ✅ Sadece protected sayfalar için login kontrolü
        if (!isLoading && !user) {
            console.log('🔒 [ProtectedRoute] Redirecting to login');
            router.push('/account/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Redirect olana kadar boş göster
    }

    return <>{children}</>;
}