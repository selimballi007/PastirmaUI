// components/home/sections/BlogPostsSection.tsx
import BlogPosts from '@/app/components/home/BlogPosts';
import { getBlogPosts } from '@/app/lib/server/homepage';

export default async function BlogPostsSection() {
    const posts = await getBlogPosts();
    return <BlogPosts blogPosts={posts} />;
}
