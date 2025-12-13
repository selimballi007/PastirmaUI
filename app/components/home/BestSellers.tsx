// components/home/BestSellers.tsx
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/app/components/product/ProductCard';
import { productService } from '@/app/lib/services/productService';
import { Package, TrendingUp } from 'lucide-react';
import type { Product } from '@/app/types/dashboard';

export default function BestSellers() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Backend'den best seller ürünleri al
            const result = await productService.getProducts({ isBestSeller: true, limit: 4 });
            setProducts(result);
        } catch (err) {
            console.error('Error fetching best sellers:', err);
            setError('Çok satan ürünler yüklenirken bir hata oluştu.');
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

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Çok Satanlar</h2>
                        <p className="text-gray-600">En popüler ürünlerimiz</p>
                    </div>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchBestSellers}
                            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
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
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Henüz çok satan ürün bulunmuyor.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center space-x-2 mb-4">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                        <h2 className="text-4xl font-bold text-gray-900">Çok Satanlar</h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                        En popüler ve beğenilen ürünlerimiz
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            oldPrice={product.oldPrice}
                            imageUrl={product.imageUrl}
                            rating={product.rating}
                            reviews={product.reviewCount}
                            sales={product.salesCount}
                            stock={product.stock}
                            categoryName={product.categoryName}
                            isBestSeller={true}
                            onAddToCart={handleAddToCart}
                            onQuickView={handleQuickView}
                            variant="default"
                            showReviews={true}
                        />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <a
                        href="/products/best-sellers"
                        className="inline-flex items-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg hover:shadow-xl"
                    >
                        <span className="font-semibold">Tümünü Gör</span>
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
            </div>
        </section >
    );
}