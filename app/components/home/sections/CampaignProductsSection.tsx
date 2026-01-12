// components/home/sections/CampaignProductsSection.tsx
import CampaignProducts from '@/app/components/home/CampaignProducts';
import { getCampaignProducts } from '@/app/lib/server/homepage';

export default async function CampaignProductsSection() {
    const products = await getCampaignProducts();
    return <CampaignProducts products={products} />;
}
