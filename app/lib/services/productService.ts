// services/productService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductFilters
} from '@/app/types/dashboard';

// Product API fonksiyonları
export const productService = {
    /**
     * Tüm ürünleri getir (filtrelerle)
     * GET /product
     */
    async getProducts(filters?: ProductFilters): Promise<Product[]> {

        const params = new URLSearchParams();

        if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
        if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.isBestSeller !== undefined) params.append('isBestSeller', filters.isBestSeller.toString());
        if (filters?.isCampaign !== undefined) params.append('isCampaign', filters.isCampaign.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const query = params.toString();
        const endpoint = query ? `product?${query}` : 'product';

        return await fetchAPI<Product[]>(endpoint);
    },

    /**
     * Belirli bir ürünü getir
     * GET /product/{id}
     */
    async getProductById(id: number, includeImages: boolean = true): Promise<Product> {
        const params = includeImages ? '?includeImages=true' : '?includeImages=false';
        return await fetchAPI<Product>(`product/${id}${params}`);
    },

    /**
     * Yeni ürün oluştur
     * POST /product
     */
    async createProduct(product: CreateProductRequest): Promise<Product> {
        return await fetchAPI<Product>('product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
    },

    /**
     * Ürünü güncelle
     * PUT /product/{id}
     */
    async updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
        return await fetchAPI<Product>(`product/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product),
        });
    },

    /**
     * Ürünü sil
     * DELETE /product/{id}
     */
    async deleteProduct(id: number): Promise<void> {
        await fetchAPI<void>(`product/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Ürün durumunu güncelle (aktif/pasif)
     * PATCH /product/{id}/status
     */
    async updateProductStatus(id: number, isActive: boolean): Promise<void> {
        await fetchAPI<void>(`product/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        });
    },

    /**
     * Ürün stoğunu güncelle
     * PATCH /product/{id}/stock
     */
    async updateProductStock(id: string, stock: number): Promise<void> {
        await fetchAPI<void>(`product/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ stock }),
        });
    },

    /**
     * Kategorileri getir
     * GET /product/categories
     */
    async getCategories(): Promise<string[]> {
        return await fetchAPI<string[]>('product/categories');
    },
};