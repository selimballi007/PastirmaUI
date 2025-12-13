// components/dashboard/hero-slides/SlideModal.tsx
import { X, Upload, Save } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useState } from 'react';
import { HeroSlide } from '@/app/lib/services/heroSlideService';

interface SlideModalProps {
    isOpen: boolean;
    editingSlide: HeroSlide | null;
    onClose: () => void;
    onSave: (data: any) => void;
}

const bgColorOptions = [
    { value: 'from-amber-600 to-orange-700', label: 'Turuncu', preview: 'bg-gradient-to-r from-amber-600 to-orange-700' },
    { value: 'from-emerald-600 to-teal-700', label: 'Yeşil', preview: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
    { value: 'from-blue-600 to-indigo-700', label: 'Mavi', preview: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
    { value: 'from-purple-600 to-pink-700', label: 'Mor', preview: 'bg-gradient-to-r from-purple-600 to-pink-700' },
    { value: 'from-red-600 to-rose-700', label: 'Kırmızı', preview: 'bg-gradient-to-r from-red-600 to-rose-700' },
    { value: 'from-gray-800 to-gray-900', label: 'Siyah', preview: 'bg-gradient-to-r from-gray-800 to-gray-900' },
];

export default function SlideModal({ isOpen, editingSlide, onClose, onSave }: SlideModalProps) {
    const [formData, setFormData] = useState({
        title: editingSlide?.title || '',
        subtitle: editingSlide?.subtitle || '',
        description: editingSlide?.description || '',
        discount: editingSlide?.discount || '',
        imageUrl: editingSlide?.imageUrl || '',
        buttonText: editingSlide?.buttonText || 'Hemen Keşfet',
        buttonLink: editingSlide?.buttonLink || '/products',
        bgColor: editingSlide?.bgColor || 'from-amber-600 to-orange-700',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            alert('Başlık zorunludur!');
            return;
        }
        if (!formData.imageUrl.trim()) {
            alert('Görsel zorunludur!');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingSlide ? 'Slide Düzenle' : 'Yeni Slide'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ana Başlık *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Örn: Özel Olgunlaştırılmış Pastırma"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Başlık
                        </label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleChange}
                            placeholder="Örn: Geleneksel lezzetin modern hali"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Örn: 45 günlük özel çemeni kaplı pastırmalarımızda %30 indirim!"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Discount Badge */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            İndirim Badge
                        </label>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="Örn: 30% İndirim"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arkaplan Rengi
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {bgColorOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, bgColor: option.value })}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.bgColor === option.value
                                        ? 'border-blue-600 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className={`h-12 ${option.preview} rounded-lg mb-2`}></div>
                                    <p className="text-sm font-medium text-gray-700">{option.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Button Text & Link */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buton Metni
                            </label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                placeholder="Örn: Hemen Keşfet"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buton Linki
                            </label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                placeholder="/products"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arka Plan Görseli *
                        </label>
                        <CldUploadWidget
                            uploadPreset="heroslides"
                            onSuccess={(result: any) => {
                                setFormData({ ...formData, imageUrl: result.info.secure_url });
                            }}
                        >
                            {({ open }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Upload className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700 font-medium">
                                        Görsel Yükle (1920x600 önerilen)
                                    </span>
                                </button>
                            )}
                        </CldUploadWidget>

                        {formData.imageUrl && (
                            <div className="mt-4 relative">
                                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {formData.imageUrl && formData.title && (
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                            <p className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700">
                                Önizleme:
                            </p>
                            <div className={`relative h-64 bg-gradient-to-r ${formData.bgColor}`}>
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover opacity-40"
                                />
                                <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                                    {formData.discount && (
                                        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-2 w-fit">
                                            <span className="text-xs font-semibold">{formData.discount}</span>
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold mb-1">{formData.title}</h3>
                                    {formData.subtitle && (
                                        <p className="text-lg mb-1 opacity-90">{formData.subtitle}</p>
                                    )}
                                    {formData.description && (
                                        <p className="text-sm opacity-80">{formData.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                        <Save className="w-5 h-5" />
                        <span>{editingSlide ? 'Güncelle' : 'Oluştur'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}