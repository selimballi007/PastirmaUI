"use client";

import { useState, useRef } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/api/axios";
import ButtonWithSpinner from "../ButtonWithSpinner"

export default function LoginForm() {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        try {
            if (recaptchaRef.current) {
                const captoken = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();

                await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/resend-verification-bye",
                    { Email: email, captchaToken: captoken },
                    { withCredentials: true }
                );

                setMessages(["✅ Yeni doğrulama maili gönderildi. Gelen kutunuzu kontrol edin."]);
                setShowResend(false);
            }
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

        const errs = validate();
        if (errs.length > 0) {
            setMessages(errs);
            return;
        }

        setLoading(true);

        try {
            if (recaptchaRef.current) {
                const captoken = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();

                const res = await api.post("user/login", {
                    Email: email,
                    PasswordHash: password,
                    captchaToken: captoken,
                });
                dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));

                setMessages(["✅ Kayıt başarılı! Giriş yapabilirsiniz."]);
                setEmail("");
                setPassword("");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.data?.errors) {
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
            <form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4 sm:space-y-6"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Giriş Yap</h2>

                {/* Inputs */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showResend ? (
                        <ButtonWithSpinner
                            loading={loading}
                            onClick={handleResend}
                            variant="blue"
                        >
                            Yeniden Doğrulama Maili Gönder
                        </ButtonWithSpinner>
                    ) : (
                        <ButtonWithSpinner loading={loading} type="submit" variant="green">
                            {loading ? "Kaydediliyor..." : "Giriş Yap"}
                        </ButtonWithSpinner>
                    )}
                </div>

                {/* Forgot-Password Link */}
                <div className="flex justify-start mb-2">
                    <Link
                        href="/account/forgot-password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Şifremi Unuttum?
                    </Link>
                </div>

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="mt-4 text-center space-y-1">
                        {messages.map((msg, i) => (
                            <p
                                key={i}
                                className={`text-sm px-3 py-1 rounded ${msg.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {msg}
                            </p>
                        ))}
                    </div>
                )}

                {/* ReCAPTCHA */}
                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        size="invisible"
                        ref={recaptchaRef}
                    />
                </div>
            </form>

        </>
    );
}

