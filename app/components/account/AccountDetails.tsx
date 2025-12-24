"use client";
import { useRouter } from "next/navigation";
import { IoMdExit } from 'react-icons/io'
import { useAuthStore } from '@/app/lib/store/authStore';
import { useAuthActions } from '@/app/lib/hooks';

export default function AccountDetails() {
    const router = useRouter();
    const { logOut } = useAuthActions();

    const handleLogout = async () => {
        try {
            // ✅ Proper logout with server cleanup
            await logOut();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const user = useAuthStore((state) => state.user);

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Sol taraf */}
            <div>
                <h1 className="text-3xl font-bold">Hesabım</h1>
                <p className="mt-1 text-gray-700">
                    Hoş geldiniz,{" "}
                    <span className="font-semibold">{user?.username}</span>!
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
            </div>
        </div>
    );
}
