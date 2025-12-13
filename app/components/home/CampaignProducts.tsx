// components/home/CampaignProducts.tsx
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/app/components/product/ProductCard';
import { productService } from '@/app/lib/services/productService';
import { Package, Sparkles } from 'lucide-react';
import type { Product } from '@/app/types/dashboard';

export default function CampaignProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaignProducts();
    }, []);

    const fetchCampaignProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Backend'den kampanyalı ürünleri al
            const result = await productService.getProducts({ isCampaign: true, limit: 3 }); // 3 adet
            setProducts(result);
        } catch (err) {
            console.error('Error fetching campaign products:', err);
            setError('Kampanyalı ürünler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (productId: number) => {
        // TODO: Cart store'a ekle
        console.log('Add to cart:', productId);
        alert('Ürün sepete eklendi!'); // Geçici
    };

    const handleQuickView = (productId: number) => {
        // TODO: Quick view modal aç
        console.log('Quick view:', productId);
    };

    // İndirim yüzdesini hesapla
    const calculateDiscount = (price: number, oldPrice?: number) => {
        if (oldPrice && oldPrice > price) {
            return Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        return 0;
    };

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Kampanyalı Ürünler
                        </h2>
                        <p className="text-gray-600">Kaçırılmayacak fırsatlar</p>
                    </div>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchCampaignProducts}
                            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Şu anda kampanyalı ürün bulunmuyor.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center space-x-2 mb-4">
                        <Sparkles className="w-8 h-8 text-orange-600 animate-pulse" />
                        <h2 className="text-4xl font-bold text-gray-900">Kampanyalı Ürünler</h2>
                        <Sparkles className="w-8 h-8 text-orange-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        Kaçırılmayacak indirim fırsatları
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => {
                        const discount = calculateDiscount(product.price, product.oldPrice);

                        return (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={product.price}
                                oldPrice={product.oldPrice}
                                imageUrl={product.imageUrl}
                                rating={product.rating}
                                reviews={product.reviewCount}
                                stock={product.stock}
                                categoryName={product.categoryName}
                                badge={discount > 0 ? `%${discount} İndirim` : undefined}
                                badgeColor="bg-red-600"
                                onAddToCart={handleAddToCart}
                                onQuickView={handleQuickView}
                                variant="detailed" // ✅ Detailed variant (daha gösterişli)
                                showReviews={true}
                            />
                        );
                    })}
                </div>

                {/* Campaign Info Banner */}
                {products.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-8 text-center shadow-2xl">
                        <h3 className="text-2xl font-bold mb-2">
                            🎉 Özel Kampanya Fırsatı!
                        </h3>
                        <p className="text-lg mb-4">
                            Tüm kampanyalı ürünlerde ek %10 indirim için kod: <span className="font-bold">FIRSAT10</span>
                        </p>
                        <a
                            href="/products?filter=campaign"
                            className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <span>Tüm Kampanyaları Gör</span>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </a>
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center mt-12">
                    <a
                        href="/products?filter=campaign"
                        className="inline-flex items-center space-x-2 px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <span className="font-semibold">Tüm Kampanyaları Gör</span>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </a>
                </div>
            </div >
        </section >
    );
}