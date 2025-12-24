// components/home/skeletons/BlogPostsSkeleton.tsx
export default function BlogPostsSkeleton() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-teal-100 rounded-full mb-4">
                            <div className="h-4 w-32 bg-teal-200 rounded animate-pulse" />
                        </div>
                        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl overflow-hidden shadow-md border-2 border-gray-100 animate-pulse"
                        >
                            <div className="h-48 bg-gray-200" />
                            <div className="p-6 space-y-4">
                                <div className="h-7 bg-gray-200 rounded w-3/4" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-100 rounded" />
                                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                        <div className="h-4 w-24 bg-gray-100 rounded" />
                                    </div>
                                    <div className="h-4 w-20 bg-gray-100 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
