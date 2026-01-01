'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, User } from 'lucide-react';
import { blogService } from '@/app/lib/services/blogService';
import type { BlogPost } from '@/app/types/dashboard';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Number(params.id);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await blogService.getBlogPostById(postId, true);
            if (!data.isActive) {
                setError('Bu blog yazısı yayınlanmamış.');
                return;
            }
            setPost(data);
        } catch (err) {
            console.error('Error fetching blog post:', err);
            setError('Blog yazısı yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Yazı Bulunamadı</h3>
                    <p className="text-gray-600 mb-6">{error || 'İstediğiniz blog yazısı bulunamadı.'}</p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Bloga Dön
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Bloga Dön
            </Link>
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-96 overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    {post.categoryName && (
                        <div className="absolute top-6 left-6 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {post.categoryName}
                        </div>
                    )}
                    {post.isFeatured && (
                        <div className="absolute top-6 right-6 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Öne Çıkan
                        </div>
                    )}
                </div>
                <div className="p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium">{post.authorName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                                {post.publishedDate
                                    ? new Date(post.publishedDate).toLocaleDateString('tr-TR', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : 'Yayın tarihi belirtilmemiş'}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Eye className="w-4 h-4 mr-2" />
                            <span>{post.viewCount} görüntülenme</span>
                        </div>
                    </div>
                    {post.excerpt && (
                        <div className="mb-8">
                            <p className="text-xl text-gray-700 italic leading-relaxed">{post.excerpt}</p>
                        </div>
                    )}
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-strong:text-gray-900 prose-img:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-gray-700 font-semibold text-lg">{post.authorName.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{post.authorName}</p>
                                    <p className="text-sm text-gray-600">Yazar</p>
                                </div>
                            </div>
                            <Link href="/blog" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                Tüm Yazılar
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
}
