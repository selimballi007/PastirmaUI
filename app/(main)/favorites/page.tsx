'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import ProductCard from '@/app/components/product/ProductCard';
import { favoriteService, type FavoriteProduct } from '@/app/lib/services/favoriteService';
import { useFavoriteStore } from '@/app/lib/store/favoriteStore';
import { useAuthStore } from '@/app/lib/store/authStore';

export default function FavoritesPage() {
    const [products, setProducts] = useState<FavoriteProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);
    const removeFromFavorites = useFavoriteStore((state) => state.removeFromFavorites);
    const clearFavorites = useFavoriteStore((state) => state.clearFavorites);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchFavorites();
    }, [user]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const favorites = await favoriteService.getUserFavorites();
            setProducts(favorites);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (productId: number) => {
        try {
            await removeFromFavorites(productId);
            // Update local state
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Tüm favorileri temizlemek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            // Remove all favorites one by one
            await Promise.all(products.map((p) => removeFromFavorites(p.id)));
            setProducts([]);
            await clearFavorites();
        } catch (error) {
            console.error('Error clearing favorites:', error);
        }
    };

    const handleAddToCart = (productId: number) => {
        // This is handled by ProductCard's internal logic
    };

    const handleQuickView = (productId: number) => {
        // TODO: Implement quick view modal
    };

    if (!user) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Favorilerinizi Görüntüleyin</h1>
                    <p className="text-gray-600 mb-6">
                        Favori ürünlerinizi görmek için giriş yapmalısınız.
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ana Sayfaya Dön
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full mb-4">
                            <Heart className="w-4 h-4 mr-2 fill-current" />
                            <span className="font-semibold">Favorilerim</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Favori Ürünlerim ({products.length})
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Beğendiğiniz ürünleri buradan takip edebilirsiniz
                        </p>
                    </div>
                    {products.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="font-semibold">Tümünü Temizle</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Henüz Favori Ürün Yok
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Ürünleri Keşfet
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            oldPrice={product.oldPrice}
                            imageUrl={product.imageUrl}
                            categoryName={product.categoryName}
                            isBestSeller={product.isBestSeller}
                            isNew={product.isNew}
                            isSpecialOffer={product.isCampaign}
                            onAddToCart={handleAddToCart}
                            onQuickView={handleQuickView}
                            variant="default"
                            showReviews={false}
                        />
                    ))}
                </div>
            )}

            {/* Info Section */}
            {products.length > 0 && (
                <div className="mt-12 p-6 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-start space-x-3">
                        <Heart className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1 fill-current" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Favoriler Hakkında</h3>
                            <p className="text-gray-600 text-sm">
                                Favori ürünleriniz hesabınıza kaydedilir ve tüm cihazlarınızdan
                                erişebilirsiniz. Ürün kartlarındaki kalp simgesine tıklayarak favorilere
                                ekleyebilir veya çıkarabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
