import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastırma Adası',
  description: 'Pastırma Adası - En taze pastırmalar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
