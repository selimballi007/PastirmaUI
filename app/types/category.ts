// types/category.ts - Category-related type definitions

export interface Category {
    id: number;
    name: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CategoryWithProductCount extends Category {
    productCount: number;
}

export interface CreateCategoryDto {
    name: string;
    icon?: string;
}

export interface UpdateCategoryDto {
    name: string;
    icon?: string;
}

export interface ReorderCategoryDto {
    id: number;
    displayOrder: number;
}
