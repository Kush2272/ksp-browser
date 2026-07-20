import React from 'react';
import { useInspectorStore } from '../../store/inspectorStore';
import { Play, Square, Download, RotateCcw, Lock, Unlock, Network, Database } from 'lucide-react';

export function ProtocolInspector() {
  const { isCapturing, toggleCapture, clearCapture, packets, selectedPacketId, selectPacket } = useInspectorStore();

  const selectedPacket = packets.find(p => p.id === selectedPacketId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0e10] text-[#e8eaf0] font-sans">
      {/* Toolbar */}
      <div className="flex items-center h-12 bg-[#16181c] border-b border-[#252830] px-4 gap-4 shrink-0">
        <div className="flex items-center gap-2 border-r border-[#252830] pr-4">
          <Network className="w-5 h-5 text-[#00e5ff]" />
          <span className="font-semibold tracking-wide">KSP Protocol Inspector</span>
          <span className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={toggleCapture}
            className={`p-1.5 rounded transition-colors ${isCapturing ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
            title={isCapturing ? "Stop Capture" : "Start Capture"}
          >
            {isCapturing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={clearCapture} className="p-1.5 text-[#6b7280] hover:text-[#e8eaf0] hover:bg-[#252830] rounded transition-colors" title="Clear">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1"></div>

        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#6b7280] hover:text-[#e8eaf0] hover:bg-[#252830] rounded transition-colors border border-[#252830]">
          <Download className="w-4 h-4" />
          Export .ksp-cap
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Timeline (Left Panel) */}
        <div className="w-1/2 flex flex-col border-r border-[#252830]">
          <div className="px-4 py-2 bg-[#16181c] border-b border-[#252830] text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            Session Timeline
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-sm hide-scrollbar">
            {packets.map((pkt) => (
              <div 
                key={pkt.id} 
                onClick={() => selectPacket(pkt.id)}
                className={`flex items-center py-1 px-2 mb-1 cursor-pointer rounded border ${
                  selectedPacketId === pkt.id 
                    ? 'bg-[#1e2026] border-[#00e5ff]/30 text-[#00e5ff]' 
                    : 'border-transparent hover:bg-[#16181c] text-[#e8eaf0]'
                }`}
              >
                <div className="w-16 shrink-0 text-[#6b7280]">{pkt.timestamp.toFixed(1)}ms</div>
                <div className="w-8 shrink-0 flex items-center justify-center">
                  {pkt.direction === 'in' ? (
                    <span className="text-emerald-400">─◀─</span>
                  ) : (
                    <span className="text-indigo-400">─▶─</span>
                  )}
                </div>
                <div className="flex-1 truncate font-semibold">
                  {pkt.type}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {pkt.encrypted && <Lock className="w-3.5 h-3.5 text-[#f5c518]" />}
                  <span className="text-xs text-[#6b7280]">({pkt.bytes} bytes)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frame Detail (Right Panel) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 bg-[#16181c] border-b border-[#252830] text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            Frame Detail
          </div>
          
          {selectedPacket ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 grid grid-cols-4 gap-4 border-b border-[#252830] bg-[#16181c]/50">
                <div>
                  <div className="text-xs text-[#6b7280] mb-1 uppercase">Type</div>
                  <div className="font-mono text-sm font-semibold text-[#00e5ff]">{selectedPacket.type}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] mb-1 uppercase">Stream ID</div>
                  <div className="font-mono text-sm">{selectedPacket.streamId}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] mb-1 uppercase">Encryption</div>
                  <div className="font-mono text-sm flex items-center gap-1.5">
                    {selectedPacket.encrypted ? <Lock className="w-3.5 h-3.5 text-[#f5c518]" /> : <Unlock className="w-3.5 h-3.5 text-red-400" />}
                    {selectedPacket.encrypted ? 'AES-GCM' : 'Plaintext'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280] mb-1 uppercase">Flags</div>
                  <div className="flex gap-1">
                    {selectedPacket.flags.length > 0 ? selectedPacket.flags.map(f => (
                      <span key={f} className="px-1.5 py-0.5 rounded bg-[#252830] font-mono text-[10px] text-[#e8eaf0]">{f}</span>
                    )) : <span className="text-[#6b7280] text-sm">-</span>}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 overflow-hidden">
                {/* Hex Dump */}
                <div className="border-r border-[#252830] flex flex-col">
                  <div className="px-4 py-1.5 bg-[#1e2026] text-xs font-medium text-[#6b7280] border-b border-[#252830] flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" /> Raw Hex
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#e8eaf0] whitespace-pre-wrap leading-relaxed">
                    {selectedPacket.hexDump}
                  </div>
                </div>
                
                {/* Decrypted Payload */}
                <div className="flex flex-col bg-[#16181c]/30">
                  <div className="px-4 py-1.5 bg-[#1e2026] text-xs font-medium text-[#6b7280] border-b border-[#252830] flex items-center justify-between">
                    <span>Decrypted Payload</span>
                    {selectedPacket.encrypted && (
                      <span className="text-[#22c55e] flex items-center gap-1"><Unlock className="w-3 h-3" /> AEAD Authenticated</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#e8eaf0] whitespace-pre-wrap leading-relaxed break-all">
                    {selectedPacket.decryptedPayload || <span className="text-[#6b7280] italic">No payload or binary data</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#6b7280]">
              Select a frame from the timeline to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
