import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from '@/app/components/account/ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Şifre Sıfırla',
    description: 'Yeni şifrenizi belirleyin',
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
                <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}