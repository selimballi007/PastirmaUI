"use client";

import { useActionState, useEffect, useRef, useCallback, startTransition, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction, type ActionState } from "@/app/lib/actions/auth";
import ButtonWithSpinner from "@/app/components/ButtonWithSpinner";
import Turnstile, { type TurnstileHandle } from "@/app/components/Turnstile";

const initialState: ActionState = {
    success: false,
};

export default function RegisterFormClient() {
    const router = useRouter();
    const turnstileRef = useRef<TurnstileHandle>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // ✅ useActionState - Redux yerine
    const [state, formAction, isPending] = useActionState(
        registerAction,
        initialState
    );

    // ✅ Manual processing state for immediate UI feedback
    const [isProcessing, setIsProcessing] = useState(false);

    // ✅ Başarılı kayıt sonrası yönlendirme
    useEffect(() => {
        if (state.success) {
            // Clear processing state
            setIsProcessing(false);

            // Form'u temizle
            formRef.current?.reset();

            // 3 saniye sonra login sayfasına yönlendir
            const timeout = setTimeout(() => {
                router.push('/account/login');
            }, 3000);

            return () => clearTimeout(timeout);
        } else if (state && !state.success && state.message) {
            // ✅ Clear processing state on error
            setIsProcessing(false);
        }
    }, [state.success, state.message, router]);

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

        // ✅ flushSync: Force immediate synchronous render BEFORE captcha fetch
        // Without this, React batches the state update and it happens AFTER captcha
        flushSync(() => {
            setIsProcessing(true);
        });

        try {
            const token = await getCaptchaToken();

            if (!token) {
                setIsProcessing(false);
                return;
            }

            formData.append('captchaToken', token);
            startTransition(() => {
                formAction(formData);
            });
        } catch (error) {
            console.error('[RegisterForm] Error:', error);
            setIsProcessing(false);
        }
    }, [getCaptchaToken, formAction]);

    return (
        <div className="w-full max-w-md">
            <form
                ref={formRef}
                action={handleSubmit}
                className="bg-white shadow-xl rounded-lg p-6 space-y-6"
            >
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    Kayıt Ol
                </h2>

                {/* Username Input */}
                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Kullanıcı Adı
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        disabled={isPending || isProcessing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="kullanıcıadı"
                        minLength={3}
                        maxLength={50}
                        aria-describedby={state.errors?.username ? "username-error" : undefined}
                    />
                    {state.errors?.username && (
                        <p id="username-error" className="text-sm text-red-600" role="alert">
                            {state.errors.username[0]}
                        </p>
                    )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        disabled={isPending || isProcessing}
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

                {/* Password Input */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Şifre
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        disabled={isPending || isProcessing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                        minLength={6}
                        maxLength={100}
                        aria-describedby={state.errors?.password ? "password-error" : undefined}
                    />
                    {state.errors?.password && (
                        <p id="password-error" className="text-sm text-red-600" role="alert">
                            {state.errors.password[0]}
                        </p>
                    )}
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Hesap oluşturmanız için e-posta adresinize bir bağlantı gönderilecek.
                        Gönderiler klasöründe bulamazsanız Spam klasörünü kontrol ediniz.
                    </p>
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                        Kişisel verileriniz, bu web sitesindeki deneyiminizi desteklemek, hesabınıza erişimi yönetmek ve
                        aşağıda açıklanan diğer amaçlar için kullanılacaktır.{" "}
                        <Link
                            href="/privacy-policy"
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                            prefetch={false}
                        >
                            Gizlilik İlkesi
                        </Link>.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <ButtonWithSpinner
                        loading={isPending || isProcessing}
                        type="submit"
                        variant="green"
                        className="w-full"
                    >
                        {(isPending || isProcessing) ? "Kaydediliyor..." : "Kayıt Ol"}
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
                        <p className="text-sm font-medium">{state.message}</p>
                        {state.success && (
                            <p className="text-xs mt-2 text-green-600">
                                3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                            </p>
                        )}
                    </div>
                )}

                {/* General Errors */}
                {state.errors && !state.errors.username && !state.errors.email && !state.errors.password && (
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

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                    Zaten hesabınız var mı?{" "}
                    <Link
                        href="/account/login"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        prefetch={false}
                    >
                        Giriş Yap
                    </Link>
                </div>
            </form>
        </div>
    );
}