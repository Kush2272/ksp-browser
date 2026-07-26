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
  /** Back/forward navigation stack; `historyIndex` points at the current entry. */
  history: string[];
  historyIndex: number;
}

interface TabState {
  tabs: Tab[];
  addTab: (url?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  /** Navigate the given tab to a new URL, pushing onto its history stack. */
  navigate: (id: string, url: string, title?: string) => void;
  goBack: (id: string) => void;
  goForward: (id: string) => void;
  canGoBack: (id: string) => boolean;
  canGoForward: (id: string) => boolean;
  getActiveTab: () => Tab | undefined;
}

function titleFor(url: string): string {
  if (url.startsWith('ksp://')) return url.substring(6) || 'Home';
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [{ id: '1', url: 'ksp://start', title: 'New Tab', isLoading: false, isActive: true, history: ['ksp://start'], historyIndex: 0 }],

  addTab: (url) => set((state) => {
    const targetUrl = url || useSettingsStore.getState().startUrl || 'ksp://home';
    const newId = Math.random().toString(36).substr(2, 9);
    const newTabs = state.tabs.map(t => ({ ...t, isActive: false }));
    newTabs.push({
      id: newId,
      url: targetUrl,
      title: titleFor(targetUrl),
      isLoading: false,
      isActive: true,
      history: [targetUrl],
      historyIndex: 0,
    });
    return { tabs: newTabs };
  }),

  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      const defaultUrl = useSettingsStore.getState().startUrl || 'ksp://home';
      newTabs.push({ id: '1', url: defaultUrl, title: 'Home', isLoading: false, isActive: true, history: [defaultUrl], historyIndex: 0 });
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

  navigate: (id, url, title) => set((state) => ({
    tabs: state.tabs.map(t => {
      if (t.id !== id) return t;
      // Same URL → treat as reload, don't grow history.
      if (t.history[t.historyIndex] === url) {
        return { ...t, url, title: title ?? titleFor(url) };
      }
      const trimmed = t.history.slice(0, t.historyIndex + 1);
      trimmed.push(url);
      // Cap stack depth to keep memory bounded.
      const capped = trimmed.slice(-100);
      return {
        ...t,
        url,
        title: title ?? titleFor(url),
        history: capped,
        historyIndex: capped.length - 1,
      };
    })
  })),

  goBack: (id) => set((state) => ({
    tabs: state.tabs.map(t => {
      if (t.id !== id || t.historyIndex <= 0) return t;
      const idx = t.historyIndex - 1;
      return { ...t, historyIndex: idx, url: t.history[idx], title: titleFor(t.history[idx]) };
    })
  })),

  goForward: (id) => set((state) => ({
    tabs: state.tabs.map(t => {
      if (t.id !== id || t.historyIndex >= t.history.length - 1) return t;
      const idx = t.historyIndex + 1;
      return { ...t, historyIndex: idx, url: t.history[idx], title: titleFor(t.history[idx]) };
    })
  })),

  canGoBack: (id) => {
    const t = get().tabs.find(t => t.id === id);
    return !!t && t.historyIndex > 0;
  },

  canGoForward: (id) => {
    const t = get().tabs.find(t => t.id === id);
    return !!t && t.historyIndex < t.history.length - 1;
  },

  getActiveTab: () => get().tabs.find(t => t.isActive)
}));

// ---------------------------------------------------------
// Settings Store
// ---------------------------------------------------------
interface SettingsState {
  developerMode: boolean;
  blockAds: boolean;
  darkTheme: boolean;
  defaultSearchEngine: string;
  startUrl: string;
  setDeveloperMode: (val: boolean) => void;
  setBlockAds: (val: boolean) => void;
  setDarkTheme: (val: boolean) => void;
  setSearchEngine: (engine: string) => void;
  setStartUrl: (url: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  developerMode: false,
  blockAds: true,
  darkTheme: true,
  defaultSearchEngine: 'duckduckgo',
  startUrl: 'ksp://home',
  setDeveloperMode: (val) => set({ developerMode: val }),
  setBlockAds: (val) => set({ blockAds: val }),
  setDarkTheme: (val) => set({ darkTheme: val }),
  setSearchEngine: (engine) => set({ defaultSearchEngine: engine }),
  setStartUrl: (url) => set({ startUrl: url }),
}));
