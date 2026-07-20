import React from 'react';
import { useTabStore } from '../store';
import { Activity } from 'lucide-react';

export function Viewport() {
  const { getActiveTab } = useTabStore();
  const activeTab = getActiveTab();

  if (!activeTab) return null;

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* 
        This is a placeholder for the actual webview rendering engine.
        In Milestone 2, this will either embed an iframe (for HTTP) or a custom KSP renderer.
      */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <Activity className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
          KSP Browser Engine
        </h1>
        
        <p className="text-zinc-400 max-w-md text-lg">
          The native rendering engine is waiting for connections.
        </p>

        <div className="mt-8 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner w-full max-w-lg flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">Current Destination:</span>
          <span className="text-sm font-mono text-emerald-400 truncate ml-4">{activeTab.url}</span>
        </div>
        
      </div>
    </div>
  );
}
