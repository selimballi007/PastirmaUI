// types/heroSlide.ts - Hero slide-related type definitions

export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    discount: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateHeroSlideDto {
    title: string;
    subtitle?: string;
    description?: string;
    discount?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
}

export interface UpdateHeroSlideDto {
    title: string;
    subtitle?: string;
    description?: string;
    discount?: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor: string;
}
