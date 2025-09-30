"use client";

import { useState } from "react";
import axios from "axios";

export default function RegisterForm() {
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
            await axios.post(process.env.NEXT_PUBLIC_API_URL + "user/register", {
                Email: email,
                UserName: username,
                PasswordHash: password,
            });

            setMessages(["✅ Hesabınızı email adresinize gönderilen linkten aktifleştirebilirsiniz. Gelen klasöründe yoksa Spam klasörünü kontrol ediniz."]);
            setEmail("");
            setUserName("");
            setPassword("");
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
            >
                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

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
                    placeholder="Parola"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-3 p-2 border rounded"
                    required
                />

                {/* Kullanıcıya bilgilendirme mesajı */}
                <p className="mb-4 text-sm text-gray-700">
                    Hesap oluşturmanız için e-posta adresinize bir bağlantı gönderilecek.
                    Gönderiler klasöründe bulamazsanız Spam klasörünü kontrol ediniz.<br />
                    Kişisel verileriniz, bu web sitesindeki deneyiminizi desteklemek, hesabınıza erişimi yönetmek ve
                    aşağıda açıklanan diğer amaçlar için kullanılacaktır. <span className="underline">Gizlilik İlkesi</span>.
                </p>

                <button
                    type="submit"
                    disabled={loading}
                    className={`text-white px-4 py-2 rounded ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-700"
                        }`}
                >
                    {loading ? "Kaydediliyor..." : "Kayıt Ol"}
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
        </>
    );
}
