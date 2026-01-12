import { fetchAPI } from '@/app/lib/api/client';
import type {
    CloudinaryImage,
    CloudinaryDeleteResult,
    ProductUsage,
    UpdateImageUrlsRequest
} from '@/app/types/dashboard';

/**
 * Extract Cloudinary public ID from a full Cloudinary URL
 * Example: https://res.cloudinary.com/dngul4236/image/upload/v1767030395/products/lb8rkagg25sibslzfbeb.jpg
 * Returns: products/lb8rkagg25sibslzfbeb
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
    try {
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
        const match = cloudinaryUrl.match(regex);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

export const cloudinaryService = {
    /**
     * Get all images from Cloudinary with database usage tracking
     */
    async getAllImages(): Promise<CloudinaryImage[]> {
        return await fetchAPI<CloudinaryImage[]>('cloudinary/images');
    },

    /**
     * Get products using a specific image URL
     */
    async getImageUsage(imageUrl: string): Promise<ProductUsage[]> {
        const encodedUrl = encodeURIComponent(imageUrl);
        return await fetchAPI<ProductUsage[]>(`cloudinary/images/usage?imageUrl=${encodedUrl}`);
    },

    /**
     * Delete an image from Cloudinary and optionally update database references
     */
    async deleteImage(publicId: string, updateDatabase: boolean = true): Promise<CloudinaryDeleteResult> {
        return await fetchAPI<CloudinaryDeleteResult>(
            `cloudinary/images/${encodeURIComponent(publicId)}?updateDatabase=${updateDatabase}`,
            {
                method: 'DELETE',
            }
        );
    },

    /**
     * Update product image URLs when Cloudinary URL changes
     */
    async updateImageUrls(oldUrl: string, newUrl: string): Promise<{ message: string }> {
        const request: UpdateImageUrlsRequest = { oldUrl, newUrl };
        return await fetchAPI<{ message: string }>(
            'cloudinary/images/update-urls',
            {
                method: 'PUT',
                body: JSON.stringify(request),
            }
        );
    },
};
