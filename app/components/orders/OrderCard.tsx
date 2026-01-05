'use client';

import Link from 'next/link';
import type { Order } from '@/app/types/order';
import { PaymentMethodLabels } from '@/app/types/order';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.createdDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-600">#{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Ürün Sayısı</p>
            <p className="font-medium">{itemCount} ürün</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Ödeme Yöntemi</p>
            <p className="font-medium">{PaymentMethodLabels[order.paymentMethod]}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Toplam Tutar</p>
            <p className="font-semibold text-lg">{order.totalAmount.toFixed(2)} TL</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Teslimat Adresi</p>
          {order.shippingAddress ? (
            <p className="text-sm text-gray-700">
              {order.shippingAddress.fullName || 'İsim belirtilmemiş'} - {order.shippingAddress.city}, {order.shippingAddress.district}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic">Adres bilgisi mevcut değil</p>
          )}
        </div>

        <div className="mt-4 text-right">
          <span className="text-blue-600 text-sm font-medium hover:underline">
            Detayları Görüntüle →
          </span>
        </div>
      </div>
    </Link>
  );
}
