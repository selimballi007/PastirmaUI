'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
import { useCartStore } from '@/app/lib/store/cartStore';

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);

    const [removingItem, setRemovingItem] = useState<number | null>(null);

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        try {
            updateQuantity(productId, newQuantity);
        } catch (error: unknown) {
            alert((error as Error).message);
        }
    };

    const handleRemoveItem = (productId: number) => {
        setRemovingItem(productId);
        setTimeout(() => {
            removeItem(productId);
            setRemovingItem(null);
        }, 300);
    };

    const handleClearCart = () => {
        if (confirm('Sepetteki tüm ürünleri kaldırmak istediğinizden emin misiniz?')) {
            clearCart();
        }
    };

    const calculateItemPrice = (item: typeof items[0]) => {
        return item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price;
    };

    const subtotal = getTotalPrice();
    const shipping = subtotal > 500 ? 0 : 29.99;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-16">
                    <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h2>
                    <p className="text-gray-600 mb-8">Alışverişe başlamak için ürünleri keşfedin!</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-8 py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                    >
                        Ürünleri İncele
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sepetim</h1>
                    <p className="text-gray-600">{items.length} ürün</p>
                </div>
                <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                >
                    <Trash2 className="w-5 h-5" />
                    Sepeti Temizle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => {
                        const itemPrice = calculateItemPrice(item);
                        const isRemoving = removingItem === item.productId;

                        return (
                            <div
                                key={item.productId}
                                className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 ${
                                    isRemoving ? 'opacity-0 scale-95' : ''
                                }`}
                            >
                                <div className="flex gap-6">
                                    {/* Product Image */}
                                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                            <Image
                                                src={item.productImage}
                                                alt={item.productName}
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/products/${item.productId}`}
                                            className="text-lg font-semibold text-gray-900 hover:text-orange-600 block mb-2"
                                        >
                                            {item.productName}
                                        </Link>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-3 mb-4">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {itemPrice.toFixed(2)}₺
                                            </span>
                                            {item.discount && (
                                                <>
                                                    <span className="text-lg text-gray-500 line-through">
                                                        {item.price.toFixed(2)}₺
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                                                        %{item.discount} İndirim
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-4 text-lg font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item.productId)}
                                                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Kaldır
                                            </button>
                                        </div>

                                        {/* Stock Warning */}
                                        {item.quantity === item.stock && (
                                            <p className="text-orange-600 text-sm mt-2">
                                                Maksimum stok adedine ulaştınız
                                            </p>
                                        )}
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 mb-1">Toplam</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(itemPrice * item.quantity).toFixed(2)}₺
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-700">
                                <span>Ara Toplam</span>
                                <span className="font-semibold">{subtotal.toFixed(2)}₺</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Kargo</span>
                                {shipping === 0 ? (
                                    <span className="text-green-600 font-semibold">Ücretsiz</span>
                                ) : (
                                    <span className="font-semibold">{shipping.toFixed(2)}₺</span>
                                )}
                            </div>
                            {subtotal < 500 && (
                                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                                    <Tag className="w-4 h-4" />
                                    <span>
                                        <strong>{(500 - subtotal).toFixed(2)}₺</strong> daha alışveriş yapın,
                                        kargo ücretsiz!
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Toplam</span>
                                    <span>{total.toFixed(2)}₺</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full px-6 py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 mb-4"
                        >
                            Alışverişi Tamamla
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            href="/products"
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Alışverişe Devam Et
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
