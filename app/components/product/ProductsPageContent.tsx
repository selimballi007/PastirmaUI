// app/components/product/ProductsPageContent.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/app/components/product/ProductCard';
import type { Product } from '@/app/types/dashboard';
import {
    Package,
    Filter,
    X,
    Grid3x3,
    List,
    Search,
} from 'lucide-react';

interface ProductsPageContentProps {
    initialProducts: Product[];
    categories: any[];
    initialCategoryId: number | null;
    initialFilter: string;
}

export default function ProductsPageContent({
    initialProducts,
    categories,
    initialCategoryId,
    initialFilter,
}: ProductsPageContentProps) {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string>('default');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const handleCategoryChange = (categoryId: number | null) => {
        if (categoryId) {
            router.push(`/products?category=${categoryId}`);
        } else {
            router.push('/products');
        }
    };

    const handleFilterChange = (filter: string) => {
        if (filter !== 'all') {
            router.push(`/products?filter=${filter}`);
        } else {
            router.push('/products');
        }
    };

    const handleAddToCart = (productId: number) => {
        console.log('Add to cart:', productId);
        alert('Ürün sepete eklendi!');
    };

    const handleQuickView = (productId: number) => {
        console.log('Quick view:', productId);
    };

    // Client-side filtering and sorting
    const filteredProducts = initialProducts
        .filter((product) => {
            // Search filter
            if (searchTerm) {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
        .sort((a, b) => {
            // Sorting
            switch (sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'popular':
                    return (b.salesCount || 0) - (a.salesCount || 0);
                default:
                    return 0;
            }
        });

    const getPageTitle = () => {
        if (initialFilter === 'best-sellers') return 'Çok Satanlar';
        if (initialFilter === 'campaign') return 'Kampanyalı Ürünler';
        if (initialFilter === 'new') return 'Yeni Ürünler';
        if (initialCategoryId) {
            const category = categories.find((c) => c.id === initialCategoryId);
            return category ? category.name : 'Ürünler';
        }
        return 'Tüm Ürünler';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                        <button
                            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                            className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filtreler</span>
                        </button>
                    </div>

                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                            >
                                <option value="default">Sıralama</option>
                                <option value="popular">En Popüler</option>
                                <option value="price-asc">Fiyat (Düşük - Yüksek)</option>
                                <option value="price-desc">Fiyat (Yüksek - Düşük)</option>
                                <option value="name-asc">İsim (A-Z)</option>
                                <option value="name-desc">İsim (Z-A)</option>
                            </select>

                            {/* View Mode */}
                            <div className="hidden sm:flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600'
                                        }`}
                                >
                                    <Grid3x3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600'
                                        }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Filters */}
                    <aside
                        className={`lg:w-64 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'
                            }`}
                    >
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            {/* Mobile Close Button */}
                            {mobileFiltersOpen && (
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="lg:hidden absolute top-4 right-4"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}

                            <h3 className="text-lg font-bold text-gray-900 mb-6">Filtreler</h3>

                            {/* Quick Filters */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Hızlı Filtreler
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleFilterChange('all')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${initialFilter === 'all' && !initialCategoryId
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Tüm Ürünler
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('best-sellers')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${initialFilter === 'best-sellers'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        🔥 Çok Satanlar
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('campaign')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${initialFilter === 'campaign'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        💰 Kampanyalı
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('new')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${initialFilter === 'new'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        ✨ Yeni Ürünler
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Kategoriler
                                </h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleCategoryChange(null)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${!initialCategoryId && initialFilter === 'all'
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Tümü
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category.id)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${initialCategoryId === category.id
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span className="flex items-center space-x-2">
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </span>
                                            {category.productCount !== undefined && (
                                                <span className="text-xs opacity-70">
                                                    ({category.productCount})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(initialCategoryId || initialFilter !== 'all') && (
                                <div className="mt-6 pt-6 border-t">
                                    <button
                                        onClick={() => router.push('/products')}
                                        className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Filtreleri Temizle</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Ürün Bulunamadı
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm
                                        ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                                        : 'Bu kategoride henüz ürün bulunmuyor.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.push('/products');
                                    }}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                                >
                                    Tüm Ürünleri Görüntüle
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Results Count */}
                                <div className="mb-6 flex items-center justify-between">
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">
                                            {filteredProducts.length}
                                        </span>{' '}
                                        ürün bulundu
                                    </p>
                                </div>

                                {/* Products Grid */}
                                <div
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                            : 'space-y-6'
                                    }
                                >
                                    {filteredProducts.map((product) => (
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
                                            isBestSeller={product.isBestSeller}
                                            isNew={product.isNew}
                                            isSpecialOffer={product.isCampaign}
                                            onAddToCart={handleAddToCart}
                                            onQuickView={handleQuickView}
                                            variant={viewMode === 'list' ? 'detailed' : 'default'}
                                            showReviews={true}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}