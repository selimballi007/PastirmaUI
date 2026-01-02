// types/cart.ts - Shopping cart-related type definitions

export interface CartItem {
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    stock: number;
    discount?: number;
}
