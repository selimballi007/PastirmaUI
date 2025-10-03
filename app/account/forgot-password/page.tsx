"use client";

import { useState, useRef } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import ButtonWithSpinner from "../../components/ButtonWithSpinner"

export default function ForgotPasswordPage() {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [email, setEmail] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessages([]);

        if (!email) {
            setMessages(["Email zorunludur"]);
            return;
        }

        setLoading(true);

        try {
            if (recaptchaRef.current) {
                const captoken = await recaptchaRef.current.executeAsync();
                recaptchaRef.current.reset();

                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}user/forgot-password`, {
                    Email: email,
                    captchaToken: captoken
                });

                setMessages(["✅ Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama linki gönderildi."]);
            }
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

            <ButtonWithSpinner loading={loading} type="submit" variant="green">
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
            </ButtonWithSpinner>

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

            {/* ReCAPTCHA */}
            <div className="flex justify-center">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    size="invisible"
                    ref={recaptchaRef}
                />
            </div>
        </form>
    );
}
