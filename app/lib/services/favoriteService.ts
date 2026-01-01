// app/lib/services/favoriteService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';

export interface FavoriteProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    oldPrice?: number;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    isCampaign: boolean;
    isBestSeller: boolean;
    isNew: boolean;
    isActive: boolean;
    createdAt: string;
}

export const favoriteService = {
    async addToFavorites(productId: number): Promise<void> {
        await fetchAPI(`favorite/${productId}`, {
            method: 'POST'
        });
    },

    async removeFromFavorites(productId: number): Promise<void> {
        await fetchAPI(`favorite/${productId}`, {
            method: 'DELETE'
        });
    },

    async isFavorite(productId: number): Promise<boolean> {
        const response = await fetchAPI<{ isFavorite: boolean }>(`favorite/check/${productId}`);
        return response.isFavorite;
    },

    async getUserFavorites(): Promise<FavoriteProduct[]> {
        return await fetchAPI<FavoriteProduct[]>('favorite');
    },

    async getFavoriteCount(): Promise<number> {
        const response = await fetchAPI<{ count: number }>('favorite/count');
        return response.count;
    }
};
