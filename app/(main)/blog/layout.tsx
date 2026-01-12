import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Pastırma',
  description: 'Pastırma blog yazılarını keşfedin. Et ürünleri, tarifler, sağlıklı beslenme ve daha fazlası hakkında bilgi edinin.',
  openGraph: {
    title: 'Blog - Pastırma',
    description: 'Pastırma blog yazılarını keşfedin. Et ürünleri, tarifler ve sağlıklı beslenme hakkında bilgi edinin.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Pastırma',
    description: 'Pastırma blog yazılarını keşfedin. Et ürünleri, tarifler ve sağlıklı beslenme hakkında bilgi edinin.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
