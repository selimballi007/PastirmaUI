'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogPostListItem, BlogCategory } from '@/app/types/dashboard';
import { blogService } from '@/app/lib/services/blogService';
import BlogCard from '@/app/components/dashboard/blog/BlogCard';
import { Plus, Search, AlertCircle, XCircle } from 'lucide-react';

export default function BlogManagementPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPostListItem[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPostListItem[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'published'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [posts, searchTerm, selectedCategory, selectedStatus]);

    const fetchData = async () => {
        try {
            setError(null);
            setLoading(true);
            const [postsData, categoriesData] = await Promise.all([
                blogService.getBlogPosts(true),
                blogService.getBlogCategories(true),
            ]);
            setPosts(postsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const filterPosts = () => {
        let filtered = [...posts];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((post) => post.categoryId === parseInt(selectedCategory));
        }

        // Status filter
        if (selectedStatus === 'draft') {
            filtered = filtered.filter((post) => !post.publishedDate);
        } else if (selectedStatus === 'published') {
            filtered = filtered.filter((post) => post.publishedDate !== null);
        }

        setFilteredPosts(filtered);
    };

    const handleDelete = async (post: BlogPostListItem) => {
        if (!confirm(`"${post.title}" başlıklı blog yazısını silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            await blogService.deleteBlogPost(post.id);
            setPosts(posts.filter((p) => p.id !== post.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Silme işlemi başarısız');
        }
    };

    const handleToggleStatus = async (post: BlogPostListItem) => {
        try {
            await blogService.togglePostStatus(post.id);
            setPosts(
                posts.map((p) => (p.id === post.id ? { ...p, isActive: !p.isActive } : p))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Durum değiştirme başarısız');
        }
    };

    const handleToggleFeatured = async (post: BlogPostListItem) => {
        try {
            await blogService.toggleFeatured(post.id);
            setPosts(
                posts.map((p) => (p.id === post.id ? { ...p, isFeatured: !p.isFeatured } : p))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Öne çıkarma durumu değiştirilemedi');
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
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Yönetimi</h1>
                        <p className="text-gray-600 mt-1">
                            {posts.length} blog yazısı bulunuyor
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/blog/create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Blog Yazısı
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                            <p className="text-red-800">{error}</p>
                        </div>
                        <button onClick={() => setError(null)}>
                            <XCircle className="w-5 h-5 text-red-600 hover:text-red-800" />
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Başlık veya içerik ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tüm Kategoriler</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="published">Yayınlanmış</option>
                            <option value="draft">Taslak</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500 text-lg">Henüz blog yazısı bulunmuyor.</p>
                    <button
                        onClick={() => router.push('/dashboard/blog/create')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        İlk Blog Yazısını Oluştur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            onEdit={(id) => router.push(`/dashboard/blog/${id}/edit`)}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                            onToggleFeatured={handleToggleFeatured}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
