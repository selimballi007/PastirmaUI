// app/dashboard/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/app/lib/api/client';
import type { PagedResult } from '@/app/types/common';
import type { ReviewStats } from '@/app/types/dashboard';
import {
    Star,
    Check,
    X,
    Clock,
    User,
    Package,
    Calendar,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Page-specific Review interface (different from dashboard.ts Review)
interface Review {
    id: number;
    productId: number;
    productName: string;
    userId: number;
    username: string;
    rating: number;
    comment: string;
    status: string;
    createdAt: string;
    approvedAt?: string;
}

type FilterStatus = 'All' | 'Pending' | 'Approved' | 'Rejected';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [page, filterStatus]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            let url = '';

            if (filterStatus === 'Pending') {
                url = `reviews/pending?page=${page}&pageSize=10`;
            } else {
                // Tüm yorumları getir ve client-side filtrele
                url = `reviews/all?page=${page}&pageSize=10&status=${filterStatus}`;
            }

            const result = await fetchAPI<PagedResult<Review>>(url);
            setReviews(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const result = await fetchAPI<ReviewStats>('reviews/stats');
            setStats(result);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleApprove = async (reviewId: number) => {
        try {
            await fetchAPI<void>(`reviews/${reviewId}/approve`, { method: 'PUT' });
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Error approving review:', error);
            alert('Yorum onaylanırken bir hata oluştu.');
        }
    };

    const handleReject = async (reviewId: number) => {
        if (!confirm('Bu yorumu reddetmek istediğinize emin misiniz?')) return;

        try {
            await fetchAPI<void>(`reviews/${reviewId}/reject`, { method: 'PUT' });
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Error rejecting review:', error);
            alert('Yorum reddedilirken bir hata oluştu.');
        }
    };

    const filteredReviews = reviews.filter(review =>
        review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
        };

        const labels = {
            Pending: 'Beklemede',
            Approved: 'Onaylandı',
            Rejected: 'Reddedildi',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Yorum Yönetimi</h1>
                <p className="text-gray-600">Müşteri yorumlarını inceleyin ve onaylayın</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Bekleyen Yorumlar</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Onaylanan Yorumlar</p>
                            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm mb-1">Reddedilen Yorumlar</p>
                            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <X className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Filter Buttons */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <div className="flex space-x-2">
                            {(['Pending', 'Approved', 'Rejected', 'All'] as FilterStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setFilterStatus(status);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'Pending' ? 'Bekleyen' :
                                        status === 'Approved' ? 'Onaylanan' :
                                            status === 'Rejected' ? 'Reddedilen' : 'Tümü'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ürün, kullanıcı veya yorum ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Yorum Bulunamadı</h3>
                    <p className="text-gray-600">Seçili filtreye göre yorum bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.username}</p>
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(review.status)}
                            </div>

                            <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">{review.productName}</span>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            {review.comment && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    {review.approvedAt && (
                                        <div className="flex items-center space-x-1 text-green-600">
                                            <Check className="w-4 h-4" />
                                            <span>
                                                Onaylandı: {new Date(review.approvedAt).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {review.status === 'Pending' && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Onayla</span>
                                        </button>
                                        <button
                                            onClick={() => handleReject(review.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Reddet</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
                    <div className="text-sm text-gray-600">
                        Toplam <span className="font-semibold">{totalCount}</span> yorum
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex space-x-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}