"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutApi } from "@/app/lib/api/auth";
import { logout } from "@/store/slices/authSlice"; // auth slice’ından logout action
//import { AccountDetailsProps } from "./types"; // kendi props tipini burada tuttuğunu varsayıyorum

interface AccountDetailsProps {
    user: { name: string }
}

export default function AccountDetails({ user }: AccountDetailsProps) {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logoutApi();
            dispatch(logout());
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-4">Hesabım</h1>
                <p>
                    Hoş geldiniz, <span className="font-semibold">{user.name}</span>!
                </p>
            </div>

            <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
                Çıkış Yap
            </button>
        </div>
    );
}
