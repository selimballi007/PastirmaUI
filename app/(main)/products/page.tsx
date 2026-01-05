// app/products/page.tsx - Server Component
import { Suspense } from 'react';
import ProductsPageContent from '@/app/components/product/ProductsPageContent';
import { getProducts, getCategoriesWithCount } from '@/app/lib/server/products';
import type { Product } from '@/app/types/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ürünler - Pastırma',
    description: 'En taze ve kaliteli pastırma ürünlerimizi keşfedin',
};

interface Props {
    searchParams: Promise<{
        category?: string;
        filter?: string;
    }>;
}

async function getProductsData(searchParams: Awaited<Props['searchParams']>): Promise<{
    products: Product[];
    categories: { id: number; name: string; slug: string; count: number }[];
}> {
    const { category, filter } = searchParams;

    // Parallel data fetching
    const categoriesPromise = getCategoriesWithCount();

    let productsPromise: Promise<Product[]>;

    // Determine which products to fetch based on filters
    if (filter === 'best-sellers') {
        productsPromise = getProducts({ isBestSeller: true, limit: 100 });
    } else if (filter === 'campaign') {
        productsPromise = getProducts({ isCampaign: true, limit: 100 });
    } else if (filter === 'new') {
        productsPromise = getProducts({ isNew: true, limit: 100 });
    } else if (category) {
        productsPromise = getProducts({ categoryId: parseInt(category) });
    } else {
        productsPromise = getProducts();
    }

    const [products, categories] = await Promise.all([
        productsPromise,
        categoriesPromise,
    ]);

    return { products, categories };
}

export default async function ProductsPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const { products, categories } = await getProductsData(resolvedSearchParams);

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            }
        >
            <ProductsPageContent
                initialProducts={products}
                categories={categories}
                initialCategoryId={resolvedSearchParams.category ? parseInt(resolvedSearchParams.category) : null}
                initialFilter={resolvedSearchParams.filter || 'all'}
            />
        </Suspense>
    );
}
