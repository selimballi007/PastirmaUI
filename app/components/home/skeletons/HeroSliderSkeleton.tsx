// components/home/skeletons/HeroSliderSkeleton.tsx
export default function HeroSliderSkeleton() {
    return (
        <section className="relative h-[600px] bg-gray-900 overflow-hidden">
            <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 animate-pulse" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                    {/* Badge skeleton */}
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                        <div className="w-20 h-4 bg-white/30 rounded animate-pulse" />
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-3 mb-4">
                        <div className="h-12 bg-white/20 rounded w-3/4 animate-pulse" />
                        <div className="h-12 bg-white/20 rounded w-2/3 animate-pulse" />
                    </div>

                    {/* Subtitle skeleton */}
                    <div className="h-6 bg-white/20 rounded w-1/2 mb-2 animate-pulse" />

                    {/* Description skeleton */}
                    <div className="h-5 bg-white/20 rounded w-3/4 mb-8 animate-pulse" />

                    {/* Button skeleton */}
                    <div className="inline-flex items-center px-8 py-4 bg-white/20 rounded-lg animate-pulse">
                        <div className="w-32 h-6 bg-white/30 rounded" />
                    </div>
                </div>
            </div>

            {/* Navigation buttons skeleton */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full animate-pulse" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full animate-pulse" />

            {/* Dots skeleton */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                ))}
            </div>
        </section>
    );
}
