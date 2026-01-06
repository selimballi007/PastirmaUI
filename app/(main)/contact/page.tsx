'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import Turnstile, { type TurnstileHandle } from '@/app/components/Turnstile';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showTurnstile, setShowTurnstile] = useState(false);
    const turnstileRef = useRef<TurnstileHandle>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        // Lazy load Turnstile when user starts filling the form
        if (!showTurnstile) {
            setShowTurnstile(true);
        }

        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const getCaptchaToken = useCallback(async (): Promise<string | null> => {
        if (!turnstileRef.current) return null;

        try {
            const token = await turnstileRef.current.executeAsync();
            turnstileRef.current.reset();
            return token;
        } catch (error) {
            return null;
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Get Turnstile token
            const captchaToken = await getCaptchaToken();

            if (!captchaToken) {
                setSubmitStatus('error');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    captchaToken
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Mesaj gönderilirken bir hata oluştu');
            }

            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
            }, 5000);
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-white hover:text-orange-100 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">İletişim</h1>
                    <p className="text-xl text-orange-100 max-w-3xl">
                        Sorularınız, önerileriniz veya siparişleriniz için bizimle iletişime geçin
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h2>

                            {/* Address */}
                            <div className="mb-6">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Adres</h3>
                                        <p className="text-gray-600 text-sm">
                                            Merkez Mahallesi, Lezzet Sokak No:123
                                            <br />
                                            Çankaya / Ankara
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="mb-6">
                                <div className="flex items-start space-x-3">
                                    <Phone className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                                        <a href="tel:+903121234567" className="text-gray-600 text-sm hover:text-orange-600">
                                            +90 (312) 123 45 67
                                        </a>
                                        <br />
                                        <a href="tel:+905321234567" className="text-gray-600 text-sm hover:text-orange-600">
                                            +90 (532) 123 45 67
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-6">
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">E-posta</h3>
                                        <a href="mailto:info@pastirmaadasi.com" className="text-gray-600 text-sm hover:text-orange-600">
                                            info@pastirmaadasi.com
                                        </a>
                                        <br />
                                        <a href="mailto:siparis@pastirmaadasi.com" className="text-gray-600 text-sm hover:text-orange-600">
                                            siparis@pastirmaadasi.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div>
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Çalışma Saatleri</h3>
                                        <p className="text-gray-600 text-sm">
                                            Pazartesi - Cumartesi: 09:00 - 20:00
                                            <br />
                                            Pazar: 10:00 - 18:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Hızlı Bağlantılar</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/products" className="text-gray-700 hover:text-orange-600 text-sm">
                                        Ürünlerimiz
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-gray-700 hover:text-orange-600 text-sm">
                                        Hakkımızda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="text-gray-700 hover:text-orange-600 text-sm">
                                        Sepetim
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/account" className="text-gray-700 hover:text-orange-600 text-sm">
                                        Hesabım
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bize Ulaşın</h2>
                            <p className="text-gray-600 mb-6">
                                Formu doldurarak bize mesaj gönderebilirsiniz. En kısa sürede size dönüş yapacağız.
                            </p>

                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800 text-sm">
                                        Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                                    </p>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">
                                        Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Ad Soyad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Adınız ve soyadınız"
                                    />
                                </div>

                                {/* Email and Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            E-posta <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="ornek@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefon
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="(5XX) XXX XX XX"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Konu <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Konu seçiniz</option>
                                        <option value="order">Sipariş</option>
                                        <option value="product">Ürün Bilgisi</option>
                                        <option value="complaint">Şikayet</option>
                                        <option value="suggestion">Öneri</option>
                                        <option value="other">Diğer</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mesajınız <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        placeholder="Mesajınızı buraya yazınız..."
                                    />
                                </div>

                                {/* Turnstile CAPTCHA - Lazy loaded */}
                                {showTurnstile && (
                                    <div className="flex justify-center">
                                        <Turnstile ref={turnstileRef} />
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Gönderiliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Mesaj Gönder</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map Section (Optional - Placeholder) */}
                <div className="mt-12">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bizi Ziyaret Edin</h2>
                        <p className="text-gray-600 mb-6">
                            Mağazamıza gelerek ürünlerimizi yerinde inceleyebilir ve tadabilirsiniz.
                        </p>
                        {/* Placeholder for map - can be replaced with actual map component */}
                        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MapPin className="w-12 h-12 mx-auto mb-2" />
                                <p>Harita Entegrasyonu</p>
                                <p className="text-sm">Google Maps veya benzeri servis eklenebilir</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
