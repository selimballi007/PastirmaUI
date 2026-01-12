'use client';

import { BlogPostListItem } from '@/app/types/dashboard';
import { Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import Image from 'next/image';

interface BlogCardProps {
    post: BlogPostListItem;
    onEdit: (id: number) => void;
    onDelete: (post: BlogPostListItem) => void;
    onToggleStatus: (post: BlogPostListItem) => void;
    onToggleFeatured: (post: BlogPostListItem) => void;
}

export default function BlogCard({
    post,
    onEdit,
    onDelete,
    onToggleStatus,
    onToggleFeatured,
}: BlogCardProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Taslak';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {post.imageUrl ? (
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Görsel yok
                    </div>
                )}
                {/* Featured badge */}
                {post.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Öne Çıkan
                    </div>
                )}
                {/* Status badge */}
                <div
                    className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        post.isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                    }`}
                >
                    {post.isActive ? 'Aktif' : 'Pasif'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {truncate(post.excerpt, 150)}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.categoryName}
                    </span>
                    <span>👤 {post.authorName}</span>
                    <span>📅 {formatDate(post.publishedDate)}</span>
                    <span>⏱️ {post.readTime}</span>
                    <span>👁️ {post.viewCount} görüntülenme</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                        onClick={() => onEdit(post.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        title="Düzenle"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Düzenle</span>
                    </button>

                    <button
                        onClick={() => onToggleStatus(post)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors text-sm ${
                            post.isActive
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={post.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    >
                        {post.isActive ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        onClick={() => onToggleFeatured(post)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors text-sm ${
                            post.isFeatured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={post.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
                    >
                        <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={() => onDelete(post)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        title="Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
