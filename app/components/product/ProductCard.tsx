// components/product/ProductCard.tsx (Güncellenmiş)
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/lib/store/authStore';
import { useFavoriteStore } from '@/app/lib/store/favoriteStore';
import {
    ShoppingCart,
    Heart,
    Eye,
    Star,
    Package,
    TrendingUp,
    MessageCircle,
} from 'lucide-react';

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    imageUrl: string;
    rating?: number;
    reviews?: number;
    sales?: number;
    stock?: number;
    categoryName?: string;
    isBestSeller?: boolean;
    isNew?: boolean;
    isSpecialOffer?: boolean;
    badge?: string;
    badgeColor?: string;
    onAddToCart?: (id: number) => void;
    onQuickView?: (id: number) => void;
    variant?: 'default' | 'compact' | 'detailed';
    showReviews?: boolean; // ✅ Yeni prop
}

export default function ProductCard({
    id,
    name,
    price,
    oldPrice,
    imageUrl,
    rating = 0,
    reviews = 0,
    sales = 0,
    stock,
    categoryName,
    isBestSeller,
    isNew,
    isSpecialOffer,
    badge,
    badgeColor,
    onAddToCart,
    onQuickView,
    variant = 'default',
    showReviews = true, // ✅ Default true
}: ProductCardProps) {
    const user = useAuthStore((state) => state.user);
    const isFavorite = useFavoriteStore((state) => state.isFavorite(id));
    const addToFavorites = useFavoriteStore((state) => state.addToFavorites);
    const removeFromFavorites = useFavoriteStore((state) => state.removeFromFavorites);

    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }

        try {
            setFavoriteLoading(true);

            if (isFavorite) {
                await removeFromFavorites(id);
            } else {
                await addToFavorites(id);
            }
        } catch (error: any) {
            alert(error.message || 'Bir hata oluştu.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const calculateDiscount = () => {
        if (oldPrice && oldPrice > price) {
            return Math.round(((oldPrice - price) / oldPrice) * 100);
        }
        return 0;
    };

    const discount = calculateDiscount();

    const getBadge = () => {
        if (badge) return { text: badge, color: badgeColor || 'bg-orange-500' };
        if (isBestSeller) return { text: 'Çok Satan', color: 'bg-orange-500' };
        if (isSpecialOffer) return { text: 'Fırsat', color: 'bg-emerald-500' };
        if (isNew) return { text: 'Yeni', color: 'bg-blue-500' };
        return null;
    };

    const productBadge = getBadge();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart?.(id);
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView?.(id);
    };

    // ✅ Yıldız renderı için helper component
    const StarRating = ({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) => (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`${size} ${i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < rating
                            ? 'fill-amber-200 text-amber-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                />
            ))}
        </div>
    );

    // ✅ Yorum badge'i
    const ReviewsBadge = ({ reviews, compact = false }: { reviews: number; compact?: boolean }) => {
        if (reviews === 0) return null;

        return (
            <div className="flex items-center space-x-1 text-gray-600">
                <MessageCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                <span className={compact ? 'text-xs' : 'text-sm'}>
                    {reviews} {compact ? '' : 'yorum'}
                </span>
            </div>
        );
    };

    // Compact variant
    if (variant === 'compact') {
        return (
            <Link href={`/products/${id}`}>
                <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 hover:border-gray-300">
                    <div className="relative h-40 bg-gray-100">
                        {imageError ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-300" />
                            </div>
                        ) : (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={() => setImageError(true)}
                            />
                        )}
                        {discount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                %{discount}
                            </div>
                        )}
                    </div>
                    <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-2">
                            {name}
                        </h3>

                        {/* ✅ Rating - Compact */}
                        {showReviews && rating > 0 && (
                            <div className="flex items-center space-x-2 mb-2">
                                <StarRating rating={rating} size="w-3 h-3" />
                                {reviews > 0 && (
                                    <span className="text-xs text-gray-500">({reviews})</span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-lg font-bold text-gray-900">
                                    {price.toFixed(2)}₺
                                </span>
                                {oldPrice && (
                                    <span className="ml-1 text-xs text-gray-500 line-through">
                                        {oldPrice.toFixed(2)}₺
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Detailed variant
    if (variant === 'detailed') {
        return (
            <Link href={`/products/${id}`}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative h-72 bg-gray-100 overflow-hidden">
                        {imageError ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-300" />
                            </div>
                        ) : (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={() => setImageError(true)}
                            />
                        )}

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col space-y-2">
                            {discount > 0 && (
                                <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                    %{discount} İNDİRİM
                                </div>
                            )}
                            {productBadge && (
                                <div className={`${productBadge.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                                    {productBadge.text}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleToggleFavorite}
                                disabled={favoriteLoading}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg disabled:opacity-50"
                            >
                                <Heart
                                    className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                                        } ${favoriteLoading ? 'animate-pulse' : ''}`}
                                />
                            </button>
                            {onQuickView && (
                                <button
                                    onClick={handleQuickView}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                                >
                                    <Eye className="w-5 h-5 text-gray-700" />
                                </button>
                            )}
                        </div>

                        {/* Stock warning */}
                        {stock !== undefined && stock < 10 && stock > 0 && (
                            <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Son {stock} adet!
                            </div>
                        )}
                        {stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                                    Tükendi
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        {categoryName && (
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                {categoryName}
                            </span>
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {name}
                        </h3>

                        {/* ✅ Rating & Reviews & Sales - Detailed */}
                        {showReviews && (rating > 0 || reviews > 0 || sales > 0) && (
                            <div className="space-y-2 mb-4">
                                {/* Rating */}
                                {rating > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <StarRating rating={rating} />
                                        <span className="text-sm font-semibold text-gray-900">
                                            {rating.toFixed(1)}
                                        </span>
                                        {reviews > 0 && (
                                            <span className="text-sm text-gray-500">
                                                ({reviews} değerlendirme)
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Reviews & Sales */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {reviews > 0 && <ReviewsBadge reviews={reviews} />}
                                    {sales > 0 && (
                                        <div className="flex items-center space-x-1">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>{sales}+ satış</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {price.toFixed(2)}₺
                                </span>
                                {oldPrice && (
                                    <span className="ml-2 text-gray-500 line-through">
                                        {oldPrice.toFixed(2)}₺
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={stock === 0}
                            className="w-full px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>{stock === 0 ? 'Tükendi' : 'Sepete Ekle'}</span>
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // Default variant
    return (
        <Link href={`/products/${id}`}>
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-gray-100 hover:border-gray-300">
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {imageError ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                        </div>
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                            %{discount}
                        </div>
                    )}

                    {/* Product Badge */}
                    {productBadge && (
                        <div className={`absolute top-4 right-4 ${productBadge.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                            {productBadge.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleToggleFavorite}
                            disabled={favoriteLoading}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg disabled:opacity-50"
                            title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        >
                            <Heart
                                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                                    } ${favoriteLoading ? 'animate-pulse' : ''}`}
                            />
                        </button>
                        {onQuickView && (
                            <button
                                onClick={handleQuickView}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                            >
                                <Eye className="w-5 h-5 text-gray-700" />
                            </button>
                        )}
                    </div>

                    {/* Sales Badge (bottom left) */}
                    {sales > 0 && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                            {sales}+ satış
                        </div>
                    )}
                </div>

                <div className="p-5">
                    {categoryName && (
                        <span className="text-xs text-gray-500 font-medium uppercase">
                            {categoryName}
                        </span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {name}
                    </h3>

                    {/* ✅ Rating & Reviews - Default */}
                    {showReviews && (rating > 0 || reviews > 0) && (
                        <div className="mb-3 space-y-1">
                            {rating > 0 && (
                                <div className="flex items-center space-x-2">
                                    <StarRating rating={rating} />
                                    <span className="text-sm font-semibold text-gray-900">
                                        {rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {reviews > 0 && (
                                <ReviewsBadge reviews={reviews} compact />
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-xl font-bold text-gray-900">
                                {price.toFixed(2)}₺
                            </span>
                            {oldPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                    {oldPrice.toFixed(2)}₺
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stock Info */}
                    {stock !== undefined && (
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Package className="w-4 h-4 mr-1" />
                            <span>
                                {stock === 0
                                    ? 'Tükendi'
                                    : stock < 10
                                        ? `Son ${stock} adet`
                                        : 'Stokta var'}
                            </span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>{stock === 0 ? 'Tükendi' : 'Sepete Ekle'}</span>
                    </button>
                </div>
            </div>
        </Link>
    );
}