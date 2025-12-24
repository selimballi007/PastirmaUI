// components/home/skeletons/TestimonialsSkeleton.tsx
export default function TestimonialsSkeleton() {
    return (
        <section className="py-12 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full mb-4">
                        <div className="h-4 w-32 bg-indigo-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-80 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-64 bg-gray-100 rounded mx-auto animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="ml-4 flex-1 space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="flex space-x-1 mb-3">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                                ))}
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                            </div>
                            <div className="h-4 w-24 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="text-center p-6 bg-white rounded-xl shadow-md animate-pulse">
                            <div className="h-10 w-20 bg-gray-200 rounded mx-auto mb-2" />
                            <div className="h-5 w-32 bg-gray-100 rounded mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
