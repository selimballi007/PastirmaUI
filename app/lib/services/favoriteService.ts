// app/lib/services/favoriteService.ts
import { fetchAPI } from '@/app/lib/api/hooks'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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
        const response = await fetchAPI(`${API_BASE_URL}/favorite/${productId}`, {
            method: 'POST'
        });
    },

    async removeFromFavorites(productId: number): Promise<void> {
        const response = await fetchAPI(`${API_BASE_URL}/favorite/${productId}`, {
            method: 'DELETE'
        });
    },

    async isFavorite(productId: number): Promise<boolean> {

        const response = await fetchAPI<{ isFavorite: boolean }>(`${API_BASE_URL}/favorite/check/${productId}`);
        return response.isFavorite;

    },

    async getUserFavorites(): Promise<FavoriteProduct[]> {
        return await fetchAPI<FavoriteProduct[]>(`${API_BASE_URL}/favorite`);
    },

    async getFavoriteCount(): Promise<number> {
        const response = await fetchAPI<{ count: number }>(`${API_BASE_URL}/favorite/count`);
        return response.count;
    }
}
