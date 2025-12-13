// app/lib/services/categoryService.ts
'use client';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/';

class CategoryService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async createCategory(data: CreateCategoryDto): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategori oluşturulurken bir hata oluştu');
        }

        return response.json();
    }

    async updateCategory(id: number, data: UpdateCategoryDto): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategori güncellenirken bir hata oluştu');
        }

        return response.json();
    }

    async deleteCategory(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategori silinirken bir hata oluştu');
        }
    }

    async getCategoryById(id: number): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategori bulunamadı');
        }

        return response.json();
    }

    async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
        const url = `${API_BASE_URL}/categories${includeInactive ? '?includeInactive=true' : ''}`;

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategoriler yüklenirken bir hata oluştu');
        }

        return response.json();
    }

    async getCategoriesWithProductCount(): Promise<CategoryWithProductCount[]> {
        const response = await fetch(`${API_BASE_URL}/categories/with-product-count`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Kategoriler yüklenirken bir hata oluştu');
        }

        return response.json();
    }

    async reorderCategories(categories: ReorderCategoryDto[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/categories/reorder`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(categories),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Sıralama güncellenirken bir hata oluştu');
        }
    }

    async toggleCategoryStatus(id: number): Promise<{ message: string; isActive: boolean }> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}/toggle-status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Durum değiştirilirken bir hata oluştu');
        }

        return response.json();
    }
}

export const categoryService = new CategoryService();