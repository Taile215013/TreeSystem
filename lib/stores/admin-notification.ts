import { create } from 'zustand';

export type NotificationType = 'error' | 'warning' | 'info' | 'success' | 'muted';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  elementId?: string;
  elementIds?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface AdminNotificationStore {
  notifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp'> & { id?: string }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAdminNotification = create<AdminNotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => {
      // Đảm bảo không trùng id
      const id = notification.id || Math.random().toString(36).substring(7);
      if (state.notifications.some((n) => n.id === id)) {
        return state;
      }
      return {
        notifications: [
          ...state.notifications,
          { ...notification, id, timestamp: Date.now() },
        ],
      };
    }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
