import React, { useState, useEffect } from 'react';
import { useTabStore } from '../store';
import { classifyAddress } from '../utils/address';
import { ArrowLeft, ArrowRight, RotateCw, Shield, Lock, Search } from 'lucide-react';

export function AddressBar() {
  const { getActiveTab, updateTab } = useTabStore();
  const activeTab = getActiveTab();
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (activeTab) {
      setInputValue(activeTab.url);
    }
  }, [activeTab?.id, activeTab?.url]);

  if (!activeTab) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const classification = classifyAddress(inputValue);
      updateTab(activeTab.id, { 
        url: classification.normalized,
        title: classification.hostname || 'Loading...'
      });
      setInputValue(classification.normalized);
    }
  };

  const isKsp = activeTab.url.startsWith('ksp://');
  const isHttps = activeTab.url.startsWith('https://');

  return (
    <div className="flex items-center h-12 bg-zinc-800 border-b border-zinc-700/50 px-2 gap-2 text-zinc-100">
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-30">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-30">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-full transition-colors">
          <RotateCw className={`w-4 h-4 ${activeTab.isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-700/50 rounded-full h-8 px-3 gap-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
        <div className="flex-shrink-0">
          {isKsp ? (
            <Shield className="w-4 h-4 text-emerald-400" />
          ) : isHttps ? (
            <Lock className="w-4 h-4 text-zinc-400" />
          ) : (
            <Search className="w-4 h-4 text-zinc-500" />
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-zinc-500 truncate"
          placeholder="Search or enter KSP address..."
        />
      </div>

      <div className="flex items-center gap-1 px-2">
        <button className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors text-xs font-semibold tracking-wider">
          KSP
        </button>
      </div>
    </div>
  );
}
