import { create } from 'zustand';

export interface PacketInfo {
  id: string;
  sessionId: string;
  streamId: number;
  timestamp: number; // ms
  type: 'CLIENT_HELLO' | 'SERVER_HELLO' | 'CERTIFICATE' | 'AUTH_REQUEST' | 'HANDSHAKE_FINISH' | 'DATA' | 'KEEPALIVE';
  direction: 'in' | 'out';
  bytes: number;
  encrypted: boolean;
  hexDump: string;
  decryptedPayload?: string;
  flags: string[];
}

interface InspectorState {
  isCapturing: boolean;
  packets: PacketInfo[];
  selectedPacketId: string | null;
  filterSessionId: string | null;
  toggleCapture: () => void;
  clearCapture: () => void;
  selectPacket: (id: string | null) => void;
  setFilterSession: (id: string | null) => void;
  addPacket: (packet: Omit<PacketInfo, 'id'>) => void;
}

// Generate some fake mock packets for the demo
const generateMockPackets = (): PacketInfo[] => {
  const sessionId = 'sess-0001';
  let time = 0;
  return [
    {
      id: 'p1', sessionId, streamId: 0, timestamp: time += 0, type: 'CLIENT_HELLO', direction: 'out', bytes: 32, encrypted: false, flags: [],
      hexDump: '0000: 01 00 00 00 00 00 00 20 00 01 ...'
    },
    {
      id: 'p2', sessionId, streamId: 0, timestamp: time += 1.2, type: 'SERVER_HELLO', direction: 'in', bytes: 64, encrypted: false, flags: [],
      hexDump: '0000: 02 00 00 00 00 00 00 40 00 01 ...'
    },
    {
      id: 'p3', sessionId, streamId: 0, timestamp: time += 0.9, type: 'CERTIFICATE', direction: 'in', bytes: 128, encrypted: false, flags: [],
      hexDump: '0000: 03 00 00 00 00 00 00 80 ...'
    },
    {
      id: 'p4', sessionId, streamId: 0, timestamp: time += 1.3, type: 'AUTH_REQUEST', direction: 'out', bytes: 48, encrypted: true, flags: ['ENC'],
      hexDump: '0000: 04 00 01 00 00 00 00 30 ...',
      decryptedPayload: '{"method": "anonymous"}'
    },
    {
      id: 'p5', sessionId, streamId: 0, timestamp: time += 0.7, type: 'HANDSHAKE_FINISH', direction: 'in', bytes: 16, encrypted: true, flags: ['ENC'],
      hexDump: '0000: 05 00 01 00 00 00 00 10 ...',
      decryptedPayload: '{"verify_data": "..."}'
    },
    {
      id: 'p6', sessionId, streamId: 1, timestamp: time += 0.1, type: 'DATA', direction: 'out', bytes: 512, encrypted: true, flags: ['ENC'],
      hexDump: '0000: 06 00 01 00 00 00 02 00 ...',
      decryptedPayload: 'GET / HTTP/1.1\r\nHost: example.com\r\n\r\n'
    },
    {
      id: 'p7', sessionId, streamId: 1, timestamp: time += 14, type: 'DATA', direction: 'in', bytes: 12288, encrypted: true, flags: ['ENC', 'FIN'],
      hexDump: '0000: 06 00 01 00 00 00 30 00 ...',
      decryptedPayload: 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html><html>...'
    },
  ];
};

export const useInspectorStore = create<InspectorState>((set) => ({
  isCapturing: true,
  packets: generateMockPackets(),
  selectedPacketId: 'p6',
  filterSessionId: null,

  toggleCapture: () => set((state) => ({ isCapturing: !state.isCapturing })),
  clearCapture: () => set({ packets: [], selectedPacketId: null }),
  selectPacket: (id) => set({ selectedPacketId: id }),
  setFilterSession: (id) => set({ filterSessionId: id }),
  
  addPacket: (packet) => set((state) => {
    if (!state.isCapturing) return state;
    const newPacket = { ...packet, id: Math.random().toString(36).substring(7) };
    return { packets: [...state.packets, newPacket] };
  })
}));
