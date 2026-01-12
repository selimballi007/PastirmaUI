import { fetchAPI } from '@/app/lib/api/client';
import type { Order, CreateOrder, PaginatedOrders } from '@/app/types/order';

export const orderService = {
  // Checkout - Create new order
  async createOrder(orderData: CreateOrder): Promise<Order> {
    return fetchAPI<Order>('order/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Track order by order number and email (guest tracking)
  async trackOrder(orderNumber: string, email: string): Promise<Order> {
    return fetchAPI<Order>(`order/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
  },

  // Get user's orders with pagination and filtering
  async getOrders(page: number = 1, pageSize: number = 10, status?: string): Promise<PaginatedOrders> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return fetchAPI<PaginatedOrders>(`order?${params.toString()}`);
  },

  // Get order details by ID
  async getOrderDetails(orderId: string): Promise<Order> {
    return fetchAPI<Order>(`order/${orderId}`);
  },

  // Update order status (admin)
  async updateOrderStatus(orderId: string, status: number): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`order/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
