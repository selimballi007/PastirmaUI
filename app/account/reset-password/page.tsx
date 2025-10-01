"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

export default function ResetPasswordPage() {
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setToken(urlParams.get("token"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!newPassword || newPassword.length < 6) {
            setMessage("❌ Şifre en az 6 karakter olmalı");
            return;
        }
        if (!captchaToken) {
            setMessage("❌ Captcha doğrulanmadı");
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}user/reset-password`, {
                token,
                newPassword,
                captchaToken,
            });

            setMessage("✅ Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.");
            setNewPassword("");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setMessage(err.response?.data?.message || "❌ Şifre güncellenemedi.");
            } else {
                setMessage("❌ Beklenmeyen bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-4 border rounded">
            <h2 className="text-xl mb-4 font-bold">Yeni Şifre Belirle</h2>

            <input
                type="password"
                placeholder="Yeni şifre"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                className={`w-full text-white px-4 py-2 mt-3 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
                    }`}
            >
                {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </button>

            {message && (
                <div className="mt-2 text-sm text-center">
                    <p className={message.startsWith("✅") ? "text-green-600" : "text-red-600"}>
                        {message}
                    </p>
                </div>
            )}
        </form>
    );
}
