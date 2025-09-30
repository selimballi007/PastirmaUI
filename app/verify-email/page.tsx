"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

export default function VerifyEmailPage() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showResend, setShowResend] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const token =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("token")
            : null;

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setMessage("❌ Doğrulama yapılamadı.");
                setLoading(false);
                return;
            }

            if (!captchaToken) {
                setLoading(false);
                return;
            }

            try {
                await axios.post(
                    process.env.NEXT_PUBLIC_API_URL + "user/verify-email", {
                    token,
                    captchaToken,
                });

                setMessage("✅ Email adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.");
                setShowResend(false);
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setMessage(err.response?.data?.message || "❌ Doğrulama başarısız oldu.");

                    if (err.response?.data?.message?.includes("süresi dolmuş")) {
                        setShowResend(true);
                    }
                } else {
                    setMessage("❌ Beklenmeyen bir hata oluştu.");
                }
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token, captchaToken]);

    const handleResend = async () => {
        if (!token || !captchaToken) return;

        setLoading(true);
        try {
            await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/resend-verification-byt", {
                token,
                captchaToken,
            });

            setMessage("📩 Yeni doğrulama maili gönderildi. Gelen kutunuzu kontrol edin.");
            setShowResend(false);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setMessage(err.response?.data?.message || "❌ Mail gönderilemedi.");
            } else {
                setMessage("❌ Beklenmeyen bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 border rounded mt-10 shadow">
            <h1 className="text-xl font-bold mb-4">E-posta Doğrulama</h1>

            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(value) => setCaptchaToken(value)}
            />

            {loading ? (
                <p className="text-gray-500 mt-4">Yükleniyor...</p>
            ) : (
                <p
                    className={`mt-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {message}
                </p>
            )}

            {showResend && (
                <button
                    onClick={handleResend}
                    disabled={loading || !captchaToken}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Yeniden Doğrulama Maili Gönder
                </button>
            )}
        </div>
    );
}
