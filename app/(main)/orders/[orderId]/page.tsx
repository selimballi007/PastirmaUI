'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/lib/store/authStore';
import { orderService } from '@/app/lib/services/orderService';
import type { Order } from '@/app/types/order';
import { PaymentMethodLabels } from '@/app/types/order';
import OrderStatusBadge from '@/app/components/orders/OrderStatusBadge';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/account/login?redirect=/orders');
    }
  }, [user, router]);

  // Load order details
  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = await orderService.getOrderDetails(orderId);
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Sipariş detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Sipariş detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sipariş Bulunamadı</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/orders"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Siparişlerime Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formattedDate = new Date(order.createdDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Siparişlerime Dön
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sipariş #{order.orderNumber}</h1>
              <p className="text-gray-600 text-sm mt-1">{formattedDate}</p>
            </div>
            <OrderStatusBadge status={order.orderStatus} size="lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Ödeme Yöntemi</p>
              <p className="font-medium">{PaymentMethodLabels[order.paymentMethod]}</p>
              <p className={`text-xs mt-1 ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                {order.paymentStatus === 'Paid' ? 'Ödendi' : 'Ödeme Bekliyor'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Toplam Ürün</p>
              <p className="font-medium">{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} adet</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Toplam Tutar</p>
              <p className="font-semibold text-xl text-blue-600">{order.totalAmount.toFixed(2)} TL</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Teslimat Adresi</h2>
          {order.shippingAddress ? (
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="mt-2">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.district}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
              {order.shippingAddress.notes && (
                <p className="mt-2 text-sm text-gray-600 italic">Not: {order.shippingAddress.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Adres bilgisi mevcut değil</p>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Sipariş Ürünleri</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Birim Fiyat: {item.unitPrice.toFixed(2)} TL
                  </p>
                  <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.totalPrice.toFixed(2)} TL</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Ara Toplam</span>
              <span>{order.subTotal.toFixed(2)} TL</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Kargo</span>
              <span>{order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost.toFixed(2)} TL`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
              <span>Toplam</span>
              <span className="text-blue-600">{order.totalAmount.toFixed(2)} TL</span>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Sipariş Notu</h2>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
