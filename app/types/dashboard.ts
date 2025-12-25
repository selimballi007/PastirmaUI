// types/dashboard.ts

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    salesChange: number;
    ordersChange: number;
    customersChange: number;
    productsChange: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    quantity: number;
    amount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export interface SalesDataPoint {
    date: string;
    sales: number;
    orders: number;
}

export interface QuickStats {
    conversionRate: number;
    averageOrderValue: number;
    activeUsers: number;
    lowStockProducts: number;
}

export interface DashboardResponse {
    stats: DashboardStats;
    recentOrders: Order[];
    salesData: SalesDataPoint[];
    quickStats: QuickStats;
}

export interface Category {
    id: number;
    name: string;
    icon: string;
}

export interface Review {
    id: number;
    productId: number;
    productName?: string;
    userId: number;
    username: string;
    rating: number;
    comment?: string;
    status: string;
    createdAt: Date;
    approvedAt?: Date;
}

export interface ReviewFilters {
    id: number;
    productId: number;
    page?: number;
    pageSize?: number;
}

export interface ProductImage {
    id?: number;
    imageUrl: string;
    displayOrder: number;
    isPrimary: boolean;
}

// Product types
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    oldPrice: number;
    categoryId: number;
    categoryName?: string;
    isCampaign: boolean;
    isBestSeller: boolean;
    isNew: boolean;
    isSpecialOffer: boolean;
    campaignOrder: number;
    bestSellerOrder: number;
    rating?: number;
    reviewCount?: number;
    salesCount?: number;
    images: ProductImage[];
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    isActive: boolean;
}

export interface UpdateProductRequest {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    isActive: boolean;
}

export interface ProductFilters {
    categoryId?: number;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    isBestSeller?: boolean;
    isCampaign?: boolean;
    limit?: number;
}

// API yanıt tipleri
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
}

// Review Status
export enum ReviewStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface UpdateReviewStatusRequest {
    status: ReviewStatus;
}

// Blog Post types
export interface BlogPost {
    id: number;
    title: string;
    content: string; // HTML from TipTap
    excerpt: string;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    authorId: number;
    authorName: string;
    publishedDate: string | null;
    isActive: boolean;
    isFeatured: boolean;
    viewCount: number;
    readTime: string;
    createdAt: string;
    updatedAt: string;
}

export interface BlogPostListItem {
    id: number;
    title: string;
    excerpt: string;
    imageUrl: string;
    categoryId: number;
    categoryName: string;
    authorName: string;
    publishedDate: string | null;
    isActive: boolean;
    isFeatured: boolean;
    viewCount: number;
    readTime: string;
    createdAt: string;
}

export interface CreateBlogPostRequest {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
    categoryId: number;
    publishedDate?: string | null;
    isFeatured?: boolean;
}

export interface UpdateBlogPostRequest {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
    categoryId: number;
    publishedDate?: string | null;
    isFeatured?: boolean;
}

export interface BlogCategory {
    id: number;
    name: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
}

export interface CreateBlogCategoryRequest {
    name: string;
    icon?: string;
    displayOrder?: number;
}

// Cloudinary Types
export interface CloudinaryImage {
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    createdAt: string;
    resourceType: string;
    usedInProducts: ProductUsage[];
    isUsedInDatabase: boolean;
}

export interface ProductUsage {
    productId: number;
    productName: string;
    usageType: 'MainImage' | 'GalleryImage';
}

export interface CloudinaryDeleteResult {
    success: boolean;
    message: string;
    updatedProducts: ProductUpdate[];
}

export interface ProductUpdate {
    productId: number;
    productName: string;
    updateType: 'MainImageRemoved' | 'GalleryImageRemoved';
}

export interface UpdateImageUrlsRequest {
    oldUrl: string;
    newUrl: string;
}