import { create } from 'zustand';

interface Tab {
  id: string;
  title: string;
  path: string;
  module: string;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [{ id: 'dashboard', title: 'Dashboard', path: '/dashboard', module: 'dashboard' }],
  activeTabId: 'dashboard',
  addTab: (tab) => set((state) => {
    const exists = state.tabs.find((t) => t.id === tab.id);
    if (exists) return { activeTabId: tab.id };
    return { 
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    };
  }),
  removeTab: (id) => set((state) => {
    if (id === 'dashboard') return state; // Don't remove dashboard
    const newTabs = state.tabs.filter((t) => t.id !== id);
    const newActiveId = state.activeTabId === id ? 'dashboard' : state.activeTabId;
    return { tabs: newTabs, activeTabId: newActiveId };
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
}));
