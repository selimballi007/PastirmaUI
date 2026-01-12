'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/app/lib/services/orderService';
import type { Order, PaginatedOrders } from '@/app/types/order';
import { OrderStatus, OrderStatusLabels, PaymentMethodLabels } from '@/app/types/order';
import { useNotificationStore } from '@/app/lib/store/notificationStore';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const clear = useNotificationStore(state => state.clear);

  // Clear notification count when page loads
  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);

    try {
      await orderService.updateOrderStatus(orderId, newStatus);

      // Refresh orders list
      await fetchOrders();

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id.toString() === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }

      alert('Sipariş durumu güncellendi.');
    } catch (err: any) {
      alert(err.message || 'Sipariş durumu güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingStatus(false);
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

  if (loading && !orders) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Siparişler</h1>
        <p className="text-gray-600 mt-2">Tüm siparişleri görüntüleyin ve yönetin</p>
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.items.length > 0 ? (
                orders.items.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {order.userName || order.guestName || 'Misafir'}
                        </div>
                        <div className="text-gray-500">{order.userEmail || order.guestEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.totalAmount.toFixed(2)} TL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{PaymentMethodLabels[order.paymentMethod]}</div>
                      <div className={`text-xs ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.paymentStatus === 'Paid' ? 'Ödendi' : 'Bekliyor'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.orderStatus)}`}>
                        {OrderStatusLabels[order.orderStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdDate).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detaylar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Sipariş bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders && orders.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam {orders.totalCount} sipariş, Sayfa {orders.currentPage} / {orders.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Önceki
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === orders.totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Müşteri Bilgileri</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Ad:</strong> {selectedOrder.userName || selectedOrder.guestName}</p>
                  <p><strong>E-posta:</strong> {selectedOrder.userEmail || selectedOrder.guestEmail}</p>
                  {selectedOrder.guestPhone && <p><strong>Telefon:</strong> {selectedOrder.guestPhone}</p>}
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-2">Sipariş Bilgileri</h3>
                <div className="text-sm text-gray-700">
                  <p><strong>Oluşturulma:</strong> {new Date(selectedOrder.createdDate).toLocaleString('tr-TR')}</p>
                  <p><strong>Ödeme:</strong> {PaymentMethodLabels[selectedOrder.paymentMethod]}</p>
                  <p><strong>Durum:</strong> <span className={`px-2 py-1 rounded ${getStatusBadgeColor(selectedOrder.orderStatus)}`}>
                    {OrderStatusLabels[selectedOrder.orderStatus]}
                  </span></p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
              <div className="text-sm text-gray-700">
                <p>{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                <p>{selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}</p>
                <p>{selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Ürünler</h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">{item.unitPrice.toFixed(2)} TL x {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.totalPrice.toFixed(2)} TL</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
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

            {/* Status Update */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Sipariş Durumunu Güncelle</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(OrderStatusLabels).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedOrder.id.toString(), parseInt(status) as OrderStatus)}
                    disabled={updatingStatus || selectedOrder.orderStatus === parseInt(status)}
                    className={`px-4 py-2 rounded text-sm font-semibold ${selectedOrder.orderStatus === parseInt(status)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Sipariş Notu</h3>
                <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
