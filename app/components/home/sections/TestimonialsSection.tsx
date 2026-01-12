// components/home/sections/TestimonialsSection.tsx
import Testimonials from '@/app/components/home/Testimonials';
import { getTestimonials, getTestimonialStats } from '@/app/lib/server/homepage';

export default async function TestimonialsSection() {
    const [testimonials, stats] = await Promise.all([
        getTestimonials(),
        getTestimonialStats(),
    ]);
    return <Testimonials testimonials={testimonials} stats={stats} />;
}
