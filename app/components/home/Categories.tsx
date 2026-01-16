// components/home/Categories.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/app/lib/server/homepage';

interface CategoriesProps {
    categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Kategoriler</h2>
                    <Link
                        href="/products"
                        className="text-gray-700 hover:text-gray-900 font-medium flex items-center"
                    >
                        Tümünü Gör
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`/products?category=${category.id}`}
                            className={`${category.color} rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 text-center`}
                        >
                            <div className="text-4xl mb-3">{category.icon}</div>
                            <h3 className="font-semibold mb-1">{category.name}</h3>
                            <p className="text-sm opacity-75">{category.count} ürün</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}