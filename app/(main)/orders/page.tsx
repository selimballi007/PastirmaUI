'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { orderService } from '@/app/lib/services/orderService';
import type { PaginatedOrders } from '@/app/types/order';
import OrderCard from '@/app/components/orders/OrderCard';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/orders');
    }
  }, [user, router]);

  // Load orders
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await orderService.getOrders(currentPage, pageSize, statusFilter);
      setOrders(result);
    } catch (err: any) {
      setError(err.message || 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading && !orders) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Siparişler yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Siparişlerim</h1>
          <p className="text-gray-600 mt-2">Geçmiş siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Durum Filtresi</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tümü</option>
              <option value="Pending">Beklemede</option>
              <option value="Confirmed">Onaylandı</option>
              <option value="Preparing">Hazırlanıyor</option>
              <option value="Shipped">Kargoya Verildi</option>
              <option value="Delivered">Teslim Edildi</option>
              <option value="Returned">İade Edildi</option>
              <option value="Cancelled">İptal Edildi</option>
            </select>
          </div>

          <div className="sm:ml-auto">
            <button
              onClick={fetchOrders}
              className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Yenile
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders && orders.items.length > 0 ? (
          <div className="space-y-4">
            {orders.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz siparişiniz yok</h3>
            <p className="text-gray-600 mb-6">İlk siparişinizi vererek alışverişe başlayın!</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Ürünlere Göz Atın
            </button>
          </div>
        )}

        {/* Pagination */}
        {orders && orders.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Toplam {orders.totalCount} sipariş, Sayfa {orders.currentPage} / {orders.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === orders.totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
