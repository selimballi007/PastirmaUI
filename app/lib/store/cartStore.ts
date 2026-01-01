// lib/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    stock: number;
    discount?: number;
}

interface CartStore {
    items: CartItem[];

    // Actions
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;

    // Computed values
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getItemQuantity: (productId: number) => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const { items } = get();
                const existingItem = items.find((i) => i.productId === item.productId);

                if (existingItem) {
                    // Update quantity if item already exists
                    const newQuantity = existingItem.quantity + (item.quantity || 1);
                    if (newQuantity <= item.stock) {
                        set({
                            items: items.map((i) =>
                                i.productId === item.productId
                                    ? { ...i, quantity: newQuantity }
                                    : i
                            ),
                        });
                    } else {
                        throw new Error('Stok miktarını aşamazsınız');
                    }
                } else {
                    // Add new item
                    set({
                        items: [
                            ...items,
                            {
                                ...item,
                                quantity: item.quantity || 1,
                            },
                        ],
                    });
                }
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                const { items } = get();
                const item = items.find((i) => i.productId === productId);

                if (!item) return;

                if (quantity <= 0) {
                    // Remove item if quantity is 0 or less
                    get().removeItem(productId);
                    return;
                }

                if (quantity > item.stock) {
                    throw new Error('Stok miktarını aşamazsınız');
                }

                set({
                    items: items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const itemPrice = item.discount
                        ? item.price * (1 - item.discount / 100)
                        : item.price;
                    return total + itemPrice * item.quantity;
                }, 0);
            },

            getItemQuantity: (productId) => {
                const item = get().items.find((i) => i.productId === productId);
                return item ? item.quantity : 0;
            },
        }),
        {
            name: 'cart-store',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
