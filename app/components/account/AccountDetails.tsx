"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutApi } from "@/app/lib/api/auth";
import { logout } from "@/store/slices/authSlice";
import { User } from "@/app/lib/definitions";
import { IoMdExit } from 'react-icons/io'

interface AccountDetailsProps {
    user: User
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
        <div className="flex items-center justify-between mb-6">
            {/* Sol taraf */}
            <div>
                <h1 className="text-3xl font-bold">Hesabım</h1>
                <p className="mt-1 text-gray-700">
                    Hoş geldiniz,{" "}
                    <span className="font-semibold">{user.username}</span>!
                </p>
            </div>

            {/* Sağ taraf */}
            <div className="flex flex-col items-end gap-1">
                <button
                    onClick={handleLogout}
                    aria-label="Çıkış Yap"
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition relative group cursor-pointer"
                >
                    <IoMdExit className="h-6 w-6" />
                    {/* Tooltip */}
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Çıkış Yap
                    </span>
                </button>
                <p className="text-xs text-gray-500">
                    Son giriş:{" "}
                    <span className="font-semibold text-gray-700">
                        {new Date(user.lastLoginAt).toLocaleString("tr-TR", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })}
                    </span>
                </p>
            </div>
        </div>
    );
}
