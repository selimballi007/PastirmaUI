// app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productService } from '@/app/lib/services/productService';
import { reviewService } from '@/app/lib/services/reviewService';
import { useAuthStore } from '@/app/lib/store/authStore';
import { useFavoriteStore } from '@/app/lib/store/favoriteStore';
import ProductCard from '@/app/components/product/ProductCard';
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Package,
    Truck,
    Shield,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Check,
    X,
} from 'lucide-react';
import type { Product, Review, ReviewFilters } from '@/app/types/dashboard';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);

    const user = useAuthStore((state) => state.user);
    const isFavorite = useFavoriteStore((state) => state.isFavorite(productId));
    const addToFavorites = useFavoriteStore((state) => state.addToFavorites);
    const removeFromFavorites = useFavoriteStore((state) => state.removeFromFavorites);

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Ürün detayı
            const productData = await productService.getProductById(productId, true);
            setProduct(productData);

            // TODO: Reviews API'den gelecek
            const reviewFilters: ReviewFilters = {
                id: 0,
                productId: productId,
                page: 1,
                pageSize: 5,
            };
            const reviewsData = await reviewService.getProductReviews(reviewFilters);
            setReviews(reviewsData);

            // Benzer ürünler
            if (productData.categoryId) {
                const related = await productService.getProducts({
                    categoryId: productData.categoryId,
                });
                setRelatedProducts(related.filter((p) => p.id !== productId).slice(0, 4));
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Ürün yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(productId);
            } else {
                await addToFavorites(productId);
            }
        } catch (error: any) {
            alert(error.message || 'Bir hata oluştu.');
        }
    };

    const handleAddToCart = () => {
        // TODO: Cart store'a ekle
        console.log('Add to cart:', productId, 'quantity:', quantity);
        alert(`${quantity} adet sepete eklendi!`);
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
            setQuantity(newQuantity);
        }
    };

    const calculateDiscount = () => {
        if (product?.oldPrice && product.oldPrice > product.price) {
            return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        }
        return 0;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.name,
                text: product?.description,
                url: window.location.href,
            });
        } else {
            setShowShareModal(true);
        }
    };

    const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h2>
                    <p className="text-gray-600 mb-6">{error || 'Bu ürün mevcut değil.'}</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black"
                    >
                        Ürünlere Dön
                    </button>
                </div>
            </div>
        );
    }

    const discount = calculateDiscount();
    const images = product.images || [product.imageUrl];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-gray-900">
                            Anasayfa
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/products" className="hover:text-gray-900">
                            Ürünler
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link
                            href={`/products?category=${product.categoryId}`}
                            className="hover:text-gray-900"
                        >
                            {product.categoryName}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src={images[selectedImageIndex].imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {discount > 0 && (
                                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                    %{discount} İNDİRİM
                                </div>
                            )}
                            {product.isBestSeller && (
                                <div className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                                    ⭐ Çok Satan
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                            ? 'border-gray-900 shadow-lg'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <Image
                                            src={img.imageUrl}
                                            alt={`${product.name} ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category */}
                        <Link
                            href={`/products?category=${product.categoryId}`}
                            className="inline-block text-sm text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide"
                        >
                            {product.categoryName}
                        </Link>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating & Reviews */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <StarRating rating={product.rating ?? 0} />
                                <span className="text-lg font-semibold text-gray-900">
                                    {(product.rating ?? 0).toFixed(1)}
                                </span>
                            </div>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                                <MessageCircle className="w-5 h-5" />
                                <span>{product.reviewCount} değerlendirme</span>
                            </button>
                            {((product.salesCount ?? 0) > 0) && (
                                <>
                                    <div className="h-6 w-px bg-gray-300"></div>
                                    <span className="text-gray-600">{product.salesCount}+ satış</span>
                                </>
                            )}
                        </div>

                        {/* Price */}
                        <div className="bg-gray-100 rounded-xl p-6">
                            <div className="flex items-baseline space-x-4 mb-2">
                                <span className="text-4xl font-bold text-gray-900">
                                    {product.price.toFixed(2)}₺
                                </span>
                                {product.oldPrice && (
                                    <span className="text-2xl text-gray-500 line-through">
                                        {product.oldPrice.toFixed(2)}₺
                                    </span>
                                )}
                            </div>
                            {discount > 0 && (
                                <p className="text-green-600 font-semibold">
                                    {((product.oldPrice! - product.price)).toFixed(2)}₺ tasarruf!
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            {product.stock > 0 ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-600 font-semibold">
                                        {product.stock < 10 ? `Son ${product.stock} adet!` : 'Stokta var'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="w-5 h-5 text-red-600" />
                                    <span className="text-red-600 font-semibold">Stokta yok</span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-900">
                                Miktar
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="px-6 text-lg font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= product.stock}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                    Maksimum: {product.stock} adet
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="w-full px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold text-lg hover:from-gray-900 hover:to-black transition-all flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                <span>{product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${isFavorite
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Heart
                                        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                                    />
                                    <span>{isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span>Paylaş</span>
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Ücretsiz Kargo</p>
                                    <p className="text-xs text-gray-600">150₺ üzeri</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Güvenli Ödeme</p>
                                    <p className="text-xs text-gray-600">SSL Sertifikalı</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Package className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Kolay İade</p>
                                    <p className="text-xs text-gray-600">14 gün içinde</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Müşteri Değerlendirmeleri
                        </h2>

                        {/* Rating Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center p-6 bg-gray-50 rounded-xl">
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {(product.rating ?? 0).toFixed(1)}
                                </div>
                                <StarRating rating={product.rating ?? 0} size="w-6 h-6" />
                                <p className="text-gray-600 mt-2">{product.reviewCount} değerlendirme</p>
                            </div>

                            <div className="md:col-span-2 space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 10 : 0;
                                    return (
                                        <div key={star} className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1 w-20">
                                                <span className="text-sm font-medium">{star}</span>
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            </div>
                                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-400"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-12 text-right">
                                                {percentage}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Henüz değerlendirme yapılmamış.</p>
                                    <button className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black">
                                        İlk Yorumu Siz Yapın
                                    </button>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border-b border-gray-200 pb-6 last:border-0"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-semibold text-gray-600">
                                                    {review.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {review.username}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                                        </p>
                                                    </div>
                                                    <StarRating rating={review.rating} size="w-4 h-4" />
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Benzer Ürünler</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    id={relatedProduct.id}
                                    name={relatedProduct.name}
                                    price={relatedProduct.price}
                                    oldPrice={relatedProduct.oldPrice}
                                    imageUrl={relatedProduct.imageUrl}
                                    rating={relatedProduct.rating}
                                    reviews={relatedProduct.reviewCount}
                                    stock={relatedProduct.stock}
                                    categoryName={relatedProduct.categoryName}
                                    isBestSeller={relatedProduct.isBestSeller}
                                    variant="default"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Ürünü Paylaş</h3>
                            <button onClick={() => setShowShareModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link kopyalandı!');
                                    setShowShareModal(false);
                                }}
                                className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold"
                            >
                                📋 Linki Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}