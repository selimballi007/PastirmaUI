'use client';

import {
    ShoppingCart,
    Package,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { useDashboard } from '@/app/lib/hooks/useDashboard';
import type { Order } from '@/app/types/order';
import { OrderStatus, OrderStatusLabels } from '@/app/types/order';

interface StatCard {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    trend: 'up' | 'down';
}

export default function DashboardPage() {
    const { data: dashboardData, loading, error, refresh } = useDashboard();

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Delivered:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case OrderStatus.Pending:
            case OrderStatus.Confirmed:
            case OrderStatus.Preparing:
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case OrderStatus.Shipped:
                return <Package className="w-5 h-5 text-blue-500" />;
            case OrderStatus.Cancelled:
            case OrderStatus.Returned:
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: OrderStatus): string => {
        return OrderStatusLabels[status] || 'Bilinmeyen';
    };

    const getStatusStyle = (status: OrderStatus): string => {
        switch (status) {
            case OrderStatus.Delivered:
                return 'bg-green-100 text-green-800';
            case OrderStatus.Pending:
                return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.Confirmed:
            case OrderStatus.Preparing:
                return 'bg-blue-100 text-blue-800';
            case OrderStatus.Shipped:
                return 'bg-purple-100 text-purple-800';
            case OrderStatus.Cancelled:
            case OrderStatus.Returned:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={refresh}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    const stats: StatCard[] = [
        {
            title: 'Toplam Satış',
            value: formatCurrency(dashboardData.stats.totalSales),
            change: dashboardData.stats.salesChange,
            icon: <DollarSign className="w-6 h-6" />,
            trend: dashboardData.stats.salesChange >= 0 ? 'up' : 'down',
        },
        {
            title: 'Siparişler',
            value: dashboardData.stats.totalOrders.toString(),
            change: dashboardData.stats.ordersChange,
            icon: <ShoppingCart className="w-6 h-6" />,
            trend: dashboardData.stats.ordersChange >= 0 ? 'up' : 'down',
        },
        {
            title: 'Müşteriler',
            value: dashboardData.stats.totalCustomers.toLocaleString('tr-TR'),
            change: dashboardData.stats.customersChange,
            icon: <Users className="w-6 h-6" />,
            trend: dashboardData.stats.customersChange >= 0 ? 'up' : 'down',
        },
        {
            title: 'Ürünler',
            value: dashboardData.stats.totalProducts.toString(),
            change: dashboardData.stats.productsChange,
            icon: <Package className="w-6 h-6" />,
            trend: dashboardData.stats.productsChange >= 0 ? 'up' : 'down',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Hoş geldiniz! İşte güncel istatistikleriniz.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={refresh}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Yenile
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Rapor İndir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    {stat.icon}
                                </div>
                                <div
                                    className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="w-4 h-4 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4 mr-1" />
                                    )}
                                    {Math.abs(stat.change).toFixed(1)}%
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-sm text-gray-500">{stat.title}</p>
                        </div>
                    ))}
                </div>

                {/* Charts and Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Satış Grafiği
                            </h2>
                            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Son 6 Ay</option>
                                <option>Son 1 Yıl</option>
                                <option>Tüm Zamanlar</option>
                            </select>
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="h-64 flex items-end justify-between gap-4">
                            {dashboardData.salesData.slice(-6).map((data, index) => {
                                const maxSales = Math.max(...dashboardData.salesData.map(d => d.sales));
                                const heightPercentage = (data.sales / maxSales) * 100;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full bg-gray-100 rounded-t-lg relative">
                                            <div
                                                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                                                style={{
                                                    height: `${(heightPercentage / 100) * 240}px`,
                                                }}
                                                title={`${formatCurrency(data.sales)}`}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                                                    {formatCurrency(data.sales / 1000)}k
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm font-medium text-gray-600">
                                            {new Date(data.date).toLocaleDateString('tr-TR', { month: 'short' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Hızlı İstatistikler
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Dönüşüm Oranı
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">
                                    {dashboardData.quickStats.conversionRate.toFixed(1)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Ort. Sipariş
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-green-600">
                                    {formatCurrency(dashboardData.quickStats.averageOrderValue)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Aktif Kullanıcı
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-purple-600">
                                    {dashboardData.quickStats.activeUsers.toLocaleString('tr-TR')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center">
                                    <Package className="w-5 h-5 text-orange-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Stok Uyarısı
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-orange-600">
                                    {dashboardData.quickStats.lowStockProducts}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Son Siparişler
                            </h2>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Tümünü Gör →
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sipariş No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Müşteri
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tutar
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tarih
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{order.userName}</div>
                                                <div className="text-gray-500">{order.userEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                                                    order.orderStatus
                                                )}`}
                                            >
                                                {getStatusIcon(order.orderStatus)}
                                                <span className="ml-1">{getStatusText(order.orderStatus)}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}