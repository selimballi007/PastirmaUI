import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim - Pastırma',
  description: 'Pastırma ile iletişime geçin. Sorularınız, önerileriniz veya siparişlerinizle ilgili bizimle iletişime geçebilirsiniz.',
  openGraph: {
    title: 'İletişim - Pastırma',
    description: 'Pastırma ile iletişime geçin. Sorularınız için bizimle iletişime geçebilirsiniz.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'İletişim - Pastırma',
    description: 'Pastırma ile iletişime geçin. Sorularınız için bizimle iletişime geçebilirsiniz.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
