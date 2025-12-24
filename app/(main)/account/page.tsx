'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@/app/lib/store/authStore';
import AccountDetails from '@/app/components/account/AccountDetails';

export default function AccountPage() {
    const router = useRouter();
    const isAuthenticated = useIsAuthenticated();

    // ✅ Redirect if not authenticated (client-side)
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/account/login');
        }
    }, [isAuthenticated, router]);

    // ✅ Show loading while checking auth
    if (!isAuthenticated) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AccountDetails />

            {/* TODO: Add user-specific content here */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Hesap Bilgileri</h2>
                <p className="text-gray-600">Kullanıcıya özel içerik buraya gelecek...</p>
            </div>
        </main>
    )
}
