'use client';

import { useState } from 'react';
import { orderService } from '@/app/lib/services/orderService';
import type { Order } from '@/app/types/order';
import { OrderStatusLabels, PaymentMethodLabels } from '@/app/types/order';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderNumber.trim() || !email.trim()) {
      setError('Lütfen sipariş numarası ve e-posta adresini girin.');
      return;
    }

    setLoading(true);

    try {
      const result = await orderService.trackOrder(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message?.includes('404')) {
        setError('Sipariş bulunamadı. Lütfen sipariş numarası ve e-posta adresini kontrol edin.');
      } else {
        setError(error.message || 'Sipariş sorgulanırken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-500'; // Pending
      case 1: return 'bg-blue-500'; // Confirmed
      case 2: return 'bg-purple-500'; // Preparing
      case 3: return 'bg-indigo-500'; // Shipped
      case 4: return 'bg-green-500'; // Delivered
      case 5: return 'bg-orange-500'; // Returned
      case 6: return 'bg-red-500'; // Cancelled
      default: return 'bg-gray-500';
    }
  };

  const getStatusProgress = (status: number) => {
    switch (status) {
      case 0: return 20; // Pending
      case 1: return 40; // Confirmed
      case 2: return 60; // Preparing
      case 3: return 80; // Shipped
      case 4: return 100; // Delivered
      case 5: return 100; // Returned
      case 6: return 0; // Cancelled
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6">Sipariş Takibi</h1>
          <p className="text-gray-600 mb-6">
            Sipariş numaranızı ve siparişte kullandığınız e-posta adresini girerek siparişinizi takip edebilirsiniz.
          </p>

          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Sipariş Numarası</label>
              <input
                type="text"
                placeholder="Örn: PST-20231231-0001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">E-posta Adresi</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sorgulanıyor...' : 'Siparişi Sorgula'}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Sipariş Durumu</h2>

              {/* Current Status Badge */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded text-white font-semibold ${getStatusColor(order.status)}`}>
                    {OrderStatusLabels[order.status]}
                  </div>
                  <span className="text-gray-600">
                    Sipariş #{order.orderNumber}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {order.status !== 6 && ( // Don't show progress for cancelled
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getStatusColor(order.status)} transition-all duration-500`}
                      style={{ width: `${getStatusProgress(order.status)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status >= 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {order.status >= 0 ? '✓' : '1'}
                  </div>
                  <div>
                    <p className="font-semibold">Sipariş Alındı</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {order.status >= 1 ? '✓' : '2'}
                  </div>
                  <div>
                    <p className="font-semibold">Sipariş Onaylandı</p>
                    <p className="text-sm text-gray-600">
                      {order.status >= 1 ? 'Tamamlandı' : 'Bekleniyor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {order.status >= 2 ? '✓' : '3'}
                  </div>
                  <div>
                    <p className="font-semibold">Hazırlanıyor</p>
                    <p className="text-sm text-gray-600">
                      {order.status >= 2 ? 'Tamamlandı' : 'Bekleniyor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {order.status >= 3 ? '✓' : '4'}
                  </div>
                  <div>
                    <p className="font-semibold">Kargoya Verildi</p>
                    <p className="text-sm text-gray-600">
                      {order.status >= 3 ? 'Tamamlandı' : 'Bekleniyor'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status >= 4 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {order.status >= 4 ? '✓' : '5'}
                  </div>
                  <div>
                    <p className="font-semibold">Teslim Edildi</p>
                    <p className="text-sm text-gray-600">
                      {order.status >= 4 ? 'Tamamlandı' : 'Bekleniyor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Sipariş Detayları</h3>
              <div className="space-y-4">
                {order.orderItems.map(item => (
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

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>{order.subTotal.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span>{order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost.toFixed(2)} TL`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Toplam</span>
                  <span>{order.totalAmount.toFixed(2)} TL</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Teslimat Adresi</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.district}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Ödeme Bilgileri</h3>
              <div className="space-y-2 text-gray-700">
                <div>
                  <span className="font-semibold">Ödeme Yöntemi:</span>{' '}
                  {PaymentMethodLabels[order.paymentMethod]}
                </div>
                <div>
                  <span className="font-semibold">Ödeme Durumu:</span>{' '}
                  <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                    {order.paymentStatus === 'Paid' ? 'Ödendi' : 'Bekliyor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Sipariş Notu</h3>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
