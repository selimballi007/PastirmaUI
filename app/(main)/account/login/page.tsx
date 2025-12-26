import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/app/components/account/LoginForm';

export const metadata: Metadata = {
    title: 'Giriş Yap',
    description: 'Hesabınıza giriş yapın',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div>Yükleniyor...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}