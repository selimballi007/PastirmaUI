// components/home/sections/BestSellersSection.tsx
import BestSellers from '@/app/components/home/BestSellers';
import { getBestSellers } from '@/app/lib/server/homepage';

export default async function BestSellersSection() {
    const products = await getBestSellers();
    return <BestSellers products={products} />;
}
