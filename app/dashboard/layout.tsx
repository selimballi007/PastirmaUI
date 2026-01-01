'use client'

import { useState } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Image,
    Settings,
    LogOut,
    Star,
    Folder,
    X,
    BookOpen,
    Mail,
} from 'lucide-react';
import DashboardSidebar from '@/app/components/dashboard/DashboardSidebar'
import DashboardNavbar from '@/app/components/dashboard/DashboardNavbar'

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Siparişler', href: '/dashboard/orders', icon: ShoppingCart },
        { name: 'Ürünler', href: '/dashboard/products', icon: Package },
        { name: 'Kategoriler', href: '/dashboard/categories', icon: Folder },
        { name: 'Hero Slider', href: '/dashboard/hero-slides', icon: Image },
        { name: 'Medya Galerisi', href: '/dashboard/media', icon: Image },
        { name: 'Blog Yönetimi', href: '/dashboard/blog', icon: BookOpen },
        { name: 'Yorumlar', href: '/dashboard/reviews', icon: Star },
        { name: 'Müşteriler', href: '/dashboard/customers', icon: Users },
        { name: 'İletişim Mesajları', href: '/dashboard/contact-messages', icon: Mail },
        { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigation={navigation} />
            <div className="lg:pl-64">
                <DashboardNavbar setSidebarOpen={setSidebarOpen} />
                {/* Page content */}
                <main>{children}</main>
            </div>
        </div>
    )
}