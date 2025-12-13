import React, { Suspense } from 'react';
import ProductsPageContent from '@/app/components/product/ProductsPageContent';

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        }>
            <ProductsPageContent />
        </Suspense>
    );
}