import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PendingSync {
  id: string; // Client-side UUID
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
        // Prevent duplicates for the same ID
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
    }
  )
);
