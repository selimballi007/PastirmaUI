// components/home/HeroSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { HeroSlide } from '@/app/lib/server/homepage';

interface HeroSliderProps {
    slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    const heroSlides = slides;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    useEffect(() => {
        if (!isAutoPlay) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlay]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        setIsAutoPlay(false);
    };

    return (
        <section className="relative h-[600px] bg-gray-900 overflow-hidden">
            {heroSlides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ${index === currentSlide
                        ? 'opacity-100 scale-100 pointer-events-auto z-10'
                        : 'opacity-0 scale-105 pointer-events-none z-0'
                    }`}
                >
                    <div className="absolute inset-0">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="100vw"
                        />
                        {slide.bgColor && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-80`} />
                        )}
                    </div>

                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-2xl text-white">
                            {slide.discount && (
                                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                                    <span className="text-sm font-semibold">{slide.discount}</span>
                                </div>
                            )}
                            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl mb-2 text-gray-100">
                                {slide.subtitle}
                            </p>
                            <p className="text-lg mb-8 text-gray-200">
                                {slide.description}
                            </p>
                            <Link
                                href={slide.buttonLink || '#'}
                                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-xl"
                            >
                                {slide.buttonText}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full transition-all z-10"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full transition-all z-10"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentSlide(index);
                            setIsAutoPlay(false);
                        }}
                        className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}