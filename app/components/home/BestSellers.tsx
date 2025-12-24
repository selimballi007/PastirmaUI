// components/home/BestSellers.tsx
'use client';

import ProductCard from '@/app/components/product/ProductCard';
import { Package, TrendingUp } from 'lucide-react';
import type { Product } from '@/app/types/dashboard';

interface BestSellersProps {
    products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {

    const handleAddToCart = (productId: number) => {
        // TODO: Cart store'a ekle
        console.log('Add to cart:', productId);
        alert('Ürün sepete eklendi!'); // Geçici
    };

    const handleQuickView = (productId: number) => {
        // TODO: Quick view modal aç
        console.log('Quick view:', productId);
    };

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