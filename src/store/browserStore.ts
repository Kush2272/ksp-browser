import { create } from 'zustand';

interface BrowserState {
  isSidebarOpen: boolean;
  activeMode: 'Gateway' | 'NativeKsp' | 'Developer' | 'Offline';
  toggleSidebar: () => void;
  setMode: (mode: 'Gateway' | 'NativeKsp' | 'Developer' | 'Offline') => void;
}

export const useBrowserStore = create<BrowserState>((set) => ({
  isSidebarOpen: true,
  activeMode: 'Gateway',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setMode: (mode) => set({ activeMode: mode }),
}));
