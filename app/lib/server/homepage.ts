// lib/server/homepage.ts - Server-side data fetching for homepage
import type { Product } from '@/app/types/dashboard';
import type { Testimonial, TestimonialStat } from '@/app/types/testimonial';
import { serverFetchAPI } from './api';

// Re-export testimonial types for convenience
export type { Testimonial, TestimonialStat };

// Hero slider data
export interface HeroSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    discount: string;
    image: string;
    buttonText: string;
    bgColor: string;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
    try {
        const slides = await serverFetchAPI<any[]>('hero-slide');

        // Transform API response to match HeroSlide interface
        return slides.map(slide => ({
            id: slide.id,
            title: slide.title,
            subtitle: slide.subtitle || '',
            description: slide.description || '',
            discount: slide.discount || '',
            image: slide.imageUrl,
            buttonText: slide.buttonText,
            bgColor: slide.bgColor,
        }));
    } catch (error) {
        console.error('[Server] Error fetching hero slides:', error);
        return [];
    }
}

// Categories data
export interface Category {
    name: string;
    icon: string;
    count: number;
    color: string;
}

// Color palette for categories
const categoryColors = [
    'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'bg-purple-100 text-purple-700 hover:bg-purple-200',
    'bg-pink-100 text-pink-700 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    'bg-teal-100 text-teal-700 hover:bg-teal-200',
    'bg-amber-100 text-amber-700 hover:bg-amber-200',
];

export async function getCategories(): Promise<Category[]> {
    try {
        const categories = await serverFetchAPI<any[]>('category/with-product-count');

        // Transform API response to match Category interface
        return categories
            .filter(cat => cat.isActive)
            .map((cat, index) => ({
                name: cat.name,
                icon: cat.icon || '📦',
                count: cat.productCount || 0,
                color: categoryColors[index % categoryColors.length],
            }));
    } catch (error) {
        console.error('[Server] Error fetching categories:', error);
        return [];
    }
}

// Campaign products
export async function getCampaignProducts(): Promise<Product[]> {
    try {
        const params = new URLSearchParams({
            isCampaign: 'true',
            limit: '3',
        });

        return await serverFetchAPI<Product[]>(`product?${params.toString()}`);
    } catch (error) {
        console.error('[Server] Error fetching campaign products:', error);
        return [];
    }
}

// Best sellers
export async function getBestSellers(): Promise<Product[]> {
    try {
        const params = new URLSearchParams({
            isBestSeller: 'true',
            limit: '4',
        });

        return await serverFetchAPI<Product[]>(`product?${params.toString()}`);
    } catch (error) {
        console.error('[Server] Error fetching best sellers:', error);
        return [];
    }
}

// Testimonials
// Avatar ve background color rotasyonu
const avatars = ['👨', '👩', '👨‍🦱', '👩‍🦰', '👨‍🦰', '👩‍🦱', '🧑', '👴', '👵'];
const bgColors = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
];

// Tarih formatlamak için helper
function formatReviewDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
}

export async function getTestimonials(): Promise<Testimonial[]> {
    try {
        // API'den onaylanmış yorumları çek
        const reviews = await serverFetchAPI<any[]>('review?pageSize=10');

        // Onaylanmış ve yorum içeren yorumları filtrele
        const approvedReviews = reviews
            .filter(review => review.status === 'approved' && review.comment && review.comment.trim().length > 0)
            .slice(0, 3); // İlk 3 yorumu al

        // Review verilerini Testimonial interface'ine dönüştür
        return approvedReviews.map((review, index) => ({
            id: review.id,
            name: review.username || 'Anonim Kullanıcı',
            location: review.productName || 'Müşteri', // Ürün adını lokasyon olarak kullan
            rating: review.rating,
            comment: review.comment,
            date: formatReviewDate(review.createdAt),
            verified: true, // API'den gelen onaylanmış yorumlar
            avatar: avatars[index % avatars.length],
            bgColor: bgColors[index % bgColors.length],
        }));
    } catch (error) {
        console.error('[Server] Error fetching testimonials:', error);
        // Hata durumunda boş array döndür
        return [];
    }
}

// Blog posts
export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    categoryColor: string;
    date: string;
    readTime: string;
    author: string;
}

// Helper function to get category color
function getCategoryColor(categoryName: string): string {
    const colorMap: Record<string, string> = {
        'Tarif': 'bg-orange-100 text-orange-700',
        'Bilgi': 'bg-emerald-100 text-emerald-700',
        'Öneri': 'bg-blue-100 text-blue-700',
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-700';
}

// Helper function to format date
function formatBlogDate(dateString: string | null): string {
    if (!dateString) return 'Tarih belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        // Get all active blog posts (not just featured)
        const posts = await serverFetchAPI<any[]>('blog-post?includeInactive=false');

        // Transform API response to match BlogPost interface
        return posts.slice(0, 3).map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            image: post.imageUrl,
            category: post.categoryName,
            categoryColor: getCategoryColor(post.categoryName),
            date: formatBlogDate(post.publishedDate || post.createdAt),
            readTime: post.readTime,
            author: post.authorName,
        }));
    } catch (error) {
        console.error('[Server] Error fetching blog posts:', error);
        return [];
    }
}

// Testimonial stats
export async function getTestimonialStats(): Promise<TestimonialStat[]> {
    try {
        // API'den tüm onaylanmış yorumları çek
        const reviews = await serverFetchAPI<any[]>('review?pageSize=1000');

        // Onaylanmış yorumları filtrele
        const approvedReviews = reviews.filter(review => review.status === 'approved');

        // İstatistikleri hesapla
        const totalReviews = approvedReviews.length;

        // Ortalama puan hesapla
        const avgRating = totalReviews > 0
            ? (approvedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews)
            : 0;

        // 4 ve üzeri puan verenlerin oranı (tavsiye oranı)
        const highRatings = approvedReviews.filter(review => review.rating >= 4).length;
        const recommendationRate = totalReviews > 0
            ? Math.round((highRatings / totalReviews) * 100)
            : 0;

        // Müşteri sayısını tahmin et (her review farklı kullanıcıdan gelebilir)
        // Basit bir yaklaşım olarak review sayısını kullanıyoruz
        const customerCount = totalReviews > 1000
            ? `${Math.floor(totalReviews / 1000)}K+`
            : totalReviews.toString();

        return [
            { value: customerCount, label: 'Mutlu Müşteri', color: 'text-indigo-600' },
            { value: avgRating.toFixed(1), label: 'Ortalama Puan', color: 'text-emerald-600' },
            { value: totalReviews > 1000 ? `${Math.floor(totalReviews / 1000)}K+` : totalReviews.toString(), label: 'Ürün Yorumu', color: 'text-purple-600' },
            { value: `${recommendationRate}%`, label: 'Tavsiye Oranı', color: 'text-amber-600' },
        ];
    } catch (error) {
        console.error('[Server] Error fetching testimonial stats:', error);
        // Hata durumunda varsayılan değerler döndür
        return [
            { value: '0', label: 'Mutlu Müşteri', color: 'text-indigo-600' },
            { value: '0.0', label: 'Ortalama Puan', color: 'text-emerald-600' },
            { value: '0', label: 'Ürün Yorumu', color: 'text-purple-600' },
            { value: '0%', label: 'Tavsiye Oranı', color: 'text-amber-600' },
        ];
    }
}
