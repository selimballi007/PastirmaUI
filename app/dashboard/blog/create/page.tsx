'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogCategory, CreateBlogPostRequest } from '@/app/types/dashboard';
import { blogService } from '@/app/lib/services/blogService';
import TipTapEditor from '@/app/components/dashboard/blog/TipTapEditor';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateBlogPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateBlogPostRequest>({
        title: '',
        content: '',
        excerpt: '',
        imageUrl: '',
        categoryId: 0,
        publishedDate: null,
        isFeatured: false,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await blogService.getActiveCategories();
            setCategories(data);
            if (data.length > 0) {
                setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
            }
        } catch (err) {
            setError('Kategoriler yüklenemedi');
        }
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            setError('Başlık gereklidir');
            return false;
        }
        if (!formData.excerpt.trim() || formData.excerpt.length > 500) {
            setError('Özet gereklidir ve 500 karakterden kısa olmalıdır');
            return false;
        }
        if (!formData.content.trim()) {
            setError('İçerik gereklidir');
            return false;
        }
        if (!formData.categoryId) {
            setError('Kategori seçiniz');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await blogService.createBlogPost(formData);
            router.push('/dashboard/blog');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Blog yazısı oluşturulamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Yeni Blog Yazısı</h1>
                            <p className="text-gray-600 mt-1">Blog yazısı oluştur</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Başlık *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="Blog başlığı..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Özet * (Max 500 karakter)
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) =>
                                    setFormData({ ...formData, excerpt: e.target.value })
                                }
                                placeholder="Kısa özet..."
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.excerpt.length}/500 karakter
                            </p>
                        </div>

                        {/* Content Editor */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                İçerik *
                            </label>
                            <TipTapEditor
                                content={formData.content}
                                onChange={(html) => setFormData({ ...formData, content: html })}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: parseInt(e.target.value),
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value={0}>Kategori seçin</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Image URL */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Görsel URL
                            </label>
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, imageUrl: e.target.value })
                                }
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {formData.imageUrl && (
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="mt-3 w-full h-40 object-cover rounded-lg"
                                />
                            )}
                        </div>

                        {/* Published Date */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yayın Tarihi
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.publishedDate || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        publishedDate: e.target.value || null,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Boş bırakırsanız taslak olarak kaydedilir
                            </p>
                        </div>

                        {/* Featured */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isFeatured: e.target.checked })
                                    }
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700">
                                        Öne Çıkan
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        Ana sayfada gösterilsin
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
