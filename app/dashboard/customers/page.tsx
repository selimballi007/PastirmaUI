'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/app/lib/api/client';
import type { Customer } from '@/app/types/user';
import type { PagedResult } from '@/app/types/common';
import {
    User,
    Mail,
    Calendar,
    ShoppingBag,
    MessageSquare,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
} from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, [page]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const result = await fetchAPI<PagedResult<Customer>>(
                `user/customers?page=${page}&pageSize=10`
            );
            console.log('API Response:', result); // Debug log
            setCustomers(result.data || []);
            setTotalPages(result.totalPages || 1);
            setTotalCount(result.totalCount || 0);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = (customers || []).filter(
        (customer) =>
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Hiç giriş yapmadı';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Müşteriler</h1>
                <p className="text-gray-600">
                    Toplam {totalCount} müşteri
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Email, kullanıcı adı veya ad ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Müşteri Bulunamadı</h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Aramanız sonuç vermedi.' : 'Henüz müşteri yok.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Customers Table */}
                    <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-8">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Müşteri
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Kayıt Tarihi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Son Giriş
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Siparişler
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Yorumlar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {customer.fullName || customer.username || 'İsimsiz'}
                                                    </div>
                                                    {customer.username && customer.fullName && (
                                                        <div className="text-sm text-gray-500">
                                                            @{customer.username}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {customer.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Doğrulanmış
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                                        <XCircle className="w-3 h-3" />
                                                        Doğrulanmamış
                                                    </span>
                                                )}
                                                {customer.isGuest && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                                        Misafir
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.lastLoginAt ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <UserCheck className="w-4 h-4" />
                                                    {new Date(customer.lastLoginAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1">
                                                <ShoppingBag className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-gray-900">{customer.totalOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4 text-purple-600" />
                                                <span className="font-semibold text-gray-900">{customer.totalReviews}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">
                                Sayfa {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
