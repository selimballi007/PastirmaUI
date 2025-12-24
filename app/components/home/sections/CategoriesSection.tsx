// components/home/sections/CategoriesSection.tsx
import Categories from '@/app/components/home/Categories';
import { getCategories } from '@/app/lib/server/homepage';

export default async function CategoriesSection() {
    const categories = await getCategories();
    return <Categories categories={categories} />;
}
