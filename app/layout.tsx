'use client'

import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Metadata } from 'next'
import { Provider } from "react-redux"
import { store } from "@/store"

const metadata: Metadata = {
  title: 'Pastırma Adası',
  description: 'Pastırma Adası - En taze pastırmalar',
  icons: {
    icon: './public/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Provider store={store}>
          {/* Navbar appears on all pages */}
          <Navbar />

          {/* Page-specific content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer appears on all pages */}
          <Footer />
        </Provider>
      </body>
    </html>
  )
}
