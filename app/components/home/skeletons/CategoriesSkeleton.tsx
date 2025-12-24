// components/home/skeletons/CategoriesSkeleton.tsx
export default function CategoriesSkeleton() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-9 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-100 rounded-xl p-6 animate-pulse"
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
                            <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
