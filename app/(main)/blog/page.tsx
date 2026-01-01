'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Search, Filter } from 'lucide-react';
import { blogService } from '@/app/lib/services/blogService';
import type { BlogPostListItem, BlogCategory } from '@/app/types/dashboard';

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPostListItem[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postsData, categoriesData] = await Promise.all([
                blogService.getBlogPosts(false), // Get all active blog posts
                blogService.getActiveCategories(),
            ]);
            console.log('📚 Blog posts fetched:', postsData.length, postsData);
            setPosts(postsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching blog data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter posts based on category and search
    const filteredPosts = posts.filter((post) => {
        const matchesCategory = selectedCategory === null || post.categoryId === selectedCategory;
        const matchesSearch =
            searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ana Sayfaya Dön
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full mb-4">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Blog & Haberler</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Şarküteri Dünyası</h1>
                        <p className="text-gray-600 mt-2">
                            Pastırma, sucuk ve şarküteri ürünleri hakkında her şey
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Blog yazılarında ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>

                {/* Category Filter */}
                <div className="md:w-64">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                        >
                            <option value="">Tüm Kategoriler</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="mb-8 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        selectedCategory === null
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Tümü ({posts.length})
                </button>
                {categories.map((category) => {
                    const count = posts.filter((p) => p.categoryId === category.id).length;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                selectedCategory === category.id
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category.name} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Yazı Bulunamadı</h3>
                    <p className="text-gray-600">
                        {searchQuery || selectedCategory
                            ? 'Arama kriterlerinize uygun yazı bulunamadı.'
                            : 'Henüz yayınlanmış blog yazısı bulunmuyor.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => {
                        const category = categories.find((c) => c.id === post.categoryId);
                        return (
                            <Link key={post.id} href={`/blog/${post.id}`} className="group">
                                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {category && (
                                            <div
                                                className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold text-white"
                                                style={{ backgroundColor: category.color || '#3B82F6' }}
                                            >
                                                {category.name}
                                            </div>
                                        )}
                                        {post.isFeatured && (
                                            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                Öne Çıkan
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                                                    <span className="text-gray-700 font-semibold text-xs">
                                                        {post.authorName.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-medium">{post.authorName}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span>
                                                    {post.publishedDate
                                                        ? new Date(post.publishedDate).toLocaleDateString('tr-TR')
                                                        : 'Taslak'}
                                                </span>
                                                <span>•</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                        {post.viewCount > 0 && (
                                            <div className="mt-3 text-sm text-gray-500">
                                                {post.viewCount} görüntülenme
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Results Count */}
            {filteredPosts.length > 0 && (
                <div className="mt-8 text-center text-gray-600">
                    <p>
                        Toplam <span className="font-semibold text-gray-900">{filteredPosts.length}</span> yazı
                        gösteriliyor
                        {searchQuery && ` "${searchQuery}" araması için`}
                        {selectedCategory && ` "${categories.find((c) => c.id === selectedCategory)?.name}" kategorisinde`}
                    </p>
                </div>
            )}
        </main>
    );
}
