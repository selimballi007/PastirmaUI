"use client";

import { useActionState, useEffect, useRef, useCallback, startTransition, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, resendVerificationAction, type ActionState } from "@/app/lib/actions/auth";
import ButtonWithSpinner from "@/app/components/ButtonWithSpinner";
import Turnstile, { type TurnstileHandle } from "@/app/components/Turnstile";
import { useAuthStore } from '@/app/lib/store/authStore';

const initialState: ActionState = {
    success: false,
};

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const turnstileRef = useRef<TurnstileHandle>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { login } = useAuthStore();

    // ✅ Manuel loading state - captcha için
    const [isProcessing, setIsProcessing] = useState(false);

    // useActionState for login
    const [loginState, loginFormAction, isLoginPending] = useActionState(
        loginAction,
        initialState
    );

    // useActionState for resend
    const [resendState, resendFormAction, isResendPending] = useActionState(
        resendVerificationAction,
        initialState
    );

    // Handle successful login
    useEffect(() => {
        if (loginState?.success && loginState.user) {
            // ✅ Store'a user bilgisini kaydet
            login(loginState.user);

            // ✅ Redirect parametresini kontrol et
            const redirect = searchParams.get('redirect') || (loginState.user.role === 'Admin' ? '/dashboard' : '/');

            console.log('🚀 Login successful, will redirect to:', redirect);
            console.log('👤 User role:', loginState.user.role);

            // ✅ Cookie'ler artık Server Action'da set ediliyor
            // router.push() kullanarak smooth client-side navigation
            console.log('✅ Redirecting to:', redirect);
            router.push(redirect);
        } else if (loginState && !loginState.success) {
            // ✅ Login başarısız olursa processing state'i sıfırla
            setIsProcessing(false);
        }
    }, [loginState, login, searchParams, router]);

    // Handle successful resend
    useEffect(() => {
        if (resendState.success) {
            // Clear processing state
            setIsProcessing(false);
            // Reset form
            formRef.current?.reset();

            // Refresh page to reset to normal login form and prevent spam
            setTimeout(() => {
                window.location.reload();
            }, 2000); // 2 seconds delay to let user see the success message
        } else if (resendState && !resendState.success && resendState.message) {
            // Clear processing state on error
            setIsProcessing(false);
        }
    }, [resendState.success, resendState.message, router]);

    // Get captcha token
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

    // Handle login submit
    const handleLoginSubmit = useCallback(async (formData: FormData) => {
        // ✅ flushSync: Force immediate synchronous render BEFORE captcha fetch
        // This ensures button becomes disabled instantly, without waiting for async captcha
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
                loginFormAction(formData);
            });
        } catch (error) {
            setIsProcessing(false);
        }
    }, [getCaptchaToken, loginFormAction]);

    // Handle resend submit
    const handleResendSubmit = useCallback(async (formData: FormData) => {
        // ✅ flushSync: Force immediate synchronous render BEFORE captcha fetch
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
                resendFormAction(formData);
            });
        } catch (error) {
            setIsProcessing(false);
        }
    }, [getCaptchaToken, resendFormAction]);

    const isPending = isLoginPending || isResendPending || isProcessing;
    const currentState = loginState.showResend ? resendState : loginState;
    const showResendButton = loginState.showResend;

    return (
        <div className="w-full max-w-md">
            <form
                ref={formRef}
                action={showResendButton ? handleResendSubmit : handleLoginSubmit}
                className="bg-white shadow-xl rounded-lg p-6 space-y-6"
            >
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    Giriş Yap
                </h2>

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
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="ornek@email.com"
                        aria-describedby={currentState.errors?.email ? "email-error" : undefined}
                    />
                    {currentState.errors?.email && (
                        <p id="email-error" className="text-sm text-red-600" role="alert">
                            {currentState.errors.email[0]}
                        </p>
                    )}
                </div>

                {/* Password Input - Hidden for resend */}
                {!showResendButton && (
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Şifre
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={isPending}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="••••••••"
                            aria-describedby={currentState.errors?.password ? "password-error" : undefined}
                        />
                        {currentState.errors?.password && (
                            <p id="password-error" className="text-sm text-red-600" role="alert">
                                {currentState.errors.password[0]}
                            </p>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                    {showResendButton ? (
                        <ButtonWithSpinner
                            loading={isPending}
                            type="submit"
                            variant="blue"
                            className="w-full"
                        >
                            Yeniden Doğrulama Maili Gönder
                        </ButtonWithSpinner>
                    ) : (
                        <ButtonWithSpinner
                            loading={isPending}
                            type="submit"
                            variant="green"
                            className="w-full"
                        >
                            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </ButtonWithSpinner>
                    )}
                </div>

                {/* Forgot Password Link */}
                {!showResendButton && (
                    <div className="flex justify-between items-center text-sm">
                        <Link
                            href="/account/forgot-password"
                            className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                            prefetch={false}
                        >
                            Şifremi Unuttum?
                        </Link>
                    </div>
                )}

                {/* Messages */}
                {currentState.message && (
                    <div
                        className={`p-4 rounded-lg ${currentState.success
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                        role="alert"
                        aria-live="polite"
                    >
                        <p className="text-sm font-medium">{currentState.message}</p>
                    </div>
                )}

                {/* General Errors */}
                {currentState.errors && !currentState.errors.email && !currentState.errors.password && (
                    <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg" role="alert">
                        <p className="text-sm font-medium">
                            {Object.values(currentState.errors).flat()[0]}
                        </p>
                    </div>
                )}

                {/* Turnstile CAPTCHA */}
                <div className="flex justify-center">
                    <Turnstile ref={turnstileRef} />
                </div>

                {/* Sign Up Link */}
                <div className="text-center text-sm text-gray-600">
                    Hesabınız yok mu?{" "}
                    <Link
                        href="/account/register"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        prefetch={false}
                    >
                        Kayıt Ol
                    </Link>
                </div>
            </form>
        </div>
    );
}