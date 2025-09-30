'use client'

import ProductCard from './components/ProductCard'

export default function HomePage() {

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <section className="bg-yellow-100 py-16 text-center rounded-lg mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                    Delicious Food Delivered to Your Door
                </h1>
                <p className="mt-4 text-lg text-gray-700">
                    Fresh ingredients, fast delivery, and amazing flavors.
                </p>
            </section>

            {/* Featured Products */}
            <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Featured Dishes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                </div>
            </section>
        </main>
    )
}
