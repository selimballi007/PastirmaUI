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
     * GET /BlogPost
     */
    async getBlogPosts(includeInactive = false): Promise<BlogPostListItem[]> {
        const params = includeInactive ? '?includeInactive=true' : '?includeInactive=false';
        return await fetchAPI<BlogPostListItem[]>(`BlogPost${params}`);
    },

    /**
     * Get blog post by ID
     * GET /BlogPost/{id}
     */
    async getBlogPostById(id: number, incrementView = false): Promise<BlogPost> {
        const params = incrementView ? '?incrementView=true' : '?incrementView=false';
        return await fetchAPI<BlogPost>(`BlogPost/${id}${params}`);
    },

    /**
     * Create new blog post
     * POST /BlogPost
     */
    async createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost> {
        return await fetchAPI<BlogPost>('BlogPost', {
            method: 'POST',
            body: JSON.stringify(post),
        });
    },

    /**
     * Update blog post
     * PUT /BlogPost/{id}
     */
    async updateBlogPost(id: number, post: UpdateBlogPostRequest): Promise<BlogPost> {
        return await fetchAPI<BlogPost>(`BlogPost/${id}`, {
            method: 'PUT',
            body: JSON.stringify(post),
        });
    },

    /**
     * Delete blog post
     * DELETE /BlogPost/{id}
     */
    async deleteBlogPost(id: number): Promise<void> {
        await fetchAPI(`BlogPost/${id}`, { method: 'DELETE' });
    },

    /**
     * Toggle blog post status (active/inactive)
     * PUT /BlogPost/{id}/toggle-status
     */
    async togglePostStatus(id: number): Promise<void> {
        await fetchAPI(`BlogPost/${id}/toggle-status`, { method: 'PUT' });
    },

    /**
     * Toggle blog post featured status
     * PUT /BlogPost/{id}/toggle-featured
     */
    async toggleFeatured(id: number): Promise<void> {
        await fetchAPI(`BlogPost/${id}/toggle-featured`, { method: 'PUT' });
    },

    /**
     * Get published blog posts (for public viewing)
     * GET /BlogPost/published
     */
    async getPublishedPosts(): Promise<BlogPostListItem[]> {
        return await fetchAPI<BlogPostListItem[]>('BlogPost/published');
    },

    /**
     * Get featured blog posts (for homepage)
     * GET /BlogPost/featured
     */
    async getFeaturedPosts(): Promise<BlogPostListItem[]> {
        return await fetchAPI<BlogPostListItem[]>('BlogPost/featured');
    },

    // Blog Category functions

    /**
     * Get all blog categories
     * GET /BlogCategory
     */
    async getBlogCategories(includeInactive = false): Promise<BlogCategory[]> {
        const params = includeInactive ? '?includeInactive=true' : '?includeInactive=false';
        return await fetchAPI<BlogCategory[]>(`BlogCategory${params}`);
    },

    /**
     * Get blog category by ID
     * GET /BlogCategory/{id}
     */
    async getBlogCategoryById(id: number): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>(`BlogCategory/${id}`);
    },

    /**
     * Create new blog category
     * POST /BlogCategory
     */
    async createBlogCategory(category: CreateBlogCategoryRequest): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>('BlogCategory', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    },

    /**
     * Update blog category
     * PUT /BlogCategory/{id}
     */
    async updateBlogCategory(id: number, category: CreateBlogCategoryRequest): Promise<BlogCategory> {
        return await fetchAPI<BlogCategory>(`BlogCategory/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category),
        });
    },

    /**
     * Delete blog category
     * DELETE /BlogCategory/{id}
     */
    async deleteBlogCategory(id: number): Promise<void> {
        await fetchAPI(`BlogCategory/${id}`, { method: 'DELETE' });
    },

    /**
     * Get active blog categories
     * GET /BlogCategory/active
     */
    async getActiveCategories(): Promise<BlogCategory[]> {
        return await fetchAPI<BlogCategory[]>('BlogCategory/active');
    },
};
