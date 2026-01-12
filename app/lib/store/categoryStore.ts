import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { categoryService, type CategoryWithProductCount } from '../services/categoryService';

interface CategoryStoreState {
    categories: CategoryWithProductCount[];
    loading: boolean;
    lastFetch: number | null;

    fetchCategories: () => Promise<void>;
    refreshCategories: () => Promise<void>;
    clearCategories: () => void;
}

const CATEGORY_CACHE_DURATION = 1000 * 60 * 5; // 5 dakika

export const useCategoryStore = create<CategoryStoreState>()(
    persist(
        (set, get) => ({
            categories: [],
            loading: false,
            lastFetch: null,

            fetchCategories: async () => {
                const { categories, lastFetch } = get();
                const now = Date.now();

                if (lastFetch && categories.length > 0 && (now - lastFetch) > CATEGORY_CACHE_DURATION)
                    return;

                try {
                    set({ loading: true });
                    const result = await categoryService.getCategoriesWithProductCount();
                    set({
                        categories: result,
                        lastFetch: Date.now(),
                        loading: false
                    });
                } catch (error) {
                    console.log('Error fetching categories:', error);
                    set({ loading: false });
                }
            },

            refreshCategories: async () => {
                try {
                    set({ loading: true });
                    const result = await categoryService.getCategoriesWithProductCount();
                    set({
                        categories: result,
                        lastFetch: Date.now(),
                        loading: false
                    })
                } catch (error) {
                    console.log('Error refreshing categories:', error);
                    set({ loading: false });
                }
            },

            clearCategories: () => {
                set({ categories: [], lastFetch: null });
            },
        }),
        {
            name: 'category-store',
            partialize: (state) => ({
                categories: state.categories,
                lastFetch: state.lastFetch,
            }),
        }
    )
)