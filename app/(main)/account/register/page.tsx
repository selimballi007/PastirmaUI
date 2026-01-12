import { Metadata } from 'next';
import RegisterForm from '@/app/components/account/RegisterForm';

export const metadata: Metadata = {
    title: 'Kayıt Ol',
    description: 'Yeni hesap oluşturun',
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <RegisterForm />
        </div>
    );
}