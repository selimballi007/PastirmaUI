'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store/authStore';
import { orderService } from '@/app/lib/services/orderService';
import type { Order } from '@/app/types/order';
import { OrderStatusLabels, PaymentMethodLabels } from '@/app/types/order';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;

      try {
        setLoading(true);
        // For authenticated users, fetch via getOrderDetails
        // For guests, they would need to use track order page
        if (user) {
          const orders = await orderService.getOrders(1, 100);
          const foundOrder = orders.items.find(o => o.orderNumber === orderNumber);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Sipariş bulunamadı.');
          }
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Sipariş yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">✕</div>
              <h1 className="text-2xl font-bold mb-4">Sipariş Bulunamadı</h1>
              <p className="text-gray-600 mb-6">
                {error || 'Belirtilen sipariş numarası ile bir sipariş bulunamadı.'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold mb-2">Siparişiniz Alındı!</h1>
            <p className="text-gray-600 mb-4">
              Sipariş numaranız: <strong className="text-blue-500">{order.orderNumber}</strong>
            </p>
            <p className="text-gray-600">
              Siparişiniz başarıyla oluşturuldu. Kısa süre içinde kargoya verilecektir.
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Sipariş Detayları</h2>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4 text-lg">Ürünler</h3>
            <div className="space-y-4">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  {item.productImageUrl && (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-gray-600">
                      {item.unitPrice.toFixed(2)} TL x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.totalPrice.toFixed(2)} TL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4 space-y-2">
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

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 text-lg">Teslimat Adresi</h3>
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
            <h3 className="font-semibold mb-4 text-lg">Ödeme Bilgileri</h3>
            <div className="text-gray-700">
              <div className="mb-2">
                <span className="font-semibold">Ödeme Yöntemi:</span>{' '}
                {PaymentMethodLabels[order.paymentMethod]}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Ödeme Durumu:</span>{' '}
                <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                  {order.paymentStatus === 'Paid' ? 'Ödendi' : 'Bekliyor'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Sipariş Durumu:</span>{' '}
                <span className="text-blue-600">{OrderStatusLabels[order.status]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold mb-2 text-lg">Sipariş Notu</h3>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Alışverişe Devam Et
          </button>
          {user && (
            <button
              onClick={() => router.push('/account/orders')}
              className="px-6 py-3 border rounded hover:bg-gray-50"
            >
              Siparişlerim
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border rounded hover:bg-gray-50"
          >
            Yazdır
          </button>
        </div>

        {/* Guest Tracking Info */}
        {!user && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 mb-2">
              <strong>Misafir siparişinizi takip edin!</strong>
            </p>
            <p className="text-blue-700 mb-4">
              Sipariş numaranız ve e-posta adresiniz ile siparişinizi takip edebilirsiniz.
            </p>
            <button
              onClick={() => router.push('/track-order')}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Siparişimi Takip Et
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
