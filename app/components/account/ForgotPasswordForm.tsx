"use client";

import { useActionState, useEffect, useRef, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPasswordAction, type ActionState } from "@/app/lib/actions/auth";
import ButtonWithSpinner from "@/app/components/ButtonWithSpinner";
import Turnstile, { type TurnstileHandle } from "@/app/components/Turnstile";

const initialState: ActionState = {
    success: false,
};

export default function ForgotPasswordForm() {
    const router = useRouter();
    const turnstileRef = useRef<TurnstileHandle>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // ✅ useActionState - Axios yerine
    const [state, formAction, isPending] = useActionState(
        forgotPasswordAction,
        initialState
    );

    // ✅ Başarılı gönderim sonrası form temizleme
    useEffect(() => {
        if (state.success && state.message?.startsWith("✅")) {
            formRef.current?.reset();
        }
    }, [state]);

    // ✅ Get captcha token - useCallback ile memoize
    const getCaptchaToken = useCallback(async (): Promise<string | null> => {
        if (!turnstileRef.current) return null;

        try {
            const token = await turnstileRef.current.executeAsync();
            turnstileRef.current.reset();
            return token;
        } catch (error) {
            console.error('Turnstile error:', error);
            return null;
        }
    }, []);

    // ✅ Handle submit - useCallback ile memoize
    const handleSubmit = useCallback(async (formData: FormData) => {
        const token = await getCaptchaToken();
        if (!token) return;

        formData.append('captchaToken', token);
        startTransition(() => {
            formAction(formData);
        });
    }, [getCaptchaToken, formAction]);

    return (
        <div className="w-full max-w-md">
            <form
                ref={formRef}
                action={handleSubmit}
                className="bg-white shadow-xl rounded-lg p-8 space-y-6"
            >
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Şifremi Unuttum
                    </h2>
                    <p className="text-sm text-gray-600">
                        E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                    </p>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-posta Adresi
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="ornek@email.com"
                        aria-describedby={state.errors?.email ? "email-error" : undefined}
                    />
                    {state.errors?.email && (
                        <p id="email-error" className="text-sm text-red-600" role="alert">
                            {state.errors.email[0]}
                        </p>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-sm text-gray-700">
                            Güvenlik nedeniyle, e-posta adresinin kayıtlı olup olmadığını doğrulamıyoruz.
                            Eğer hesabınız varsa, birkaç dakika içinde e-posta alacaksınız.
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
                        {isPending ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
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
                                <svg
                                    className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            <p className="text-sm font-medium flex-1">{state.message}</p>
                        </div>
                    </div>
                )}

                {/* General Errors */}
                {state.errors && !state.errors.email && (
                    <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg" role="alert">
                        <p className="text-sm font-medium">
                            {Object.values(state.errors).flat()[0]}
                        </p>
                    </div>
                )}

                {/* Turnstile CAPTCHA */}
                <div className="flex justify-center">
                    <Turnstile ref={turnstileRef} />
                </div>

                {/* Back to Login */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <Link
                            href="/account/login"
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                            prefetch={false}
                        >
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Giriş Sayfasına Dön
                        </Link>

                        <Link
                            href="/register"
                            className="text-gray-600 hover:text-gray-900 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                            prefetch={false}
                        >
                            Kayıt Ol
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}