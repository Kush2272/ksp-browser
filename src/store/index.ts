export * from './browserStore';
export * from './gatewayStore';
export * from './historyStore';
export * from './networkStore';
export * from './inspectorStore';

import { create } from 'zustand';

// ---------------------------------------------------------
// Tab Store
// ---------------------------------------------------------
export interface Tab {
  id: string;
  url: string;
  title: string;
  isLoading: boolean;
  isActive: boolean;
}

interface TabState {
  tabs: Tab[];
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  getActiveTab: () => Tab | undefined;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ id: '1', url: 'ksp://start', title: 'New Tab', isLoading: false, isActive: true }],
  
  addTab: (url = 'ksp://start') => set((state) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTabs = state.tabs.map(t => ({ ...t, isActive: false }));
    newTabs.push({ id: newId, url, title: 'New Tab', isLoading: false, isActive: true });
    return { tabs: newTabs };
  }),
  
  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      newTabs.push({ id: '1', url: 'ksp://start', title: 'New Tab', isLoading: false, isActive: true });
    } else if (state.tabs.find(t => t.id === id)?.isActive) {
      newTabs[newTabs.length - 1].isActive = true;
    }
    return { tabs: newTabs };
  }),
  
  setActiveTab: (id) => set((state) => ({
    tabs: state.tabs.map(t => ({ ...t, isActive: t.id === id }))
  })),
  
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  getActiveTab: () => get().tabs.find(t => t.isActive)
}));

// ---------------------------------------------------------
// Settings Store
// ---------------------------------------------------------
interface SettingsState {
  developerMode: boolean;
  blockAds: boolean;
  darkTheme: boolean;
  setDeveloperMode: (val: boolean) => void;
  setBlockAds: (val: boolean) => void;
  setDarkTheme: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  developerMode: false,
  blockAds: true,
  darkTheme: true,
  setDeveloperMode: (val) => set({ developerMode: val }),
  setBlockAds: (val) => set({ blockAds: val }),
  setDarkTheme: (val) => set({ darkTheme: val })
}));
