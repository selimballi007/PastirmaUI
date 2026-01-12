// components/home/Testimonials.tsx
import { Star, Clock, Award } from 'lucide-react';
import type { Testimonial, TestimonialStat } from '@/app/lib/server/homepage';

interface TestimonialsProps {
    testimonials: Testimonial[];
    stats: TestimonialStat[];
}

export default function Testimonials({ testimonials, stats }: TestimonialsProps) {
    return (
        <section className="py-12 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full mb-4">
                        <Star className="w-4 h-4 mr-2 fill-current" />
                        <span className="font-semibold">Müşteri Memnuniyeti</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Müşterilerimiz Ne Diyor?
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Binlerce mutlu müşterimizden bazıları
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.bgColor} rounded-full flex items-center justify-center text-2xl`}>
                                    {testimonial.avatar}
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </h4>
                                        {testimonial.verified && (
                                            <div className="flex items-center text-emerald-600 text-xs">
                                                <Award className="w-3 h-3 mr-1" />
                                                Doğrulanmış
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                                </div>
                            </div>
                            <div className="flex text-amber-400 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : 'fill-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                "{testimonial.comment}"
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {testimonial.date}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md">
                            <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                                {stat.value}
                            </div>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}