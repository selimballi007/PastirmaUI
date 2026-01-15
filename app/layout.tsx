import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastırma - En Taze Pastırmalar',
  description: 'Pastırma - Türkiye\'nin en kaliteli pastırma ve şarküteri ürünlerini keşfedin. Hızlı teslimat, güvenli alışveriş.',
  keywords: ['pastırma', 'şarküteri', 'sucuk', 'et ürünleri', 'online market'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Pastırma',
    title: 'Pastırma - En Taze Pastırmalar',
    description: 'Türkiye\'nin en kaliteli pastırma ve şarküteri ürünlerini keşfedin.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pastırma - En Taze Pastırmalar',
    description: 'Türkiye\'nin en kaliteli pastırma ve şarküteri ürünlerini keşfedin.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization Schema for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pastırma',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    description: 'Türkiye\'nin en kaliteli pastırma ve şarküteri ürünleri',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'Turkish',
    },
    sameAs: [
      // Add your social media URLs here when available
      // 'https://www.facebook.com/pastirma',
      // 'https://www.instagram.com/pastirma',
      // 'https://twitter.com/pastirma'
    ],
  };

  return (
    <html lang="tr">
      <body>
        {/* Organization Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
