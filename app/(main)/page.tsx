// app/(main)/page.tsx
import HeroSlider from '@/app/components/home/HeroSlider';
import Categories from '@/app/components/home/Categories';
import CampaignProducts from '@/app/components/home/CampaignProducts';
import BestSellers from '@/app/components/home/BestSellers';
import Testimonials from '@/app/components/home/Testimonials';
import BlogPosts from '@/app/components/home/BlogPosts';
import Newsletter from '@/app/components/home/Newsletter';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSlider />
            <Categories />
            <CampaignProducts />
            <BestSellers />
            <Testimonials />
            <BlogPosts />
            <Newsletter />
        </div>
    );
}