"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type ReCAPTCHAComponent from "react-google-recaptcha";
import { verifyEmailAction, resendVerificationByTokenAction, type ActionState } from "@/app/lib/api/auth";
import ButtonWithSpinner from "@/app/components/ButtonWithSpinner";

// ✅ Lazy load ReCAPTCHA
const ReCAPTCHA = dynamic(() =>
    import("react-google-recaptcha").then((mod) => {
        return mod.default;
    }), {
    ssr: false,
    loading: () => <div className="h-[78px] w-full animate-pulse bg-gray-100 rounded" />
}
) as React.ComponentType<React.ComponentProps<typeof ReCAPTCHAComponent> & {
    ref?: React.Ref<ReCAPTCHAComponent>;
}>;

const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error' | 'expired';

export default function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recaptchaRef = useRef<ReCAPTCHAComponent>(null);

    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [message, setMessage] = useState<string>("");
    const [showResend, setShowResend] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // ✅ Auto-verify on mount
    useEffect(() => {
        const urlToken = searchParams.get("token");

        if (!urlToken) {
            setStatus('error');
            setMessage("❌ Doğrulama linki geçersiz veya eksik.");
            return;
        }

        setToken(urlToken);

        // Auto-verify
        const autoVerify = async () => {
            setStatus('verifying');

            try {
                if (!recaptchaRef.current) {
                    // ReCAPTCHA henüz yüklenmedi, bekle
                    setTimeout(autoVerify, 500);
                    return;
                }

                const captchaToken = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();

                const formData = new FormData();
                formData.append('token', urlToken);
                formData.append('captchaToken', captchaToken ?? "");

                const result = await verifyEmailAction(null, formData);

                if (result.success) {
                    setStatus('success');
                    setMessage(result.message || "✅ Email doğrulandı!");
                    setShowResend(false);

                    // 3 saniye sonra login'e yönlendir
                    setTimeout(() => {
                        router.push('/account/login');
                    }, 3000);
                } else {
                    setStatus(result.showResend ? 'expired' : 'error');
                    setMessage(result.message || "❌ Doğrulama başarısız.");
                    setShowResend(result.showResend || false);
                }
            } catch (error) {
                console.error('Auto verify error:', error);
                setStatus('error');
                setMessage("❌ Beklenmeyen bir hata oluştu.");
            }
        };

        autoVerify();
    }, [searchParams, router]);

    // ✅ Resend handler
    const handleResend = useCallback(async () => {
        if (!token || !recaptchaRef.current) return;

        setIsResending(true);

        try {
            const captchaToken = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();

            const formData = new FormData();
            formData.append('token', token);
            formData.append('captchaToken', captchaToken ?? "");

            const result = await resendVerificationByTokenAction(null, formData);

            if (result.success) {
                setMessage(result.message || "✅ Yeni doğrulama maili gönderildi.");
                setShowResend(false);
                setStatus('success');
            } else {
                setMessage(result.message || "❌ Mail gönderilemedi.");
            }
        } catch (error) {
            console.error('Resend error:', error);
            setMessage("❌ Beklenmeyen bir hata oluştu.");
        } finally {
            setIsResending(false);
        }
    }, [token]);

    // ✅ Status icons and colors
    const getStatusConfig = () => {
        switch (status) {
            case 'verifying':
                return {
                    icon: (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    ),
                    bgColor: 'bg-blue-100',
                    title: 'Doğrulanıyor...',
                    description: 'Email adresiniz doğrulanıyor, lütfen bekleyin.',
                };
            case 'success':
                return {
                    icon: (
                        <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-green-100',
                    title: 'Doğrulama Başarılı!',
                    description: 'Email adresiniz başarıyla doğrulandı.',
                };
            case 'expired':
                return {
                    icon: (
                        <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-yellow-100',
                    title: 'Link Süresi Dolmuş',
                    description: 'Doğrulama linkinizin süresi dolmuş.',
                };
            case 'error':
                return {
                    icon: (
                        <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    bgColor: 'bg-red-100',
                    title: 'Doğrulama Başarısız',
                    description: 'Email doğrulama işlemi başarısız oldu.',
                };
            default:
                return {
                    icon: null,
                    bgColor: 'bg-gray-100',
                    title: 'Email Doğrulama',
                    description: 'Yükleniyor...',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="w-full max-w-md">
            <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
                {/* Status Icon */}
                <div className="text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${config.bgColor}`}>
                        {config.icon}
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        {config.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {config.description}
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-lg ${message.startsWith("✅")
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : message.startsWith("📩")
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                        role="alert"
                        aria-live="polite"
                    >
                        <p className="text-sm font-medium text-center">{message}</p>
                        {status === 'success' && (
                            <p className="text-xs mt-2 text-center opacity-75">
                                3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                            </p>
                        )}
                    </div>
                )}

                {/* Resend Button */}
                {showResend && (
                    <div className="space-y-3">
                        <ButtonWithSpinner
                            loading={isResending}
                            onClick={handleResend}
                            variant="blue"
                            className="w-full"
                            disabled={isResending}
                        >
                            {isResending ? "Gönderiliyor..." : "Yeniden Doğrulama Maili Gönder"}
                        </ButtonWithSpinner>

                        <p className="text-xs text-center text-gray-500">
                            Yeni bir doğrulama linki gönderilecek
                        </p>
                    </div>
                )}

                {/* Info Box - Only show when expired or error */}
                {(status === 'expired' || (status === 'error' && !showResend)) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 font-medium">
                                    Sorun mu yaşıyorsunuz?
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Gelen kutunuzda maili bulamıyorsanız, spam klasörünü kontrol edin veya yeni bir doğrulama maili talep edin.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ReCAPTCHA */}
                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_KEY}
                        size="invisible"
                        ref={recaptchaRef}
                    />
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                    {status === 'success' ? (
                        <Link
                            href="/account/login"
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                        >
                            Giriş Sayfasına Git
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/account/login"
                                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Giriş Sayfasına Dön
                            </Link>

                            {!showResend && (
                                <Link
                                    href="/account/register"
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                                >
                                    Yeni Hesap Oluştur
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}