// app/products/[id]/page.tsx - Server Component for SEO
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Star,
    Package,
    Truck,
    Shield,
    MessageCircle,
    ChevronRight,
    Check,
    X,
} from 'lucide-react';
import { getProductById, getProductReviews, getRelatedProducts } from '@/app/lib/server/products';
import ProductCard from '@/app/components/product/ProductCard';
import ProductActions from '@/app/components/product/ProductActions';
import type { Metadata } from 'next';

interface Props {
    params: {
        id: string;
    };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await getProductById(parseInt(params.id));

    if (!product) {
        return {
            title: 'Ürün Bulunamadı',
        };
    }

    return {
        title: `${product.name} - Pastırma Adası`,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [product.imageUrl],
        },
    };
}

const StarRating = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`${size} ${
                    i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < rating
                        ? 'fill-amber-200 text-amber-400'
                        : 'fill-gray-300 text-gray-300'
                }`}
            />
        ))}
    </div>
);

export default async function ProductDetailPage({ params }: Props) {
    const productId = parseInt(params.id);

    // Fetch data in parallel
    const [product, reviews] = await Promise.all([
        getProductById(productId, true), // Increment view count
        getProductReviews({ id: 0, productId, page: 1, pageSize: 5 }),
    ]);

    if (!product) {
        notFound();
    }

    // Fetch related products after getting product category
    const related = product.categoryId
        ? await getRelatedProducts(product.categoryId, productId, 4)
        : [];

    const discount = product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    const images = product.images || [{ imageUrl: product.imageUrl, displayOrder: 0 }];

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
                                src={images[0].imageUrl}
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
                                    <div
                                        key={index}
                                        className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                                    >
                                        <Image
                                            src={img.imageUrl}
                                            alt={`${product.name} ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
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
                            <div className="flex items-center space-x-2 text-gray-600">
                                <MessageCircle className="w-5 h-5" />
                                <span>{product.reviewCount} değerlendirme</span>
                            </div>
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
                            {discount > 0 && product.oldPrice && (
                                <p className="text-green-600 font-semibold">
                                    {((product.oldPrice - product.price)).toFixed(2)}₺ tasarruf!
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

                        {/* Client-side actions */}
                        <ProductActions
                            productId={product.id}
                            productName={product.name}
                            productDescription={product.description}
                            productImage={product.imageUrl}
                            price={product.price}
                            stock={product.stock}
                            discount={discount > 0 ? discount : undefined}
                        />

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
                {related.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Benzer Ürünler</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {related.map((relatedProduct) => (
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
        </div>
    );
}
