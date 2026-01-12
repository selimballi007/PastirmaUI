'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BlogCategory, UpdateBlogPostRequest, BlogPost } from '@/app/types/dashboard';
import { blogService } from '@/app/lib/services/blogService';
import TipTapEditor from '@/app/components/dashboard/blog/TipTapEditor';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const postId = parseInt(params.id as string);

    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<UpdateBlogPostRequest>({
        title: '',
        content: '',
        excerpt: '',
        imageUrl: '',
        categoryId: 0,
        publishedDate: null,
        isFeatured: false,
    });

    useEffect(() => {
        fetchData();
    }, [postId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [post, categoriesData] = await Promise.all([
                blogService.getBlogPostById(postId),
                blogService.getActiveCategories(),
            ]);

            setCategories(categoriesData);
            setFormData({
                title: post.title,
                content: post.content,
                excerpt: post.excerpt,
                imageUrl: post.imageUrl || '',
                categoryId: post.categoryId,
                publishedDate: post.publishedDate,
                isFeatured: post.isFeatured,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Blog yazısı yüklenemedi');
        } finally {
            setLoading(false);
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
            setSaving(true);
            await blogService.updateBlogPost(postId, formData);
            router.push('/dashboard/blog');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Blog yazısı güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await blogService.deleteBlogPost(postId);
            router.push('/dashboard/blog');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Blog yazısı silinemedi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

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
                            <h1 className="text-3xl font-bold text-gray-900">Blog Yazısını Düzenle</h1>
                            <p className="text-gray-600 mt-1">#{postId}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            Sil
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
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
                                    setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
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
                                onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
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
                                    setFormData((prev) => ({
                                        ...prev,
                                        categoryId: parseInt(e.target.value),
                                    }))
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
                                type="text"
                                value={formData.imageUrl || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                                }
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    setFormData((prev) => ({ ...prev, imageUrl: pastedText }));
                                }}
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
                                    setFormData((prev) => ({
                                        ...prev,
                                        publishedDate: e.target.value || null,
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Boş bırakırsanız taslak olarak kalır
                            </p>
                        </div>

                        {/* Featured */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
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
