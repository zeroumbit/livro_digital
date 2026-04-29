import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORE_KEY = 'ofs-queue-x1';

const simpleEncrypt = (data: string): string => {
  const key = STORE_KEY;
  return btoa(data.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''));
};

const simpleDecrypt = (data: string): string => {
  try {
    const key = STORE_KEY;
    const decoded = atob(data);
    return decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  } catch {
    return data;
  }
};

export interface PendingSync {
  id: string;
  tableName: string;
  data: any;
  action: 'insert' | 'update';
  timestamp: number;
  related?: {
    tableName: string;
    foreignKey: string;
    items: any[];
  };
}

interface OfflineState {
  queue: PendingSync[];
  isOnline: boolean;
  addToQueue: (item: Omit<PendingSync, 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  updateQueueItem: (id: string, updates: Partial<PendingSync>) => void;
  setOnlineStatus: (status: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      addToQueue: (item) => set((state) => {
        const filtered = state.queue.filter(q => q.id !== item.id);
        return {
          queue: [...filtered, { ...item, timestamp: Date.now() }]
        };
      }),

      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter(q => q.id !== id)
      })),

      updateQueueItem: (id, updates) => set((state) => ({
        queue: state.queue.map(q => q.id === id ? { ...q, ...updates } : q)
      })),

      setOnlineStatus: (status) => set({ isOnline: status }),
    }),
    {
      name: 'offline-sync-queue',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (parsed.state) {
              parsed.state = JSON.parse(simpleDecrypt(parsed.state));
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const encrypted = simpleEncrypt(JSON.stringify(value.state));
          localStorage.setItem(name, JSON.stringify({ state: encrypted }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
