'use client';

import { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { productService } from '@/app/lib/services/productService';
import type { Category, Product } from '@/app/types/dashboard';
import { useCategoryStore } from '@/app/lib/store/categoryStore';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedStatus]);

    const fetchProducts = async () => {
        try {
            setError(null);
            setLoading(true);

            const filters = {
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
            };

            const prods = await productService.getProducts(filters);
            setProducts(prods);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await productService.deleteProduct(productToDelete.id);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ürün silinirken hata oluştu');
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await productService.updateProductStatus(product.id, !product.isActive);
            setProducts(products.map(p =>
                p.id === product.id ? { ...p, isActive: !p.isActive } : p
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Durum güncellenirken hata oluştu');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Stokta Yok', color: 'text-red-600 bg-red-100' };
        if (stock < 10) return { text: 'Düşük Stok', color: 'text-orange-600 bg-orange-100' };
        return { text: 'Stokta', color: 'text-green-600 bg-green-100' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Toplam {filteredProducts.length} ürün
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/dashboard/products/0/edit`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Yeni Ürün Ekle
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ürün ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Ürün Bulunamadı
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Arama kriterlerinize uygun ürün bulunamadı.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                                setSelectedStatus('all');
                            }}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock);

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 bg-gray-200 relative">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                        {!product.isActive && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                                                    Pasif
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                                {stockStatus.text}
                                            </span>
                                        </div>

                                        {product.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(product.price)}
                                                </p>
                                                {product.categoryId && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {categories.find(cat => cat.id === product.categoryId)?.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Stok</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {product.stock}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                                                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center ${product.isActive
                                                    ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {product.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProductToDelete(product);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && productToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            Ürünü Sil
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            <strong>{productToDelete.name}</strong> ürününü silmek istediğinizden emin misiniz?
                            Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setProductToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}