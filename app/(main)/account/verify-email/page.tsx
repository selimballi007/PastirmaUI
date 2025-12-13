import { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyEmailForm from '@/app/components/account/VerifyEmailForm';

export const metadata: Metadata = {
    title: 'Email Doğrulama',
    description: 'Email adresinizi doğrulayın',
};

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
                <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                            <div className="h-6 w-6 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                </div>
            }>
                <VerifyEmailForm />
            </Suspense>
        </div>
    );
}