// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useFavoriteStore } from './favoriteStore'

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthStore {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;

    login: (token: string, user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateUser: (user: Partial<User>) => void;
    setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,

            login: (token, user) => {
                console.log('🔵 [AuthStore.login] Called');
                console.log('🔵🔴🟢', user);
                set({
                    accessToken: token,
                    user,
                    error: null,
                });
                useFavoriteStore.getState().initializeFavorites();
            },

            logout: () => {
                console.log('🔴 [AuthStore.logout] Called');
                set({
                    accessToken: null,
                    user: null,
                    error: null,
                });
            },

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

            setAccessToken: (token) => {
                console.log('🟢 [AuthStore.setAccessToken] Called');
                set({ accessToken: token });
            },

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: 'auth-store',
            // ✅ Sadece user'ı persist et (accessToken memory'de kalır)
            partialize: (state) => ({
                user: state.user,
                // accessToken persist edilmez - güvenlik için
            }),
        }
    )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

export const useIsAuthenticated = () =>
    useAuthStore((state) => {
        const isAuth = state.accessToken !== null && state.user !== null;
        return isAuth;
    });

export const getIsAuthenticated = () => {
    const state = useAuthStore.getState();
    return state.accessToken !== null && state.user !== null;
};