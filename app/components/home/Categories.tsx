// components/home/Categories.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const categories = [
    { name: 'Pastırma', icon: '🥩', count: 24, color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { name: 'Sucuk', icon: '🌭', count: 18, color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    { name: 'Kavurma', icon: '🍖', count: 12, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { name: 'Salam', icon: '🥓', count: 15, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { name: 'Sosis', icon: '🌭', count: 10, color: 'bg-pink-100 text-pink-700 hover:bg-pink-200' },
    { name: 'Jambon', icon: '🍗', count: 8, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    { name: 'Şarküteri', icon: '🧈', count: 20, color: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
    { name: 'Kahvaltılık', icon: '🥖', count: 16, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
];

export default function Categories() {
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
                            href={`/products?category=${category.name}`}
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