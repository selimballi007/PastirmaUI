'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Image as ImageIcon,
    Trash2,
    AlertCircle,
    Loader2,
    ExternalLink,
    Search,
    RefreshCw,
} from 'lucide-react';
import { cloudinaryService } from '@/app/lib/services/cloudinaryService';
import type { CloudinaryImage } from '@/app/types/dashboard';

export default function MediaManagementPage() {
    const [images, setImages] = useState<CloudinaryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingImage, setDeletingImage] = useState<string | null>(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cloudinaryService.getAllImages();
            setImages(data);
        } catch (err: any) {
            console.error('Error loading images:', err);
            setError(err.message || 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (image: CloudinaryImage) => {
        if (image.isUsedInDatabase) {
            const productsText = image.usedInProducts
                .map(p => `${p.productName} (${p.usageType})`)
                .join(', ');

            const confirmed = window.confirm(
                `Bu görsel şu ürünlerde kullanılıyor:\n${productsText}\n\nSilmek istediğinizde bu ürünlerden de kaldırılacak. Devam etmek istiyor musunuz?`
            );

            if (!confirmed) return;
        } else {
            const confirmed = window.confirm(
                `"${image.publicId}" görselini silmek istediğinize emin misiniz?`
            );

            if (!confirmed) return;
        }

        try {
            setDeletingImage(image.publicId);
            const result = await cloudinaryService.deleteImage(image.publicId, true);

            if (result.success) {
                alert(result.message);
                // Refresh the images list
                await loadImages();
            } else {
                alert('Silme işlemi başarısız: ' + result.message);
            }
        } catch (err: any) {
            console.error('Error deleting image:', err);
            alert('Görsel silinirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        } finally {
            setDeletingImage(null);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredImages = images.filter(image => {
        if (!searchTerm) return true;
        return (
            image.publicId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.format.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
                    <p className="text-gray-600">Görseller yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-900 font-semibold">Hata</h3>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={loadImages}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cloudinary Görsel Yönetimi</h1>
                        <p className="text-gray-600 mt-1">
                            Toplam {images.length} görsel - {filteredImages.length} görsel gösteriliyor
                        </p>
                    </div>
                    <button
                        onClick={loadImages}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Yenile</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Görsel ara (Public ID veya format)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
            </div>

            {/* Images Grid */}
            {filteredImages.length === 0 ? (
                <div className="text-center py-20">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Görsel Bulunamadı' : 'Henüz Görsel Yok'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm
                            ? 'Arama kriterlerinize uygun görsel bulunamadı.'
                            : 'Cloudinary hesabınızda henüz görsel bulunmuyor.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                        <div
                            key={image.publicId}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Image Preview */}
                            <div className="relative aspect-square bg-gray-100">
                                <Image
                                    src={image.secureUrl}
                                    alt={image.publicId}
                                    fill
                                    className="object-cover"
                                />
                                {image.isUsedInDatabase && (
                                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                        Kullanımda
                                    </div>
                                )}
                            </div>

                            {/* Image Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate mb-2" title={image.publicId}>
                                    {image.publicId}
                                </h3>

                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    <p>
                                        <span className="font-medium">Format:</span> {image.format.toUpperCase()}
                                    </p>
                                    <p>
                                        <span className="font-medium">Boyut:</span> {image.width} x {image.height}
                                    </p>
                                    <p>
                                        <span className="font-medium">Dosya:</span> {formatBytes(image.bytes)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Tarih:</span> {formatDate(image.createdAt)}
                                    </p>
                                </div>

                                {/* Usage Info */}
                                {image.isUsedInDatabase && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-900 mb-1">
                                            Kullanıldığı Ürünler:
                                        </p>
                                        <div className="space-y-1">
                                            {image.usedInProducts.map((usage, idx) => (
                                                <div key={idx} className="text-xs text-blue-700">
                                                    • {usage.productName}
                                                    <span className="text-blue-500 ml-1">
                                                        ({usage.usageType === 'MainImage' ? 'Ana Görsel' : 'Galeri'})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <a
                                        href={image.secureUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Görüntüle</span>
                                    </a>
                                    <button
                                        onClick={() => handleDeleteImage(image)}
                                        disabled={deletingImage === image.publicId}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {deletingImage === image.publicId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
