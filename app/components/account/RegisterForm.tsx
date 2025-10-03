"use client";

import { useState, useRef } from "react";
import axios from "axios";
import ButtonWithSpinner from "../ButtonWithSpinner"
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterForm() {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs: string[] = [];

        // Email Control
        if (!email) {
            errs.push("Email boş olamaz.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errs.push("Geçerli bir email giriniz.");
        }

        // UserName Control
        if (!username) {
            errs.push("Kullanıcı adı boş olamaz.");
        } else if (username.length < 3) {
            errs.push("Kullanıcı adı en az 3 karakter olmalı.");
        }

        // Password Control
        if (!password) {
            errs.push("Şifre boş olamaz.");
        } else if (password.length < 6) {
            errs.push("Şifre en az 6 karakter olmalı.");
        }

        return errs;
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

                await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/register", {
                    Email: email,
                    UserName: username,
                    PasswordHash: password,
                    captchaToken: captoken
                });

                setMessages(["✅ Hesabınızı email adresinize gönderilen linkten aktifleştirebilirsiniz. Gelen klasöründe yoksa Spam klasörünü kontrol ediniz."]);
                setEmail("");
                setUserName("");
                setPassword("");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.data?.errors) {
                    const errorArray = Object.values(err.response.data.errors).flat() as string[];
                    setMessages(errorArray);
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
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Kayıt Ol</h2>

                {/* Inputlar */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                    />

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
                        placeholder="Parola"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                    />
                </div>

                {/* Information */}
                <p className="text-sm text-gray-700">
                    Hesap oluşturmanız için e-posta adresinize bir bağlantı gönderilecek.
                    Gönderiler klasöründe bulamazsanız Spam klasörünü kontrol ediniz.<br />
                    Kişisel verileriniz, bu web sitesindeki deneyiminizi desteklemek, hesabınıza erişimi yönetmek ve
                    aşağıda açıklanan diğer amaçlar için kullanılacaktır.{" "}
                    <span className="underline cursor-pointer">Gizlilik İlkesi</span>.
                </p>

                {/* Register Button */}
                <ButtonWithSpinner
                    loading={loading}
                    type="submit"
                    variant="green"
                >
                    {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </ButtonWithSpinner>

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
