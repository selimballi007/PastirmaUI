// components/dashboard/hero-slides/SlideCard.tsx
import { Edit, Trash2, GripVertical, Power, Eye } from 'lucide-react';
import { HeroSlide } from '@/app/lib/services/heroSlideService';

interface SlideCardProps {
    slide: HeroSlide;
    onEdit: (slide: HeroSlide) => void;
    onDelete: (id: number, title: string) => void;
    onToggleStatus: (id: number) => void;
}

export default function SlideCard({ slide, onEdit, onDelete, onToggleStatus }: SlideCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Preview */}
            <div className={`relative h-64 bg-gradient-to-r ${slide.bgColor}`}>
                <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-2 w-fit">
                        <span className="text-xs font-semibold">{slide.discount}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{slide.title}</h3>
                    <p className="text-lg mb-1 opacity-90">{slide.subtitle}</p>
                    <p className="text-sm opacity-80">{slide.description}</p>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => onToggleStatus(slide.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${slide.isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                            }`}
                    >
                        <Power className="w-3 h-3" />
                        <span>{slide.isActive ? 'Aktif' : 'Pasif'}</span>
                    </button>
                </div>

                {/* Order Badge */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <GripVertical className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">Sıra: {slide.displayOrder}</span>
                </div>
            </div>

            {/* Info & Actions */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{slide.buttonText}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                        {new Date(slide.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(slide)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Düzenle</span>
                    </button>
                    <button
                        onClick={() => onDelete(slide.id, slide.title)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}