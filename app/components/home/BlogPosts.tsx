// components/home/BlogPosts.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/app/lib/server/homepage';

interface BlogPostsProps {
    blogPosts: BlogPost[];
}

export default function BlogPosts({ blogPosts }: BlogPostsProps) {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full mb-4">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Blog & Haberler</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Şarküteri Dünyası
                        </h2>
                    </div>
                    <Link
                        href="/blog"
                        className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                        Tüm Yazılar
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                                    />
                                    <div className={`absolute top-4 left-4 z-10 ${post.categoryColor} px-3 py-1 rounded-full text-sm font-semibold`}>
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                                                <span className="text-gray-700 font-semibold text-xs">
                                                    {post.author.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium">{post.author}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}