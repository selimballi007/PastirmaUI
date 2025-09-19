"use client";

import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: string[] = [];

    // Email kontrolü
    if (!email) {
      errs.push("Email boş olamaz.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.push("Geçerli bir email giriniz.");
    }

    // Şifre kontrolü
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
      const res = await axios.post("http://localhost:5296/api/user/register", {
        Email: email,
        PasswordHash: password,
      });

      setMessages(["✅ Kayıt başarılı! Giriş yapabilirsiniz."]);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      if (err.response && err.response.data.errors) {
        const backendErrs = Object.values(err.response.data.errors).flat() as string[];
        setMessages(backendErrs);
      } else {
        setMessages([err.response?.data || "❌ Bir hata oluştu."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Kayıt Ol</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded-md ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
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
    </main>
  );
}
