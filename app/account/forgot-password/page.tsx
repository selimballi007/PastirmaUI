"use client";

import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessages([]);

        if (!email) {
            setMessages(["Email zorunludur"]);
            return;
        }
        if (!captchaToken) {
            setMessages(["Lütfen Captcha doğrulayın"]);
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}user/forgot-password`, {
                email,
                captchaToken,
            });

            setMessages(["✅ Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama linki gönderildi."]);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setMessages([err.response?.data?.message || "❌ Bir hata oluştu."]);
            } else {
                setMessages(["❌ Beklenmeyen bir hata oluştu."]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-4 border rounded">
            <h2 className="text-xl mb-4 font-bold">Şifremi Unuttum</h2>

            <input
                type="email"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
                required
            />

            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => setCaptchaToken(token)}
            />

            <button
                type="submit"
                disabled={loading}
                className={`w-full text-white px-4 py-2 mt-3 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
                    }`}
            >
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
            </button>

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
    );
}
