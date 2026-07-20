import { create } from 'zustand';

interface NetworkState {
  bytesInTotal: number;
  bytesOutTotal: number;
  activeStreams: number;
  updateStats: (bytesIn: number, bytesOut: number, streams: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  bytesInTotal: 142000,
  bytesOutTotal: 38000,
  activeStreams: 3,

  updateStats: (bytesIn, bytesOut, activeStreams) => set((state) => ({
    bytesInTotal: state.bytesInTotal + bytesIn,
    bytesOutTotal: state.bytesOutTotal + bytesOut,
    activeStreams,
  })),
}));
