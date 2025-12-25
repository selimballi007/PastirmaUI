import { fetchAPI } from '@/app/lib/api/client';
import type {
    CloudinaryImage,
    CloudinaryDeleteResult,
    ProductUsage,
    UpdateImageUrlsRequest
} from '@/app/types/dashboard';

export const cloudinaryService = {
    /**
     * Get all images from Cloudinary with database usage tracking
     */
    async getAllImages(): Promise<CloudinaryImage[]> {
        return await fetchAPI<CloudinaryImage[]>('Cloudinary/images');
    },

    /**
     * Get products using a specific image URL
     */
    async getImageUsage(imageUrl: string): Promise<ProductUsage[]> {
        const encodedUrl = encodeURIComponent(imageUrl);
        return await fetchAPI<ProductUsage[]>(`Cloudinary/images/usage?imageUrl=${encodedUrl}`);
    },

    /**
     * Delete an image from Cloudinary and optionally update database references
     */
    async deleteImage(publicId: string, updateDatabase: boolean = true): Promise<CloudinaryDeleteResult> {
        return await fetchAPI<CloudinaryDeleteResult>(
            `Cloudinary/images/${encodeURIComponent(publicId)}?updateDatabase=${updateDatabase}`,
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
            'Cloudinary/images/update-urls',
            {
                method: 'PUT',
                body: JSON.stringify(request),
            }
        );
    },
};
