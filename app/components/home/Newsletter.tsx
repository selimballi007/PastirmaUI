// components/home/Newsletter.tsx
import { Sparkles } from 'lucide-react';

export default function Newsletter() {
    return (
        <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                    <span className="text-white font-semibold">Özel Ayrıcalıklar</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                    Fırsatları Kaçırmayın!
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                    Özel kampanyalar ve yeni ürünlerden ilk siz haberdar olun
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="E-posta adresiniz"
                        className="flex-1 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl">
                        Abone Ol
                    </button>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                    * Dilediğiniz zaman abonelikten çıkabilirsiniz
                </p>
            </div>
        </section>
    );
}