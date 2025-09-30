'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaShoppingCart, FaUser } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdClose } from 'react-icons/io'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [cartTotal, setCartTotal] = useState(0)
    const [cartItemCount, setCartItemCount] = useState(0)

    // Örnek: client-side fetch veya localStorage'dan sepet bilgilerini al
    useEffect(() => {
        const storedTotal = "3"//localStorage.getItem('cartTotal')
        const storedCount = "15"//localStorage.getItem('cartItemCount')
        setCartTotal(storedTotal ? parseFloat(storedTotal) : 0)
        setCartItemCount(storedCount ? parseInt(storedCount) : 0)
    }, [])

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
                        <Link href="/" className="text-gray-700 hover:text-gray-900">Anasayfa</Link>
                        <Link href="/products" className="text-gray-700 hover:text-gray-900">Ürünler</Link>
                        <Link href="/about" className="text-gray-700 hover:text-gray-900">Hakkımızda</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-gray-900">İletişim</Link>
                    </div>

                    {/* Sağ üst alan */}
                    <div className="flex items-center space-x-4">
                        {/* Sepet toplam */}
                        <span className="hidden md:inline text-gray-800 font-medium">
                            {cartTotal.toFixed(2)}₺
                        </span>

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

                        {/* Kullanıcı simgesi */}
                        <Link href="/account" aria-label="User Account">
                            <FaUser className="h-6 w-6 text-gray-700 hover:text-gray-900" />
                        </Link>

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
                    <div className="md:hidden mt-2 space-y-2">
                        <Link href="/" className="block text-gray-700 hover:text-gray-900">Anasayfa</Link>
                        <Link href="/products" className="block text-gray-700 hover:text-gray-900">Ürünler</Link>
                        <Link href="/about" className="block text-gray-700 hover:text-gray-900">Hakkımızda</Link>
                        <Link href="/contact" className="block text-gray-700 hover:text-gray-900">İletişim</Link>
                        {/* Mobilde sepet toplam + badge */}
                        <div className="relative">
                            <span className="block text-gray-800 font-medium">{cartTotal.toFixed(2)}₺</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
