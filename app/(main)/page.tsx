// app/(main)/page.tsx
import { Suspense } from 'react';
import Newsletter from '@/app/components/home/Newsletter';

// Async section components
import HeroSliderSection from '@/app/components/home/sections/HeroSliderSection';
import CategoriesSection from '@/app/components/home/sections/CategoriesSection';
import CampaignProductsSection from '@/app/components/home/sections/CampaignProductsSection';
import BestSellersSection from '@/app/components/home/sections/BestSellersSection';
import TestimonialsSection from '@/app/components/home/sections/TestimonialsSection';
import BlogPostsSection from '@/app/components/home/sections/BlogPostsSection';

// Skeleton components
import HeroSliderSkeleton from '@/app/components/home/skeletons/HeroSliderSkeleton';
import CategoriesSkeleton from '@/app/components/home/skeletons/CategoriesSkeleton';
import ProductsSkeleton from '@/app/components/home/skeletons/ProductsSkeleton';
import TestimonialsSkeleton from '@/app/components/home/skeletons/TestimonialsSkeleton';
import BlogPostsSkeleton from '@/app/components/home/skeletons/BlogPostsSkeleton';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Slider - Highest priority, loads first */}
            <Suspense fallback={<HeroSliderSkeleton />}>
                <HeroSliderSection />
            </Suspense>

            {/* Categories - Second priority */}
            <Suspense fallback={<CategoriesSkeleton />}>
                <CategoriesSection />
            </Suspense>

            {/* Campaign Products - Third priority */}
            <Suspense fallback={<ProductsSkeleton count={3} bgColor="bg-gradient-to-br from-orange-50 to-amber-50" />}>
                <CampaignProductsSection />
            </Suspense>

            {/* Best Sellers - Fourth priority */}
            <Suspense fallback={<ProductsSkeleton count={4} bgColor="bg-white" />}>
                <BestSellersSection />
            </Suspense>

            {/* Testimonials - Fifth priority */}
            <Suspense fallback={<TestimonialsSkeleton />}>
                <TestimonialsSection />
            </Suspense>

            {/* Blog Posts - Sixth priority */}
            <Suspense fallback={<BlogPostsSkeleton />}>
                <BlogPostsSection />
            </Suspense>

            {/* Newsletter - Static, no loading needed */}
            <Newsletter />
        </div>
    );
}