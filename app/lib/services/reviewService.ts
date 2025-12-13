//services/reviewService.ts
'use client';
import { fetchAPI } from '@/app/lib/api/hooks';

import type {
    Review,
    ReviewFilters,
    UpdateReviewStatusRequest
} from '@/app/types/dashboard';

// Review API fonksiyonları
export const reviewService = {
    /** 
     * Tüm yorumları getir (filtrelerle)
     * GET /review
     */
    async getProductReviews(filters?: ReviewFilters): Promise<Review[]> {
        console.log('[reviewService] Getting reviews with filters:', filters);
        const params = new URLSearchParams();
        if (filters?.productId) params.append('productId', filters.productId.toString());
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
        const query = params.toString();
        const endpoint = query ? `reviews?${query}` : 'reviews';
        return await fetchAPI<Review[]>(endpoint);
    },
    /**
     * Yorum durumunu güncelle
     * PUT /review/{id}/status  
     **/
    async updateReviewStatus(id: number, statusUpdate: UpdateReviewStatusRequest): Promise<Review> {
        console.log('[reviewService] Updating review status:', id, statusUpdate);
        return await fetchAPI<Review>(`review/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusUpdate),
        });
    },
}
