// services/dashboardService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type { DashboardResponse, Order, PaginatedResponse } from '@/app/types/dashboard';

// Dashboard API fonksiyonları
export const dashboardService = {
    /**
     * Dashboard ana verilerini getir
     * GET /dashboard
     */
    async getDashboardData(): Promise<DashboardResponse> {
        return await fetchAPI<DashboardResponse>('dashboard');
    },

    /**
     * İstatistikleri getir
     * GET /dashboard/stats
     */
    async getStats() {
        return await fetchAPI('dashboard/stats');
    },

    /**
     * Son siparişleri getir
     * GET /dashboard/orders/recent?limit=10
     */
    async getRecentOrders(limit: number = 10): Promise<Order[]> {
        return await fetchAPI<Order[]>(`dashboard/orders/recent?limit=${limit}`);
    },

    /**
     * Satış verilerini getir
     * GET /dashboard/sales?period=month
     */
    async getSalesData(period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> {
        return await fetchAPI(`dashboard/sales?period=${period}`);
    },

    /**
     * Hızlı istatistikleri getir
     * GET /dashboard/quick-stats
     */
    async getQuickStats() {
        return await fetchAPI('dashboard/quick-stats');
    },

    /**
     * Belirli bir sipariş detayını getir
     * GET /orders/{orderId}
     */
    async getOrderDetails(orderId: string): Promise<Order> {
        return await fetchAPI<Order>(`order/${orderId}`);
    },

    /**
     * Siparişleri filtrele ve sayfalama ile getir
     * GET /orders?page=1&pageSize=10&status=pending
     */
    async getOrders(
        page: number = 1,
        pageSize: number = 10,
        status?: string
    ): Promise<PaginatedResponse<Order>> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            ...(status && { status }),
        });

        return await fetchAPI<PaginatedResponse<Order>>(`order?${params.toString()}`);
    },

    /**
     * Sipariş durumunu güncelle
     * PATCH /orders/{orderId}/status
     */
    async updateOrderStatus(orderId: string, status: string) {
        return await fetchAPI(`order/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    /**
     * Bildirim sayısını getir
     * GET /dashboard/notifications/count
     */
    async getNotificationCount(): Promise<number> {
        const data = await fetchAPI<{ count: number }>('dashboard/notifications/count');
        return data.count;
    },

    /**
     * Düşük stok uyarılarını getir
     * GET /dashboard/alerts/low-stock
     */
    async getLowStockAlerts() {
        return await fetchAPI('dashboard/alerts/low-stock');
    },
};