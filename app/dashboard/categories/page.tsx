// app/dashboard/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCategoryStore } from '@/app/lib/store/categoryStore';
import { categoryService, type CategoryWithProductCount } from '@/app/lib/services/categoryService';
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Power,
    Package,
    Search,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const { categories, fetchCategories, loading } = useCategoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryWithProductCount | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        try {
            if (!formData.name.trim()) {
                toast('Kategori adı zorunludur!', { icon: '⚠️' });
                return;
            }

            await categoryService.createCategory(formData);
            toast.success('Kategori başarıyla oluşturuldu!');
            setIsModalOpen(false);
            setFormData({ name: '', icon: '' });
            fetchCategories();
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast.error(error.message || 'Kategori oluşturulurken bir hata oluştu.');
        }
    };

    const handleUpdate = async () => {
        try {
            if (!editingCategory) return;
            if (!formData.name.trim()) {
                toast('Kategori adı zorunludur!', { icon: '⚠️' });
                return;
            }

            await categoryService.updateCategory(editingCategory.id, formData);
            toast.success('Kategori başarıyla güncellendi!');
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', icon: '' });
            fetchCategories();
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast.error(error.message || 'Kategori güncellenirken bir hata oluştu.');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;

        try {
            await categoryService.deleteCategory(id);
            toast.success('Kategori başarıyla silindi!');
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Kategori silinirken bir hata oluştu.');
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await categoryService.toggleCategoryStatus(id);
            fetchCategories();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Durum değiştirilirken bir hata oluştu.');
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', icon: '📦' });
        setIsModalOpen(true);
    };

    const openEditModal = (category: CategoryWithProductCount) => {
        setEditingCategory(category);
        setFormData({ name: category.name, icon: category.icon });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: '' });
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Emoji picker (basit)
    const popularEmojis = [
        '🥩', '🌭', '🍖', '🥓', '🍗', '🧈', '🥖', '🧀',
        '🍕', '🍔', '🥪', '🌮', '🥙', '🍱', '🍜', '🍲',
        '🥗', '🍝', '🥘', '🍛', '🍣', '🍤', '🦐', '🦞',
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Kategori Yönetimi</h1>
                    <p className="text-gray-600">Ürün kategorilerini düzenleyin ve yönetin</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span>Yeni Kategori</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Kategori ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Categories List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kategori Bulunamadı</h3>
                    <p className="text-gray-600">Henüz kategori eklenmemiş veya aramanız sonuç vermedi.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Sıra
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Icon
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Kategori Adı
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ürün Sayısı
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Oluşturma Tarihi
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.displayOrder}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-3xl">{category.icon}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {category.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {category.productCount || 0} ürün
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(category.id)}
                                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${category.isActive
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Power className="w-3 h-3" />
                                            <span>{category.isActive ? 'Aktif' : 'Pasif'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Kategori Adı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori Adı *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Pastırma"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Icon Seçimi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon Seçin
                                </label>
                                <div className="flex items-center space-x-4 mb-3">
                                    <div className="text-5xl">{formData.icon || '📦'}</div>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="Emoji girin veya aşağıdan seçin"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-8 gap-2">
                                    {popularEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => setFormData({ ...formData, icon: emoji })}
                                            className={`text-3xl p-2 rounded-lg hover:bg-blue-50 transition-colors ${formData.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex space-x-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                İptal
                            </button>
                            <button
                                onClick={editingCategory ? handleUpdate : handleCreate}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                {editingCategory ? 'Güncelle' : 'Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}