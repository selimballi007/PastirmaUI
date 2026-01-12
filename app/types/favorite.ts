// types/favorite.ts - Favorite-related type definitions

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
