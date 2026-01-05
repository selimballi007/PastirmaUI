'use client';

import { OrderStatus, OrderStatusLabels } from '@/app/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const getStatusColor = (status: OrderStatus) => {
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${getStatusColor(status)} ${getSizeClasses()}`}>
      {OrderStatusLabels[status]}
    </span>
  );
}
