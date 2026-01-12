// types/user.ts - User and customer-related type definitions

/**
 * Authenticated user session data (stored in auth store)
 */
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

/**
 * Complete user profile with additional details
 */
export interface UserProfile {
    id: number;
    email: string;
    username: string | null;
    fullName: string | null;
    isVerified: boolean;
    role: string;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface Customer {
    id: number;
    email: string;
    username: string | null;
    fullName: string | null;
    isVerified: boolean;
    isGuest: boolean;
    role: string;
    lastLoginAt: string | null;
    createdAt: string;
    totalOrders: number;
    totalReviews: number;
}
