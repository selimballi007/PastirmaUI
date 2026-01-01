// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthStore {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    login: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,

            login: (user) => {
                console.log('🔵 [AuthStore.login] Called');
                console.log('🔵🔴🟢', user);
                set({
                    user,
                    error: null,
                });

                // ✅ Load favorites after successful login
                // Delay ensures cookies are properly set by the server action
                setTimeout(async () => {
                    try {
                        const { initializeFavorites } = await import('./favoriteStore');
                        initializeFavorites();
                    } catch (error) {
                        console.error('Failed to initialize favorites after login:', error);
                    }
                }, 2000);
            },

            logout: async () => {
                console.log('🔴 [AuthStore.logout] Called');
                set({
                    user: null,
                    error: null,
                });

                // ✅ Clear favorites when user logs out
                try {
                    const { useFavoriteStore } = await import('./favoriteStore');
                    useFavoriteStore.getState().clearFavorites();
                } catch (error) {
                    console.error('Failed to clear favorites after logout:', error);
                }
            },

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: 'auth-store',
            // ✅ SADECE user bilgisi persist edilir - token yok!
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// ✅ Auth check artık sadece user varlığına bakıyor - token cookie'de
export const useIsAuthenticated = () =>
    useAuthStore((state) => {
        const isAuth = state.user !== null;
        return isAuth;
    });

export const getIsAuthenticated = () => {
    const state = useAuthStore.getState();
    return state.user !== null;
};