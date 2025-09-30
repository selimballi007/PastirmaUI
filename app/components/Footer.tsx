'use client'

import Link from 'next/link'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-200 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Sol: Şirket bilgisi / slogan */}
                <div>
                    <h3 className="text-xl font-bold mb-2">Pastırma Adası</h3>
                    <p className="text-gray-400">
                        Delicious food delivered straight to your door.
                    </p>
                </div>

                {/* Orta: Hızlı linkler */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
                    <ul>
                        <li><Link href="/" className="hover:text-white">Anasayfa</Link></li>
                        <li><Link href="/products" className="hover:text-white">Ürünler</Link></li>
                        <li><Link href="/about" className="hover:text-white">Hakkımızda</Link></li>
                        <li><Link href="/contact" className="hover:text-white">İletişim</Link></li>
                    </ul>
                </div>

                {/* Sağ: Sosyal medya */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
                    <div className="flex space-x-4">
                        <a href="#" aria-label="Facebook" className="hover:text-white">
                            <FaFacebook className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Instagram" className="hover:text-white">
                            <FaInstagram className="h-6 w-6" />
                        </a>
                        <a href="#" aria-label="Twitter" className="hover:text-white">
                            <FaTwitter className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Alt not */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Pastırma Adası. All rights reserved.
            </div>
        </footer>
    )
}
