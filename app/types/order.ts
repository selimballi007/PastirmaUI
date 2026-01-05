export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Preparing = 2,
  Shipped = 3,
  Delivered = 4,
  Returned = 5,
  Cancelled = 6,
}

export enum PaymentMethod {
  CreditCard = 0,
  PayAtDoor = 1,
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Beklemede',
  [OrderStatus.Confirmed]: 'Onaylandı',
  [OrderStatus.Preparing]: 'Hazırlanıyor',
  [OrderStatus.Shipped]: 'Kargoya Verildi',
  [OrderStatus.Delivered]: 'Teslim Edildi',
  [OrderStatus.Returned]: 'İade Edildi',
  [OrderStatus.Cancelled]: 'İptal Edildi',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: 'Kredi Kartı',
  [PaymentMethod.PayAtDoor]: 'Kapıda Ödeme',
};

// Re-export Address type from address.ts
export type { Address } from './address';

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  orderItems: OrderItem[];
  subTotal: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  orderStatus: OrderStatus;
  notes?: string;
  adminNotes?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrder {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  orderItems: CreateOrderItem[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PaginatedOrders {
  items: Order[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
