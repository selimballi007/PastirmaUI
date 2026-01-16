// app/dashboard/hero-slides/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { heroSlideService, type HeroSlide } from '@/app/lib/services/heroSlideService';
import toast from 'react-hot-toast';
import SlideCard from '@/app/components/dashboard/heroSlides/slideCard';
import SlideModal from '@/app/components/dashboard/heroSlides/slideModal';

export default function HeroSlidesPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const result = await heroSlideService.getAllSlides();
            setSlides(result.sort((a, b) => a.displayOrder - b.displayOrder));
        } catch (error) {
            console.error('Error fetching slides:', error);
            toast.error('Slider\'lar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (editingSlide) {
                await heroSlideService.updateSlide(editingSlide.id, data);
                toast.success('Slide başarıyla güncellendi!');
            } else {
                await heroSlideService.createSlide(data);
                toast.success('Slide başarıyla oluşturuldu!');
            }
            closeModal();
            fetchSlides();
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu.');
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`"${title}" slide'ını silmek istediğinize emin misiniz?`)) return;

        try {
            await heroSlideService.deleteSlide(id);
            toast.success('Slide başarıyla silindi!');
            fetchSlides();
        } catch (error: any) {
            toast.error(error.message || 'Slide silinirken bir hata oluştu.');
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await heroSlideService.toggleSlideStatus(id);
            fetchSlides();
        } catch (error) {
            toast.error('Durum değiştirilirken bir hata oluştu.');
        }
    };

    const openCreateModal = () => {
        setEditingSlide(null);
        setIsModalOpen(true);
    };

    const openEditModal = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlide(null);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Hero Slider Yönetimi</h1>
                    <p className="text-gray-600">Anasayfa slider'larını düzenleyin ve yönetin</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span>Yeni Slide</span>
                </button>
            </div>

            {/* Slides List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : slides.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Slide Yok</h3>
                    <p className="text-gray-600 mb-4">Yeni bir slide ekleyerek başlayın</p>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        İlk Slide'ı Oluştur
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {slides.map((slide) => (
                        <SlideCard
                            key={slide.id}
                            slide={slide}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <SlideModal
                isOpen={isModalOpen}
                editingSlide={editingSlide}
                onClose={closeModal}
                onSave={handleSave}
            />
        </div>
    );
}