// hooks/useDashboard.ts
'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/app/lib/services/dashboardService';
import type { DashboardResponse } from '@/app/types/dashboard';

/**
 * Dashboard verilerini yönetmek için custom hook
 * 
 * Kullanım:
 * const { data, loading, error, refresh } = useDashboard();
 */
export function useDashboard() {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setError(null);
            const dashboardData = await dashboardService.getDashboardData();
            setData(dashboardData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            console.error('[useDashboard] Error:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refresh = () => {
        setLoading(true);
        fetchData();
    };

    return { data, loading, error, refresh };
}

/**
 * Son siparişleri yönetmek için custom hook
 */
export function useRecentOrders(limit: number = 10) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setError(null);
                const data = await dashboardService.getRecentOrders(limit);
                setOrders(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
                console.error('[useRecentOrders] Error:', errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [limit]);

    return { orders, loading, error };
}

/**
 * Satış verilerini yönetmek için custom hook
 */
export function useSalesData(period: 'week' | 'month' | 'year' = 'month') {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                setError(null);
                const data = await dashboardService.getSalesData(period);
                setSalesData(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
                console.error('[useSalesData] Error:', errorMessage);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [period]);

    return { salesData, loading, error };
}