'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { orderService } from '@/app/lib/services/orderService';
import type { Order, PaginatedOrders } from '@/app/types/order';
import { OrderStatus, OrderStatusLabels, PaymentMethodLabels } from '@/app/types/order';

export default function UserOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/account/orders');
      return;
    }

    fetchOrders();
  }, [currentPage, statusFilter, user, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await orderService.getOrders(currentPage, pageSize, statusFilter);
      setOrders(result);
    } catch (err: unknown) {
      setError((err as Error).message || 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.Confirmed:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.Preparing:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.Shipped:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.Delivered:
        return 'bg-green-100 text-green-800';
      case OrderStatus.Returned:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await orderService.updateOrderStatus(orderId.toString(), OrderStatus.Cancelled);
      await fetchOrders();
      alert('Sipariş iptal edildi.');
    } catch (err: unknown) {
      alert((err as Error).message || 'Sipariş iptal edilirken bir hata oluştu.');
    }
  };

  if (!user) {
    return null;
  }

  if (loading && !orders) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Siparişleriniz yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Siparişlerim</h1>
          <p className="text-gray-600 mt-2">Geçmiş siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <div>
            <label className="block text-sm font-semibold mb-2">Durum Filtresi</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded"
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

          <div className="ml-auto">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Yenile
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders && orders.items.length > 0 ? (
          <div className="space-y-4">
            {orders.items.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Sipariş #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdDate).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(order.orderStatus)}`}>
                    {OrderStatusLabels[order.orderStatus]}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                    <p className="font-semibold">{PaymentMethodLabels[order.paymentMethod]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Toplam Tutar</p>
                    <p className="font-semibold text-lg">{order.totalAmount.toFixed(2)} TL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ürün Sayısı</p>
                    <p className="font-semibold">{order.orderItems.length} ürün</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Detayları Gör
                  </button>

                  {order.orderStatus === OrderStatus.Pending && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Siparişi İptal Et
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Henüz siparişiniz bulunmamaktadır.</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Alışverişe Başla
            </button>
          </div>
        )}

        {/* Pagination */}
        {orders && orders.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-700">
              Sayfa {orders.currentPage} / {orders.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === orders.totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
                  <p className="text-gray-600">#{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Ürünler</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      {item.productImageUrl && (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {item.unitPrice.toFixed(2)} TL x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.totalPrice.toFixed(2)} TL</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>{selectedOrder.subTotal.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span>{selectedOrder.shippingCost === 0 ? 'Ücretsiz' : `${selectedOrder.shippingCost.toFixed(2)} TL`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Toplam</span>
                    <span>{selectedOrder.totalAmount.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
                <div className="text-gray-700 text-sm">
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}</p>
                  <p className="mt-2">{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Ödeme Bilgileri</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Ödeme Yöntemi:</strong> {PaymentMethodLabels[selectedOrder.paymentMethod]}</p>
                  <p>
                    <strong>Ödeme Durumu:</strong>{' '}
                    <span className={selectedOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                      {selectedOrder.paymentStatus === 'Paid' ? 'Ödendi' : 'Bekliyor'}
                    </span>
                  </p>
                  <p>
                    <strong>Sipariş Durumu:</strong>{' '}
                    <span className={`px-2 py-1 rounded ${getStatusBadgeColor(selectedOrder.orderStatus)}`}>
                      {OrderStatusLabels[selectedOrder.orderStatus]}
                    </span>
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Sipariş Notu</h3>
                  <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {selectedOrder.orderStatus === OrderStatus.Pending && (
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Siparişi İptal Et
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
