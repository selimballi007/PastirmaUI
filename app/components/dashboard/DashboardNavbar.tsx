'use client'

import { useState } from 'react'
import { Menu, Search, Bell, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthActions } from '@/app/lib/hooks'
import { useNotificationStore } from '@/app/lib/store/notificationStore'
import { useOrderHub } from '@/app/lib/hooks/useOrderHub'

interface DashboardNavbarProps {
    setSidebarOpen: (open: boolean) => void
}
export default function DashboardNavbar({ setSidebarOpen }: DashboardNavbarProps) {
    const router = useRouter();
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const { logOut } = useAuthActions();

    // SignalR connection and notification count
    const { isConnected } = useOrderHub();
    const orderCount = useNotificationStore(state => state.orderCount);
    const clear = useNotificationStore(state => state.clear);

    const handleLogout = async () => { await logOut() }

    const handleNotificationClick = () => {
        clear();
        router.push('/dashboard/orders');
    };

    return (
        <>
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search bar */}
                    <div className="flex-1 max-w-2xl mx-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        {/* Connection Status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isConnected
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                            <span>{isConnected ? 'Canlı' : 'Bağlantı Yok'}</span>
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={handleNotificationClick}
                            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {orderCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                    {orderCount > 99 ? '99+' : orderCount}
                                </span>
                            )}
                        </button>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {/* Dropdown menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                    <Link
                                        href="/dashboard/account"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Hesabım
                                    </Link>
                                    <hr className="my-1 border-gray-200" />
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        onClick={handleLogout}
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}