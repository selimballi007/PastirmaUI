// services/dashboardService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/hooks';
import type { DashboardResponse, Order, PaginatedResponse } from '@/app/types/dashboard';

// Dashboard API fonksiyonları
export const dashboardService = {
    /**
     * Dashboard ana verilerini getir
     * GET /dashboard
     */
    async getDashboardData(): Promise<DashboardResponse> {
        console.log('[dashboardService] Getting dashboard data');
        return await fetchAPI<DashboardResponse>('dashboard');
    },

    /**
     * İstatistikleri getir
     * GET /dashboard/stats
     */
    async getStats() {
        console.log('[dashboardService] Getting stats');
        return await fetchAPI('dashboard/stats');
    },

    /**
     * Son siparişleri getir
     * GET /dashboard/orders/recent?limit=10
     */
    async getRecentOrders(limit: number = 10): Promise<Order[]> {
        console.log('[dashboardService] Getting recent orders, limit:', limit);
        return await fetchAPI<Order[]>(`dashboard/orders/recent?limit=${limit}`);
    },

    /**
     * Satış verilerini getir
     * GET /dashboard/sales?period=month
     */
    async getSalesData(period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> {
        console.log('[dashboardService] Getting sales data, period:', period);
        return await fetchAPI(`dashboard/sales?period=${period}`);
    },

    /**
     * Hızlı istatistikleri getir
     * GET /dashboard/quick-stats
     */
    async getQuickStats() {
        console.log('[dashboardService] Getting quick stats');
        return await fetchAPI('dashboard/quick-stats');
    },

    /**
     * Belirli bir sipariş detayını getir
     * GET /orders/{orderId}
     */
    async getOrderDetails(orderId: string): Promise<Order> {
        console.log('[dashboardService] Getting order details, id:', orderId);
        return await fetchAPI<Order>(`orders/${orderId}`);
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

        console.log('[dashboardService] Getting orders with params:', params.toString());
        return await fetchAPI<PaginatedResponse<Order>>(`orders?${params.toString()}`);
    },

    /**
     * Sipariş durumunu güncelle
     * PATCH /orders/{orderId}/status
     */
    async updateOrderStatus(orderId: string, status: string) {
        console.log('[dashboardService] Updating order status:', orderId, status);
        return await fetchAPI(`orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    /**
     * Bildirim sayısını getir
     * GET /dashboard/notifications/count
     */
    async getNotificationCount(): Promise<number> {
        console.log('[dashboardService] Getting notification count');
        const data = await fetchAPI<{ count: number }>('dashboard/notifications/count');
        return data.count;
    },

    /**
     * Düşük stok uyarılarını getir
     * GET /dashboard/alerts/low-stock
     */
    async getLowStockAlerts() {
        console.log('[dashboardService] Getting low stock alerts');
        return await fetchAPI('dashboard/alerts/low-stock');
    },
};