import { create } from 'zustand';

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
}

interface HistoryState {
  items: HistoryItem[];
  addHistory: (url: string, title?: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [],

  addHistory: (url, title = url) => set((state) => ({
    items: [
      { id: Math.random().toString(36).substring(7), url, title, visitedAt: Date.now() },
      ...state.items.slice(0, 499),
    ],
  })),

  clearHistory: () => set({ items: [] }),
}));
