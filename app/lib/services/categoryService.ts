// app/lib/services/categoryService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type {
    Category,
    CategoryWithProductCount,
    CreateCategoryDto,
    UpdateCategoryDto,
    ReorderCategoryDto
} from '@/app/types/category';

// Re-export types for convenience
export type { Category, CategoryWithProductCount, CreateCategoryDto, UpdateCategoryDto, ReorderCategoryDto };

export const categoryService = {
    async createCategory(data: CreateCategoryDto): Promise<Category> {
        return await fetchAPI<Category>('category', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
        return await fetchAPI<Category>(`category/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteCategory(id: number): Promise<void> {
        await fetchAPI(`category/${id}`, {
            method: 'DELETE',
        });
    },

    async getCategoryById(id: number): Promise<Category> {
        return await fetchAPI<Category>(`category/${id}`);
    },

    async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
        const params = includeInactive ? '?includeInactive=true' : '';
        return await fetchAPI<Category[]>(`category${params}`);
    },

    async getCategoriesWithProductCount(): Promise<CategoryWithProductCount[]> {
        return await fetchAPI<CategoryWithProductCount[]>('category/with-product-count');
    },

    async reorderCategories(categories: ReorderCategoryDto[]): Promise<void> {
        await fetchAPI('category/reorder', {
            method: 'PUT',
            body: JSON.stringify(categories),
        });
    },

    async toggleCategoryStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        return await fetchAPI<{ message: string; isActive: boolean }>(`category/${id}/toggle-status`, {
            method: 'PUT',
        });
    },
};
