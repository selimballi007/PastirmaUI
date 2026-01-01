'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaShoppingCart, FaUser, FaUserCircle } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdClose } from 'react-icons/io'
import { MdLogout, MdDashboard } from 'react-icons/md'
import { useAuthStore } from '@/app/lib/store/authStore'
import { Heart } from 'lucide-react'
import { useFavoriteStore } from '@/app/lib/store/favoriteStore'
import { useCartStore } from '@/app/lib/store/cartStore'
import { useAuthActions } from '@/app/lib/hooks'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    // ✅ Hydration hatası için mounted state
    const [mounted, setMounted] = useState(false)

    // ✅ Auth store'dan user bilgisini al
    const user = useAuthStore((state) => state.user)
    const { logOut } = useAuthActions();
    const pathname = usePathname()

    const favoriteCount = useFavoriteStore((state) => state.favoriteCount)

    // ✅ Cart store'dan sepet bilgilerini al
    const cartItemCount = useCartStore((state) => state.getTotalItems())
    const cartTotal = useCartStore((state) => state.getTotalPrice())

    // ✅ Determine account URL based on user role
    const accountUrl = user?.role === 'Admin' ? '/dashboard' : '/account'

    // ✅ Component mount olduğunda set et
    useEffect(() => {
        setMounted(true)
    }, [])

    // ✅ Logout işlemi
    const handleLogout = async () => { await logOut() }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Firma adı */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <span className="text-2xl font-bold text-gray-800">Pastırma Adası</span>
                        </Link>
                    </div>

                    {/* Desktop menü (sağa yaslı) */}
                    <div className="hidden md:flex flex-1 justify-end space-x-6 mr-10">
                        <Link href="/products" className="text-gray-700 hover:text-gray-900">Ürünler</Link>
                        <Link href="/about" className="text-gray-700 hover:text-gray-900">Hakkımızda</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-gray-900">İletişim</Link>
                    </div>

                    {/* Sağ üst alan */}
                    <div className="flex items-center space-x-4">
                        {/* Favori ikonu + badge */}
                        <div className="relative">
                            <Link href="/favorites" className="relative">
                                <Heart className="w-6 h-6" />
                                {favoriteCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {favoriteCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Sepet ikonu + badge */}
                        <div className="relative">
                            <Link href="/cart" aria-label="Shopping Cart">
                                <FaShoppingCart className="h-6 w-6 text-gray-700 hover:text-gray-900" />
                            </Link>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </div>

                        {/* ✅ Kullanıcı bölümü - Hydration tamamlanana kadar placeholder göster */}
                        <div className="relative">
                            {!mounted ? (
                                // ✅ Hydration sırasında placeholder (SSR ile eşleşir)
                                <div className="flex items-center space-x-2 text-gray-700">
                                    <FaUser className="h-6 w-6" />
                                    <span className="hidden md:inline text-sm font-medium">
                                        Giriş Yap
                                    </span>
                                </div>
                            ) : user ? (
                                <>
                                    {/* Logged in kullanıcı */}
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                                        aria-label="User Menu"
                                    >
                                        <FaUserCircle className="h-6 w-6" />
                                        <span className="hidden md:inline text-sm font-medium">
                                            {user.username}
                                        </span>
                                    </button>

                                    {/* Dropdown menü */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>

                                            <Link
                                                href={accountUrl}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <MdDashboard className="mr-2 h-4 w-4" />
                                                Hesabım
                                            </Link>

                                            <Link
                                                href="/orders"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <FaShoppingCart className="mr-2 h-4 w-4" />
                                                Siparişlerim
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                <MdLogout className="mr-2 h-4 w-4" />
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Guest kullanıcı */}
                                    <Link
                                        href="/account/login"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                                        aria-label="Login"
                                    >
                                        <FaUser className="h-6 w-6" />
                                        <span className="hidden md:inline text-sm font-medium">
                                            Giriş Yap
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden text-gray-700 hover:text-gray-900"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <IoMdClose className="h-6 w-6" /> : <GiHamburgerMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menü */}
                {isMenuOpen && (
                    <div className="md:hidden mt-2 space-y-2 pb-4">
                        <Link
                            href="/products"
                            className="block text-gray-700 hover:text-gray-900 py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Ürünler
                        </Link>
                        <Link
                            href="/about"
                            className="block text-gray-700 hover:text-gray-900 py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hakkımızda
                        </Link>
                        <Link
                            href="/contact"
                            className="block text-gray-700 hover:text-gray-900 py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            İletişim
                        </Link>

                        {/* Mobilde sepet toplam */}
                        <div className="py-2">
                            <span className="block text-gray-800 font-medium">
                                Sepet: {cartTotal.toFixed(2)}₺ ({cartItemCount} ürün)
                            </span>
                        </div>

                        {/* ✅ Mobile kullanıcı menüsü - mounted kontrolü ile */}
                        {mounted && (
                            user ? (
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="px-2 py-2">
                                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <Link
                                        href={accountUrl}
                                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Hesabım
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Siparişlerim
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-2 py-2 text-red-600 hover:bg-gray-100 rounded"
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-gray-200 pt-2">
                                    <Link
                                        href="/account/login"
                                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Giriş Yap
                                    </Link>
                                    <Link
                                        href="/account/register"
                                        className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Kayıt Ol
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* ✅ Dropdown menü dışına tıklandığında kapat */}
            {isUserMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                />
            )}
        </nav>
    )
}