'use client'

import '../globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Metadata } from 'next'

const metadata: Metadata = {
  title: 'Pastırma Adası',
  description: 'Pastırma Adası - En taze pastırmalar',
  icons: {
    icon: './public/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
