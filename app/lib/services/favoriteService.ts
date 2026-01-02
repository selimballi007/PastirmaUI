// app/lib/services/favoriteService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type { FavoriteProduct } from '@/app/types/favorite';

// Re-export types for convenience
export type { FavoriteProduct };

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
