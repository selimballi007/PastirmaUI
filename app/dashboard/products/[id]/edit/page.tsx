// app/dashboard/products/[id]/edit/page.tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    X,
    Upload,
    AlertCircle,
    CheckCircle,
    Trash2,
    Image as ImageIcon,
    Star,
} from 'lucide-react';
import { productService } from '@/app/lib/services/productService';
import type { CreateProductRequest, UpdateProductRequest } from '@/app/types/dashboard';
import { useCategoryStore } from '@/app/lib/store/categoryStore';
import type { ProductImage } from '@/app/types/dashboard';

interface FormData {
    name: string;
    description: string;
    price: string;
    oldPrice: string;
    stock: string;
    categoryId: string;
    imageUrl: string; // Primary image cache
    images: ProductImage[]; // Multiple images
    isActive: boolean;
    isCampaign: boolean;
    isBestSeller: boolean;
    isNew: boolean;
    isSpecialOffer: boolean;
    campaignOrder: string;
    bestSellerOrder: string;
}

interface FormErrors {
    name?: string;
    price?: string;
    oldPrice?: string;
    stock?: string;
    categoryId?: string;
    images?: string;
}

export default function ProductFormPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id ? parseInt(params.id as string) : undefined;
    const isEditMode = !!productId && productId > 0;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        stock: '',
        categoryId: '',
        imageUrl: '',
        images: [],
        isActive: true,
        isCampaign: false,
        isBestSeller: false,
        isNew: false,
        isSpecialOffer: false,
        campaignOrder: '',
        bestSellerOrder: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const { categories, fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            const product = await productService.getProductById(productId!, true);

            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                oldPrice: product.oldPrice?.toString() || '',
                stock: product.stock.toString(),
                categoryId: product.categoryId?.toString() || '',
                imageUrl: product.imageUrl || '',
                images: product.images || [],
                isActive: product.isActive,
                isCampaign: product.isCampaign || false,
                isBestSeller: product.isBestSeller || false,
                isNew: product.isNew || false,
                isSpecialOffer: product.isSpecialOffer || false,
                campaignOrder: product.campaignOrder?.toString() || '',
                bestSellerOrder: product.bestSellerOrder?.toString() || '',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ürün yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ürün adı gereklidir';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Ürün adı en az 3 karakter olmalıdır';
        }

        const price = parseFloat(formData.price);
        if (!formData.price) {
            newErrors.price = 'Fiyat gereklidir';
        } else if (isNaN(price) || price < 0) {
            newErrors.price = 'Geçerli bir fiyat giriniz';
        }

        if (formData.isCampaign && formData.oldPrice) {
            const oldPrice = parseFloat(formData.oldPrice);
            if (isNaN(oldPrice) || oldPrice <= price) {
                newErrors.oldPrice = 'Eski fiyat, yeni fiyattan büyük olmalıdır';
            }
        }

        const stock = parseInt(formData.stock);
        if (!formData.stock) {
            newErrors.stock = 'Stok miktarı gereklidir';
        } else if (isNaN(stock) || stock < 0) {
            newErrors.stock = 'Geçerli bir stok miktarı giriniz';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Kategori seçimi gereklidir';
        }

        // ✅ En az 1 görsel zorunlu
        if (formData.images.length === 0) {
            newErrors.images = 'En az 1 ürün görseli gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // ✅ Primary image'ı imageUrl'e ata (cache)
            const primaryImage = formData.images.find(img => img.isPrimary);
            const primaryImageUrl = primaryImage?.imageUrl || formData.images[0]?.imageUrl || '';

            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: parseFloat(formData.price),
                oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId),
                imageUrl: primaryImageUrl, // ✅ Primary image cache
                images: formData.images, // ✅ Tüm görseller
                isActive: formData.isActive,
                isCampaign: formData.isCampaign,
                isBestSeller: formData.isBestSeller,
                isNew: formData.isNew,
                isSpecialOffer: formData.isSpecialOffer,
                campaignOrder: formData.campaignOrder ? parseInt(formData.campaignOrder) : undefined,
                bestSellerOrder: formData.bestSellerOrder ? parseInt(formData.bestSellerOrder) : undefined,
            };

            if (isEditMode) {
                await productService.updateProduct(productId!, productData as UpdateProductRequest);
            } else {
                await productService.createProduct(productData as CreateProductRequest);
            }

            setSuccess(true);

            setTimeout(() => {
                router.push('/dashboard/products');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ürün kaydedilirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    // ✅ Görsel ekleme
    const handleAddImage = (imageUrl: string) => {
        const newImage: ProductImage = {
            imageUrl,
            displayOrder: formData.images.length + 1,
            isPrimary: formData.images.length === 0, // İlk görsel otomatik primary
        };

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage],
            imageUrl: formData.images.length === 0 ? imageUrl : prev.imageUrl, // İlk görsel imageUrl'e ata
        }));

        // Clear error
        if (errors.images) {
            setErrors(prev => ({ ...prev, images: undefined }));
        }
    };

    // ✅ Görsel silme
    const handleRemoveImage = (index: number) => {
        const removedImage = formData.images[index];
        const newImages = formData.images.filter((_, i) => i !== index);

        // Sıraları güncelle
        const reorderedImages = newImages.map((img, i) => ({
            ...img,
            displayOrder: i + 1,
        }));

        // Eğer silinen primary ise, ilk görseli primary yap
        if (removedImage.isPrimary && reorderedImages.length > 0) {
            reorderedImages[0].isPrimary = true;
        }

        setFormData(prev => ({
            ...prev,
            images: reorderedImages,
            imageUrl: reorderedImages.find(img => img.isPrimary)?.imageUrl || reorderedImages[0]?.imageUrl || '',
        }));
    };

    // ✅ Primary görsel değiştirme
    const handleSetPrimary = (index: number) => {
        const updatedImages = formData.images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));

        setFormData(prev => ({
            ...prev,
            images: updatedImages,
            imageUrl: updatedImages[index].imageUrl, // ✅ Cache güncelle
        }));
    };

    const calculateDiscount = () => {
        if (formData.oldPrice && formData.price) {
            const oldPrice = parseFloat(formData.oldPrice);
            const price = parseFloat(formData.price);
            if (oldPrice > price) {
                return Math.round(((oldPrice - price) / oldPrice) * 100);
            }
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.push('/dashboard/products')}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {isEditMode
                                    ? 'Ürün bilgilerini güncelleyin'
                                    : 'Yeni bir ürün eklemek için formu doldurun'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <p className="text-green-800">
                            Ürün başarıyla {isEditMode ? 'güncellendi' : 'eklendi'}! Yönlendiriliyorsunuz...
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Temel Bilgiler
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Ürün Adı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Örn: Kayseri Pastırması Premium"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.categoryId
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                >
                                    <option value="">Kategori Seçin</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoryId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Ürün Aktif
                                    </span>
                                </label>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ürün açıklaması..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing and Stock */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Fiyat ve Stok
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    Fiyat (₺) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.price
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            {/* Old Price */}
                            <div>
                                <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                    Eski Fiyat (₺) {formData.isCampaign && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="number"
                                    id="oldPrice"
                                    name="oldPrice"
                                    value={formData.oldPrice}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.oldPrice
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="0.00"
                                    disabled={!formData.isCampaign}
                                />
                                {errors.oldPrice && (
                                    <p className="mt-1 text-sm text-red-600">{errors.oldPrice}</p>
                                )}
                                {calculateDiscount() > 0 && (
                                    <p className="mt-1 text-sm text-green-600 font-semibold">
                                        %{calculateDiscount()} İndirim
                                    </p>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="md:col-span-2">
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                                    Stok Miktarı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.stock
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="0"
                                />
                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badge & Display Settings */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Vitrin Ayarları
                        </h2>

                        <div className="space-y-4">
                            {/* Badges */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <label className="flex items-center cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isCampaign"
                                        checked={formData.isCampaign}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Kampanyalı
                                    </span>
                                </label>

                                <label className="flex items-center cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isBestSeller"
                                        checked={formData.isBestSeller}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Çok Satan
                                    </span>
                                </label>

                                <label className="flex items-center cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isNew"
                                        checked={formData.isNew}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Yeni
                                    </span>
                                </label>

                                <label className="flex items-center cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isSpecialOffer"
                                        checked={formData.isSpecialOffer}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                        Fırsat
                                    </span>
                                </label>
                            </div>

                            {/* Display Orders */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {formData.isCampaign && (
                                    <div>
                                        <label htmlFor="campaignOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                            Kampanya Sırası (Anasayfa)
                                        </label>
                                        <input
                                            type="number"
                                            id="campaignOrder"
                                            name="campaignOrder"
                                            value={formData.campaignOrder}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Anasayfada gösterilme sırası (1 = En üstte)
                                        </p>
                                    </div>
                                )}

                                {formData.isBestSeller && (
                                    <div>
                                        <label htmlFor="bestSellerOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                            Çok Satan Sırası (Anasayfa)
                                        </label>
                                        <input
                                            type="number"
                                            id="bestSellerOrder"
                                            name="bestSellerOrder"
                                            value={formData.bestSellerOrder}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Anasayfada gösterilme sırası (1 = En üstte)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ✅ Multiple Images Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Ürün Görselleri <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            En az 1, en fazla 5 görsel ekleyebilirsiniz. İlk görsel ana görsel olarak kullanılacaktır.
                        </p>

                        {/* Upload Button */}
                        {formData.images.length < 5 && (
                            <CldUploadWidget
                                uploadPreset="prodimage"
                                onSuccess={(result: any) => {
                                    handleAddImage(result.info.secure_url);
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 mb-6"
                                    >
                                        <Upload className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-700 font-medium">
                                            Görsel Ekle ({formData.images.length}/5)
                                        </span>
                                    </button>
                                )}
                            </CldUploadWidget>
                        )}

                        {/* Error */}
                        {errors.images && (
                            <p className="mb-4 text-sm text-red-600">{errors.images}</p>
                        )}

                        {/* Images Grid */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {formData.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${image.isPrimary
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-100">
                                            <img
                                                src={image.imageUrl}
                                                alt={`Ürün görseli ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Primary Badge */}
                                        {image.isPrimary && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>Ana Görsel</span>
                                            </div>
                                        )}

                                        {/* Order Badge */}
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                            {image.displayOrder}
                                        </div>

                                        {/* Actions (on hover) */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                            {!image.isPrimary && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetPrimary(index)}
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                    title="Ana görsel yap"
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {formData.images.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Henüz görsel eklenmedi</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Yukarıdaki butonu kullanarak görsel ekleyin
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/products')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={saving}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditMode ? 'Güncelle' : 'Ürünü Ekle'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}