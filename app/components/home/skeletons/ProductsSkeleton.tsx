// components/home/skeletons/ProductsSkeleton.tsx
interface ProductsSkeletonProps {
    count?: number;
    title?: string;
    bgColor?: string;
}

export default function ProductsSkeleton({
    count = 3,
    title = "Ürünler Yükleniyor",
    bgColor = "bg-white"
}: ProductsSkeletonProps) {
    return (
        <section className={`py-16 ${bgColor}`}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-48 bg-gray-100 rounded mx-auto animate-pulse" />
                </div>

                {/* Products Grid */}
                <div className={`grid grid-cols-1 ${count === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                    {[...Array(count)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                        >
                            {/* Image skeleton */}
                            <div className="h-64 bg-gray-200" />

                            <div className="p-6 space-y-4">
                                {/* Category badge */}
                                <div className="h-5 w-20 bg-gray-200 rounded-full" />

                                {/* Title */}
                                <div className="h-6 bg-gray-200 rounded w-3/4" />

                                {/* Rating */}
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded" />
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between">
                                    <div className="h-7 w-24 bg-gray-200 rounded" />
                                    <div className="h-5 w-16 bg-gray-100 rounded" />
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-2">
                                    <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
