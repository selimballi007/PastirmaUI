import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

// Site configuration from environment variables
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Pastırma'
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Türkiye\'nin en kaliteli pastırma ve şarküteri ürünlerini keşfedin. Hızlı teslimat, güvenli alışveriş.'
const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE_URL || `${siteUrl}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} - En Taze Pastırmalar`,
  description: siteDescription,
  keywords: ['pastırma', 'şarküteri', 'sucuk', 'et ürünleri', 'online market'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: siteName,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} Tanıtım Görseli`,
      },
    ],
    title: `${siteName} - En Taze Pastırmalar`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - En Taze Pastırmalar`,
    description: siteDescription,
    images: [ogImageUrl],
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
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: siteDescription,
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
