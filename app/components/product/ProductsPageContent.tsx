// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/app/components/product/ProductCard';
import { productService } from '@/app/lib/services/productService';
import { useCategoryStore } from '@/app/lib/store/categoryStore';
import type { Product } from '@/app/types/dashboard';
import {
    Package,
    Filter,
    X,
    Grid3x3,
    List,
    Search,
} from 'lucide-react';

export default function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('default');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // URL'den category parametresini al
        const categoryParam = searchParams.get('category');
        const filterParam = searchParams.get('filter');

        if (categoryParam) {
            setSelectedCategoryId(parseInt(categoryParam));
        }
        if (filterParam) {
            setSelectedFilter(filterParam);
        }

        fetchProducts();
    }, [searchParams]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const categoryParam = searchParams.get('category');
            const filterParam = searchParams.get('filter');

            const filters: any = {};

            if (categoryParam) {
                filters.categoryId = parseInt(categoryParam);
            }

            if (filterParam) {
                if (filterParam === 'best-sellers') {
                    const bestSellers = await productService.getProducts({ isBestSeller: true, limit: 100 });
                    setProducts(bestSellers);
                    setLoading(false);
                    return;
                } else if (filterParam === 'campaign') {
                    const campaigns = await productService.getProducts({ isCampaign: true, limit: 100 });
                    setProducts(campaigns);
                    setLoading(false);
                    return;
                } else if (filterParam === 'new') {
                    filters.isNew = true;
                }
            }

            const result = await productService.getProducts(filters);
            setProducts(result);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Ürünler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        const params = new URLSearchParams(searchParams.toString());

        if (categoryId) {
            params.set('category', categoryId.toString());
        } else {
            params.delete('category');
        }
        params.delete('filter');

        router.push(`/products?${params.toString()}`);
    };

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        const params = new URLSearchParams();

        if (filter !== 'all') {
            params.set('filter', filter);
        }
        params.delete('category');

        router.push(`/products?${params.toString()}`);
        setSelectedCategoryId(null);
    };

    const handleAddToCart = (productId: number) => {
        console.log('Add to cart:', productId);
        alert('Ürün sepete eklendi!');
    };

    const handleQuickView = (productId: number) => {
        console.log('Quick view:', productId);
    };

    // Filtreleme ve sıralama
    const filteredProducts = products
        .filter((product) => {
            // Arama filtresi
            if (searchTerm) {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
        .sort((a, b) => {
            // Sıralama
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
        const filterParam = searchParams.get('filter');
        const categoryParam = searchParams.get('category');

        if (filterParam === 'best-sellers') return 'Çok Satanlar';
        if (filterParam === 'campaign') return 'Kampanyalı Ürünler';
        if (filterParam === 'new') return 'Yeni Ürünler';
        if (categoryParam) {
            const category = categories.find((c) => c.id === parseInt(categoryParam));
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
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'all' && !selectedCategoryId
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Tüm Ürünler
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('best-sellers')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'best-sellers'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        🔥 Çok Satanlar
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('campaign')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'campaign'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        💰 Kampanyalı
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('new')}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedFilter === 'new'
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
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${!selectedCategoryId && selectedFilter === 'all'
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
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${selectedCategoryId === category.id
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
                            {(selectedCategoryId || selectedFilter !== 'all') && (
                                <div className="mt-6 pt-6 border-t">
                                    <button
                                        onClick={() => {
                                            setSelectedCategoryId(null);
                                            setSelectedFilter('all');
                                            router.push('/products');
                                        }}
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
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchProducts}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                                >
                                    Tekrar Dene
                                </button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
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
                                        setSelectedCategoryId(null);
                                        setSelectedFilter('all');
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