// app/lib/services/heroSlideService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type {
    HeroSlide,
    CreateHeroSlideDto,
    UpdateHeroSlideDto
} from '@/app/types/heroSlide';

// Re-export types for convenience
export type { HeroSlide, CreateHeroSlideDto, UpdateHeroSlideDto };

export const heroSlideService = {
    async getAllSlides(): Promise<HeroSlide[]> {
        return await fetchAPI<HeroSlide[]>('hero-slide');
    },

    async getSlideById(id: number): Promise<HeroSlide> {
        return await fetchAPI<HeroSlide>(`hero-slide/${id}`);
    },

    async createSlide(data: CreateHeroSlideDto): Promise<HeroSlide> {
        return await fetchAPI<HeroSlide>('hero-slide', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateSlide(id: number, data: UpdateHeroSlideDto): Promise<HeroSlide> {
        return await fetchAPI<HeroSlide>(`hero-slide/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteSlide(id: number): Promise<void> {
        await fetchAPI(`hero-slide/${id}`, {
            method: 'DELETE',
        });
    },

    async toggleSlideStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        return await fetchAPI<{ message: string; isActive: boolean }>(`hero-slide/${id}/toggle-status`, {
            method: 'PUT',
        });
    },

    async reorderSlides(slides: { id: number; displayOrder: number }[]): Promise<void> {
        await fetchAPI('hero-slide/reorder', {
            method: 'PUT',
            body: JSON.stringify(slides),
        });
    },
};
