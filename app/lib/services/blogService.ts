// services/blogService.ts
'use client';

import { fetchAPI } from '@/app/lib/api/client';
import type {
    BlogPost,
    BlogPostListItem,
    CreateBlogPostRequest,
    UpdateBlogPostRequest,
    BlogCategory,
    CreateBlogCategoryRequest
} from '@/app/types/dashboard';

// Blog Post API functions
export const blogService = {
    /**
     * Get all blog posts
     * GET /blog-post
     */
    async getBlogPosts(includeInactive = false): Promise<BlogPostListItem[]> {
        const params = includeInactive ? '?includeInactive=true' : '?includeInactive=false';
        return await fetchAPI<BlogPostListItem[]>(`blog-post${params}`);
    },

    /**
     * Get blog post by ID
     * GET /blog-post/{id}
     */
    async getBlogPostById(id: number, incrementView = false): Promise<BlogPost> {
        const params = incrementView ? '?incrementView=true' : '?incrementView=false';
        return await fetchAPI<BlogPost>(`blog-post/${id}${params}`);
    },

    /**
     * Create new blog post
     * POST /blog-post
     */
    async createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost> {
        return await fetchAPI<BlogPost>('blog-post', {
            method: 'POST',
            body: JSON.stringify(post),
        });
    },

    /**
     * Update blog post
     * PUT /blog-post/{id}
     */
    async updateBlogPost(id: number, post: UpdateBlogPostRequest): Promise<BlogPost> {
        return await fetchAPI<BlogPost>(`blog-post/${id}`, {
            method: 'PUT',
            body: JSON.stringify(post),
        });
    },

    /**
     * Delete blog post
     * DELETE /blog-post/{id}
     */
    async deleteBlogPost(id: number): Promise<void> {
        await fetchAPI(`blog-post/${id}`, { method: 'DELETE' });
    },

    /**
     * Toggle blog post status (active/inactive)
     * PUT /blog-post/{id}/toggle-status
     */
    async togglePostStatus(id: number): Promise<void> {
        await fetchAPI(`blog-post/${id}/toggle-status`, { method: 'PUT' });
    },

    /**
     * Toggle blog post featured status
     * PUT /blog-post/{id}/toggle-featured
     */
    async toggleFeatured(id: number): Promise<void> {
        await fetchAPI(`blog-post/${id}/toggle-featured`, { method: 'PUT' });
    },

    /**
     * Get published blog posts (for public viewing)
     * GET /blog-post/published
     */
    async getPublishedPosts(): Promise<BlogPostListItem[]> {
        return await fetchAPI<BlogPostListItem[]>('blog-post/published');
    },

    /**
     * Get featured blog posts (for homepage)
     * GET /blog-post/featured
     */
    async getFeaturedPosts(): Promise<BlogPostListItem[]> {
        return await fetchAPI<BlogPostListItem[]>('blog-post/featured');
    },

    // Blog Category functions

    /**
     * Get all blog categories
     * GET /blog-category
     */
    async getBlogCategories(includeInactive = false): Promise<BlogCategory[]> {
        const params = includeInactive ? '?includeInactive=true' : '?includeInactive=false';
        return await fetchAPI<BlogCategory[]>(`blog-category${params}`);
    },

    /**
     * Get blog category by ID
     * GET /blog-category/{id}
     */
    async getBlogCategoryById(id: number): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>(`blog-category/${id}`);
    },

    /**
     * Create new blog category
     * POST /blog-category
     */
    async createBlogCategory(category: CreateBlogCategoryRequest): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>('blog-category', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    },

    /**
     * Update blog category
     * PUT /blog-category/{id}
     */
    async updateBlogCategory(id: number, category: CreateBlogCategoryRequest): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>(`blog-category/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category),
        });
    },

    /**
     * Delete blog category
     * DELETE /blog-category/{id}
     */
    async deleteBlogCategory(id: number): Promise<void> {
        await fetchAPI(`blog-category/${id}`, { method: 'DELETE' });
    },

    /**
     * Get active blog categories
     * GET /blog-category/active
     */
    async getActiveCategories(): Promise<BlogCategory[]> {
        return await fetchAPI<BlogCategory[]>('blog-category/active');
    },
};
