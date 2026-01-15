'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Share2, Minus, Plus, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/lib/store/authStore';
import { useFavoriteStore } from '@/app/lib/store/favoriteStore';
import { useCartStore } from '@/app/lib/store/cartStore';

interface ProductActionsProps {
    productId: number;
    productName: string;
    productDescription: string;
    productImage: string;
    price: number;
    stock: number;
    discount?: number;
    initialQuantity?: number;
}

export default function ProductActions({
    productId,
    productName,
    productDescription,
    productImage,
    price,
    stock,
    discount,
    initialQuantity = 1,
}: ProductActionsProps) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const user = useAuthStore((state) => state.user);
    const isFavorite = useFavoriteStore((state) => state.isFavorite(productId));
    const addToFavorites = useFavoriteStore((state) => state.addToFavorites);
    const removeFromFavorites = useFavoriteStore((state) => state.removeFromFavorites);
    const addToCart = useCartStore((state) => state.addItem);

    const handleToggleFavorite = async () => {
        if (!user) {
            toast('Favorilere eklemek için giriş yapmalısınız.', { icon: '⚠️' });
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(productId);
            } else {
                await addToFavorites(productId);
            }
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu.');
        }
    };

    const handleAddToCart = () => {
        try {
            addToCart({
                productId,
                productName,
                productImage,
                price,
                stock,
                discount,
                quantity,
            });

            // Show success message
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            toast.error(error.message || 'Sepete eklenirken bir hata oluştu.');
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= stock) {
            setQuantity(newQuantity);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: productName,
                text: productDescription,
                url: window.location.href,
            });
        } else {
            setShowShareModal(true);
        }
    };

    return (
        <>
            {/* Quantity Selector */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Miktar</label>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <span className="px-6 text-lg font-semibold">{quantity}</span>
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= stock}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <span className="text-sm text-gray-600">Maksimum: {stock} adet</span>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="flex items-center gap-2 p-4 bg-green-100 border border-green-200 rounded-lg text-green-800 font-medium animate-fade-in">
                    <Check className="w-5 h-5" />
                    <span>Ürün sepete eklendi!</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-6 h-6" />
                    <span>{stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleToggleFavorite}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                            isFavorite
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        <span>{isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Paylaş</span>
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Ürünü Paylaş</h3>
                            <button onClick={() => setShowShareModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link kopyalandı!');
                                    setShowShareModal(false);
                                }}
                                className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold"
                            >
                                📋 Linki Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
