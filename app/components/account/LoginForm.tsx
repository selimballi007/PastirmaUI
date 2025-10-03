"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/api/axios";

export default function LoginForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [showResend, setShowResend] = useState(false);

    const validate = () => {
        const errs: string[] = [];

        if (!email) errs.push("Email boş olamaz.");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errs.push("Geçerli bir email giriniz.");

        if (!password) errs.push("Şifre boş olamaz.");
        else if (password.length < 6) errs.push("Şifre en az 6 karakter olmalı.");

        return errs;
    };

    const handleResend = async () => {
        const resendErrors: string[] = [];

        if (!email)
            resendErrors.push("Email boş olamaz.");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            resendErrors.push("Geçerli bir email giriniz.");

        if (resendErrors.length > 0) {
            setMessages(resendErrors);
            return;
        }

        if (!captchaToken) return;

        setLoading(true);
        try {
            await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/resend-verification-bye",
                { email, captchaToken },
                { withCredentials: true }
            );

            setMessages(["✅ Yeni doğrulama maili gönderildi. Gelen kutunuzu kontrol edin."]);
            setShowResend(false);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setMessages(err.response?.data?.message || "❌ Mail gönderilemedi.");
            } else {
                setMessages(["❌ Beklenmeyen bir hata oluştu."]);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessages([]);

        if (!captchaToken) {
            setMessages(["Lütfen captcha'yı tamamlayın."]);
            return;
        }

        const errs = validate();
        if (errs.length > 0) {
            setMessages(errs);
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("user/login", {
                Email: email,
                PasswordHash: password,
                CaptchaToken: captchaToken,
            });
            dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));

            setMessages(["✅ Kayıt başarılı! Giriş yapabilirsiniz."]);
            setEmail("");
            setPassword("");
            setCaptchaToken("");
            // captcha reset
            // @ts-expect-error - We add a custom property to the window object
            if (window.grecaptcha) window.grecaptcha.reset();
            router.push('/');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.data?.errors) {
                    console.log(err.response);
                    const backendErrs = Object.values(err.response.data.errors).flat() as string[];
                    if (err.response.status === 504) {
                        setShowResend(true);
                    }
                    setMessages(backendErrs);
                } else {
                    setMessages([err.response?.data?.message || "❌ Bir hata oluştu."]);
                }
            } else {
                setMessages(["❌ Beklenmeyen bir hata oluştu."]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

                <div className="flex justify-end mb-3">
                    <Link
                        href="/account/forgot-password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Şifremi Unuttum?
                    </Link>
                </div>

                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(value) => setCaptchaToken(value)}
                />
                {showResend && (
                    <button
                        onClick={handleResend}
                        disabled={loading || !captchaToken}
                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Yeniden Doğrulama Maili Gönder
                    </button>
                )}

                {!showResend && (<button
                    type="submit"
                    disabled={loading}
                    className={`text-white px-4 py-2 rounded ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-700"
                        }`}
                >
                    {loading ? "Kaydediliyor..." : "Giriş Yap"}
                </button>
                )}

                {messages.length > 0 && (
                    <div className="mt-2 text-sm text-center">
                        {messages.map((msg, i) => (
                            <p
                                key={i}
                                className={msg.startsWith("✅") ? "text-green-600" : "text-red-600"}
                            >
                                {msg}
                            </p>
                        ))}
                    </div>
                )}
            </form>
        </>
    );
}

