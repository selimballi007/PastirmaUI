import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pastırma',
  description: 'Pastırma - En taze pastırmalar',
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
