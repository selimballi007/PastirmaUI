"use client";

import { useActionState, useEffect, useRef, useCallback, startTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction, resendVerificationAction, type ActionState } from "@/app/lib/actions/auth";
import ButtonWithSpinner from "@/app/components/ButtonWithSpinner";
import type ReCAPTCHAComponent from "react-google-recaptcha";
import { useAuthStore } from '@/app/lib/store/authStore';

// Lazy load ReCAPTCHA
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

export default function LoginForm() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHAComponent>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const { login } = useAuthStore();

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
        if (loginState?.success && loginState.accessToken && loginState.user) {

            login(loginState.accessToken, loginState.user);

            // ✅ localStorage'ı kontrol et
            setTimeout(() => {
                const state = useAuthStore.getState();
                if (state.accessToken) {
                    // ✅ Role kontrolü
                    if (state.user?.role === 'Admin') {
                        router.push('/dashboard');
                    } else {
                        router.push('/');
                    }
                } else {
                    console.error('❌ LOGINFORM Token not set, not navigating!');
                }
            }, 1500);
        }
    }, [loginState, router, login]);

    // Handle successful resend
    useEffect(() => {
        if (resendState.success) {
            formRef.current?.reset();
        }
    }, [resendState]);

    // Get captcha token
    const getCaptchaToken = useCallback(async (): Promise<string | null> => {
        if (!recaptchaRef.current) return null;

        try {
            const token = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();
            return token;
        } catch (error) {
            return null;
        }
    }, []);

    // Handle login submit
    const handleLoginSubmit = useCallback(async (formData: FormData) => {
        const token = await getCaptchaToken();
        if (!token) return;

        formData.append('captchaToken', token);
        startTransition(() => {
            loginFormAction(formData);
        });
    }, [getCaptchaToken, loginFormAction]);

    // Handle resend submit
    const handleResendSubmit = useCallback(async (formData: FormData) => {
        const token = await getCaptchaToken();
        if (!token) return;

        formData.append('captchaToken', token);
        startTransition(() => {
            resendFormAction(formData);
        });
    }, [getCaptchaToken, resendFormAction]);

    const isPending = isLoginPending || isResendPending;
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

                {/* ReCAPTCHA */}
                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_KEY}
                        size="invisible"
                        ref={recaptchaRef}
                    />
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