import { create } from 'zustand';
import { favoriteService } from '@/app/lib/services/favoriteService';
import { persist } from 'zustand/middleware';

interface FavoriteStoreState {
    favoriteIds: Set<number>;
    favoriteCount: number;
    loading: boolean;

    initializeFavorites: () => Promise<void>;
    addToFavorites: (productId: number) => Promise<void>;
    removeFromFavorites: (productId: number) => Promise<void>;
    isFavorite: (productId: number) => boolean;
    clearFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStoreState>()(
    persist(
        (set, get) => ({
            favoriteIds: new Set<number>(),
            favoriteCount: 0,
            loading: false,

            initializeFavorites: async () => {
                try {
                    set({ loading: true });
                    const products = await favoriteService.getUserFavorites();
                    const ids = new Set(products.map(p => p.id));
                    set({
                        favoriteIds: ids,
                        favoriteCount: ids.size,
                        loading: false
                    });
                } catch (error: any) {
                    console.error('Error initializing favorites:', error);
                    // 401 hatası normal (kullanıcı henüz authenticated değil veya cookie hazır değil)
                    if (error?.message?.includes('401')) {
                        console.log('User not authenticated yet, skipping favorites initialization');
                    }
                    set({ loading: false });
                }
            },

            addToFavorites: async (productId: number) => {
                const { favoriteIds, favoriteCount } = get();
                if (favoriteIds.has(productId)) return;

                // Optimistic update - önce UI'ı güncelle
                const newIds = new Set(favoriteIds);
                newIds.add(productId);
                set({
                    favoriteIds: newIds,
                    favoriteCount: favoriteCount + 1,
                    loading: false
                });

                try {
                    await favoriteService.addToFavorites(productId);
                } catch (error) {
                    newIds.delete(productId);
                    set({
                        favoriteIds: newIds,
                        favoriteCount: favoriteCount - 1
                    });
                    console.error('Error adding favorite:', error);
                    alert('Favorilere eklenirken bir hata oluştu.');
                }
            },

            removeFromFavorites: async (productId: number) => {
                const { favoriteIds, favoriteCount } = get();
                if (!favoriteIds.has(productId)) return;
                // Optimistic update - önce UI'ı güncelle
                const newIds = new Set(favoriteIds);
                newIds.delete(productId);
                set({
                    favoriteIds: newIds,
                    favoriteCount: favoriteCount - 1
                })
                try {
                    await favoriteService.removeFromFavorites(productId);
                } catch (error) {
                    newIds.add(productId);
                    set({
                        favoriteIds: newIds,
                        favoriteCount: favoriteCount + 1
                    })
                    console.error('Error removing favorite:', error);
                    alert('Favorilerden kaldırılırken bir hata oluştu.');
                }
            },

            isFavorite: (productId: number) => {
                return get().favoriteIds.has(productId);
            },

            clearFavorites: async () => {
                set({
                    favoriteIds: new Set<number>(),
                    favoriteCount: 0,
                    loading: false
                })
            }
        }),

        {
            name: 'favorite-storage',
            partialize: (state) => ({
                favoriteIds: Array.from(state.favoriteIds),
                favoriteCount: state.favoriteCount
            }),
            // Deserialize - Array -> Set
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.favoriteIds = new Set(state.favoriteIds as any);
                }
            },
        }
    )
)

// ✅ Export standalone function for use in authStore
export const initializeFavorites = () => {
    return useFavoriteStore.getState().initializeFavorites();
};
