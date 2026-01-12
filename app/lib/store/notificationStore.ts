import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationStore {
  orderCount: number;
  increment: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      orderCount: 0,
      increment: () => set((state) => ({ orderCount: state.orderCount + 1 })),
      clear: () => set({ orderCount: 0 }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
