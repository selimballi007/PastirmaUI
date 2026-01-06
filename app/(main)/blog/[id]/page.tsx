import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, User } from 'lucide-react';
import { serverFetchAPI } from '@/app/lib/server/api';
import type { BlogPost } from '@/app/types/dashboard';
import type { Metadata } from 'next';

interface Props {
    params: {
        id: string;
    };
}

// Fetch blog post server-side
async function getBlogPost(id: number, incrementView: boolean = false): Promise<BlogPost | null> {
    try {
        const endpoint = incrementView ? `blog-post/${id}?incrementView=true` : `blog-post/${id}`;
        const post = await serverFetchAPI<BlogPost>(endpoint);

        // Only return active posts to public
        if (!post.isActive) {
            return null;
        }

        return post;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const post = await getBlogPost(parseInt(id), false);

    if (!post) {
        return {
            title: 'Blog Yazısı Bulunamadı',
        };
    }

    return {
        title: `${post.title} - Pastırma Blog`,
        description: post.excerpt || post.title,
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            images: [post.imageUrl],
            type: 'article',
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            authors: [post.authorName],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.title,
            images: [post.imageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { id } = await params;
    const postId = parseInt(id);
    const post = await getBlogPost(postId, true); // Increment view count

    if (!post) {
        notFound();
    }

    // Article Schema (JSON-LD) for SEO
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.imageUrl,
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: {
            '@type': 'Person',
            name: post.authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Pastırma',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
            },
        },
        description: post.excerpt || post.title,
        articleBody: post.content,
        ...(post.categoryName && {
            articleSection: post.categoryName,
        }),
    };

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Article Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Bloga Dön
            </Link>

            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-96 overflow-hidden">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
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
                            <span>{new Date(post.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{post.readTime || '5'} dk okuma</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Eye className="w-4 h-4 mr-2" />
                            <span>{post.viewCount} görüntülenme</span>
                        </div>
                    </div>

                    {post.excerpt && (
                        <div className="text-xl text-gray-700 mb-8 leading-relaxed font-medium">
                            {post.excerpt}
                        </div>
                    )}

                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            <div className="mt-8 text-center">
                <Link
                    href="/blog"
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tüm Blog Yazılarını Gör
                </Link>
            </div>
        </main>
    );
}
