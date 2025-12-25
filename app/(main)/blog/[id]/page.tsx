import { notFound } from 'next/navigation';
import Image from 'next/image';
import { buildApiUrl, parseFetchResponse } from '@/app/lib/utils/fetch';
import { Clock, Eye, Calendar, User } from 'lucide-react';

interface BlogPostDetail {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
    categoryName: string;
    authorName: string;
    publishedDate: string | null;
    viewCount: number;
    readTime: string;
    createdAt: string;
}

async function getBlogPost(id: number): Promise<BlogPostDetail | null> {
    try {
        const url = buildApiUrl(`BlogPost/${id}?incrementView=true`);
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            return null;
        }

        return await parseFetchResponse<BlogPostDetail>(response);
    } catch (error) {
        console.error('[Server] Error fetching blog post:', error);
        return null;
    }
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Tarih belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
    const postId = parseInt(params.id);
    const post = await getBlogPost(postId);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {post.categoryName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewCount} görüntülenme
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-3 text-gray-600">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{post.authorName}</span>
                    </div>
                </div>

                {/* Featured Image */}
                {post.imageUrl && (
                    <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Excerpt */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
                    <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Author Info */}
                <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {post.authorName}
                            </h3>
                            <p className="text-gray-600">Yazar</p>
                        </div>
                    </div>
                </div>

                {/* Back to Blog List */}
                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Ana Sayfaya Dön
                    </a>
                </div>
            </div>
        </div>
    );
}
