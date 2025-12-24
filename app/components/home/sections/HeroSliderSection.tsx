// components/home/sections/HeroSliderSection.tsx
import HeroSlider from '@/app/components/home/HeroSlider';
import { getHeroSlides } from '@/app/lib/server/homepage';

export default async function HeroSliderSection() {
    const slides = await getHeroSlides();
    return <HeroSlider slides={slides} />;
}
