import Link from 'next/link';
import { ArrowLeft, Award, Clock, Heart, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hakkımızda - Pastırma',
    description: 'Pastırma olarak, geleneksel lezzetleri modern kalite standartlarıyla buluşturuyoruz.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-white hover:text-orange-100 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Hakkımızda</h1>
                    <p className="text-xl text-orange-100 max-w-3xl">
                        Geleneksel lezzetleri modern kalite standartlarıyla buluşturan Pastırma &apos;na hoş geldiniz
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Story Section */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Hikayemiz</h2>
                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="mb-4">
                            Pastırma , Türk mutfağının en değerli lezzetlerinden biri olan pastırmayı
                            ve geleneksel şarküteri ürünlerini sevgiyle hazırlayan bir markadır. Yılların
                            deneyimi ve bilgi birikimiyle, en kaliteli hammaddeleri kullanarak ürettiğimiz
                            ürünlerimiz, sofranıza özel lezzetler getiriyor.
                        </p>
                        <p className="mb-4">
                            Geleneksel üretim yöntemlerini modern hijyen standartlarıyla birleştirerek,
                            hem nostaljik tatları hem de günümüzün kalite beklentilerini karşılayan
                            ürünler sunuyoruz.
                        </p>
                        <p>
                            Müşteri memnuniyeti bizim için her şeyden önce gelir. Her ürünümüzü,
                            kendi sofranıza koyacakmış gibi özenle hazırlıyoruz.
                        </p>
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Değerlerimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Quality */}
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <Award className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Kalite</h3>
                            <p className="text-gray-600">
                                En kaliteli hammaddeleri kullanarak, mükemmel lezzetler üretiyoruz.
                            </p>
                        </div>

                        {/* Tradition */}
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gelenek</h3>
                            <p className="text-gray-600">
                                Yılların bilgi birikimi ve geleneksel üretim yöntemlerini koruyoruz.
                            </p>
                        </div>

                        {/* Trust */}
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <ShieldCheck className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Güven</h3>
                            <p className="text-gray-600">
                                Hijyen ve kalite standartlarımızla müşterilerimizin güvenini kazanıyoruz.
                            </p>
                        </div>

                        {/* Passion */}
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <Heart className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Tutku</h3>
                            <p className="text-gray-600">
                                İşimizi tutkuyla yapıyor, her ürünümüze özel özen gösteriyoruz.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Neden Bizi Seçmelisiniz?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Taze ve Kaliteli Ürünler
                                </h3>
                                <p className="text-gray-600">
                                    Ürünlerimiz günlük taze olarak hazırlanır ve hijyenik koşullarda paketlenir.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Hızlı Teslimat
                                </h3>
                                <p className="text-gray-600">
                                    Siparişleriniz en kısa sürede, özenle paketlenerek adresinize ulaşır.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Doğal İçerik
                                </h3>
                                <p className="text-gray-600">
                                    Ürünlerimizde yalnızca doğal ve kaliteli malzemeler kullanılır.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                    4
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Müşteri Memnuniyeti
                                </h3>
                                <p className="text-gray-600">
                                    7/24 müşteri desteği ve memnuniyet garantisi sunuyoruz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Lezzet Yolculuğuna Hazır mısınız?</h2>
                    <p className="text-xl text-orange-100 mb-6">
                        En kaliteli pastırma ve şarküteri ürünleri için ürünlerimize göz atın
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-bold text-lg shadow-lg"
                    >
                        Ürünleri Keşfet
                    </Link>
                </div>
            </div>
        </main>
    );
}
