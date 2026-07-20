import { create } from 'zustand';

export interface GatewayCapabilities {
  gateway: string;
  protocol: string;
  features: string[];
}

interface GatewayState {
  status: 'online' | 'degraded' | 'offline';
  capabilities: GatewayCapabilities | null;
  rttMs: number;
  setGatewayStatus: (status: 'online' | 'degraded' | 'offline', caps?: GatewayCapabilities, rtt?: number) => void;
}

export const useGatewayStore = create<GatewayState>((set) => ({
  status: 'online',
  capabilities: {
    gateway: '1.0.1',
    protocol: 'KSP/1',
    features: ['compression', 'cache', 'websocket', 'http2', 'replay', 'metrics'],
  },
  rttMs: 2.1,

  setGatewayStatus: (status, capabilities, rttMs) => set((state) => ({
    status,
    capabilities: capabilities || state.capabilities,
    rttMs: rttMs !== undefined ? rttMs : state.rttMs,
  })),
}));
