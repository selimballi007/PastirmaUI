"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import ButtonWithSpinner from "../../components/ButtonWithSpinner"

export default function VerifyEmailPage() {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showResend, setShowResend] = useState(false);

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

            try {
                if (recaptchaRef.current) {
                    const captoken = await recaptchaRef.current.executeAsync();
                    recaptchaRef.current.reset();

                    await axios.post(
                        process.env.NEXT_PUBLIC_API_URL + "user/verify-email", {
                        Token: token,
                        captchaToken: captoken,
                    });

                    setMessage("✅ Email adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.");
                    setShowResend(false);
                }
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
    }, [token]);

    const handleResend = async () => {
        if (!token) return;

        setLoading(true);
        try {
            if (recaptchaRef.current) {
                const captoken = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();

                await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/resend-verification-byt", {
                    Token: token,
                    captchaToken: captoken
                });

                setMessage("📩 Yeni doğrulama maili gönderildi. Gelen kutunuzu kontrol edin.");
                setShowResend(false);
            }
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
                <ButtonWithSpinner loading={loading} onClick={handleResend} variant="green">
                    Yeniden Doğrulama Maili Gönder
                </ButtonWithSpinner>
            )}

            {/* ReCAPTCHA */}
            <div className="flex justify-center">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    size="invisible"
                    ref={recaptchaRef}
                />
            </div>
        </div>
    );
}
