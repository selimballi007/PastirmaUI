"use client";

import { useActionState, useEffect, useRef, useCallback, useState, startTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type ReCAPTCHAComponent from "react-google-recaptcha";
import { resetPasswordAction, type ActionState } from "@/app/lib/api/auth";
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

const initialState: ActionState = {
    success: false,
};

export default function ResetPasswordFormClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recaptchaRef = useRef<ReCAPTCHAComponent>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // ✅ Token'ı URL'den al
    const [token, setToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ✅ useActionState
    const [state, formAction, isPending] = useActionState(
        resetPasswordAction,
        initialState
    );

    // ✅ Token kontrolü
    useEffect(() => {
        const urlToken = searchParams.get("token");
        if (!urlToken) {
            setTokenError(true);
        } else {
            setToken(urlToken);
            setTokenError(false);
        }
    }, [searchParams]);

    // ✅ Başarılı şifre sıfırlama sonrası login'e yönlendir
    useEffect(() => {
        if (state.success) {
            const timeout = setTimeout(() => {
                router.push('/account');
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [state.success, router]);

    // ✅ Get captcha token
    const getCaptchaToken = useCallback(async (): Promise<string | null> => {
        if (!recaptchaRef.current) return null;

        try {
            const token = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            return token;
        } catch (error) {
            console.error('ReCAPTCHA error:', error);
            return null;
        }
    }, []);

    // ✅ Handle submit
    const handleSubmit = useCallback(async (formData: FormData) => {
        if (!token) {
            return;
        }

        const captchaToken = await getCaptchaToken();
        if (!captchaToken) return;

        formData.append('token', token);
        formData.append('captchaToken', captchaToken);
        startTransition(() => {
            formAction(formData);
        });
    }, [token, getCaptchaToken, formAction]);

    // ✅ Token yoksa hata göster
    if (tokenError || !token || state.tokenError) {
        return (
            <div className="w-full max-w-md">
                <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Geçersiz Link
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Şifre sıfırlama linki geçersiz veya eksik. Lütfen yeni bir link talep edin.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/account/forgot-password"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Yeni Link Talep Et
                        </Link>
                        <Link
                            href="/account/login"
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Giriş Sayfasına Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <form
                ref={formRef}
                action={handleSubmit}
                className="bg-white shadow-xl rounded-lg p-8 space-y-6"
            >
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-3xl font-bold text-gray-900">
                        Yeni Şifre Belirle
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Lütfen güçlü bir şifre seçin
                    </p>
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        Yeni Şifre
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            disabled={isPending}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                            minLength={6}
                            maxLength={100}
                            aria-describedby={state.errors?.newPassword ? "password-error" : "password-hint"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            disabled={isPending}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {state.errors?.newPassword ? (
                        <p id="password-error" className="text-sm text-red-600" role="alert">
                            {state.errors.newPassword[0]}
                        </p>
                    ) : (
                        <p id="password-hint" className="text-xs text-gray-500">
                            En az 6 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir
                        </p>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Şifre Tekrar
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            disabled={isPending}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                            minLength={6}
                            maxLength={100}
                            aria-describedby={state.errors?.confirmPassword ? "confirm-password-error" : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            disabled={isPending}
                        >
                            {showConfirmPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {state.errors?.confirmPassword && (
                        <p id="confirm-password-error" className="text-sm text-red-600" role="alert">
                            {state.errors.confirmPassword[0]}
                        </p>
                    )}
                </div>

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-gray-700">
                            Güvenliğiniz için güçlü bir şifre seçin ve bu şifreyi başka yerlerde kullanmayın.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <ButtonWithSpinner
                        loading={isPending}
                        type="submit"
                        variant="green"
                        className="w-full"
                    >
                        {isPending ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                    </ButtonWithSpinner>
                </div>

                {/* Messages */}
                {state.message && (
                    <div
                        className={`p-4 rounded-lg ${state.success
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="flex items-start">
                            {state.success ? (
                                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{state.message}</p>
                                {state.success && (
                                    <p className="text-xs mt-2 text-green-600">
                                        3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                                    </p>
                                )}
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

                {/* Back to Login */}
                <div className="pt-4 border-t border-gray-200">
                    <Link
                        href="/account"
                        className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        prefetch={false}
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Giriş Sayfasına Dön
                    </Link>
                </div>
            </form>
        </div>
    );
}