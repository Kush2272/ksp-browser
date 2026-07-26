import React, { useState, useEffect } from 'react';
import { useTabStore } from '../store';
import { useHistoryStore } from '../store/historyStore';
import { classifyAddressSync, classifyAddress } from '../utils/address';
import { ArrowLeft, ArrowRight, RotateCw, Shield, Lock, Search, Plus } from 'lucide-react';

export function AddressBar() {
  const { getActiveTab, navigate, goBack, goForward, canGoBack, canGoForward, addTab, updateTab } = useTabStore();
  const addHistory = useHistoryStore((s) => s.addHistory);
  const activeTab = getActiveTab();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setInputValue(activeTab.url);
    }
  }, [activeTab?.id, activeTab?.url]);

  if (!activeTab) return null;

  const back = canGoBack(activeTab.id);
  const forward = canGoForward(activeTab.id);

  const commit = async () => {
    // Use the authoritative Rust classifier via IPC.
    const classification = await classifyAddress(inputValue);
    navigate(activeTab.id, classification.normalized, classification.hostname || undefined);
    if (classification.family !== 'ksp') {
      addHistory(classification.normalized, classification.hostname);
    }
    setInputValue(classification.normalized);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setInputValue(activeTab.url);
      (e.target as HTMLInputElement).blur();
    }
  };

  const reload = () => {
    // Nudge the URL to force the Viewport effect to re-run.
    updateTab(activeTab.id, { isLoading: true });
    const current = activeTab.url;
    navigate(activeTab.id, current);
    setTimeout(() => updateTab(activeTab.id, { isLoading: false }), 400);
  };

  const isKsp = activeTab.url.startsWith('ksp://');
  const isHttps = activeTab.url.startsWith('https://');
  const isHttp = activeTab.url.startsWith('http://');

  const navBtn = (enabled: boolean) =>
    `p-1.5 rounded-md transition-colors ${
      enabled
        ? 'text-zinc-300 hover:text-white hover:bg-zinc-700/70'
        : 'text-zinc-600 cursor-default'
    }`;

  return (
    <div className="flex items-center h-12 bg-[#16181c] border-b border-[#252830] px-2.5 gap-2 text-zinc-100">
      {/* Navigation controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => back && goBack(activeTab.id)}
          disabled={!back}
          title="Back"
          className={navBtn(back)}
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={() => forward && goForward(activeTab.id)}
          disabled={!forward}
          title="Forward"
          className={navBtn(forward)}
        >
          <ArrowRight className="w-[18px] h-[18px]" />
        </button>
        <button onClick={reload} title="Reload" className={navBtn(true)}>
          <RotateCw className={`w-[18px] h-[18px] ${activeTab.isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Omnibox */}
      <div
        className={`flex-1 flex items-center bg-[#0d0e10] border rounded-full h-9 px-3.5 gap-2.5 transition-all ${
          isFocused
            ? 'border-emerald-500/50 ring-2 ring-emerald-500/15'
            : 'border-[#252830] hover:border-zinc-600'
        }`}
      >
        <div className="flex-shrink-0" title={isKsp ? 'Secured by KSP' : isHttps ? 'HTTPS via KSP tunnel' : 'Unencrypted upstream'}>
          {isKsp ? (
            <Shield className="w-4 h-4 text-amber-400" />
          ) : isHttps ? (
            <Lock className="w-4 h-4 text-emerald-400" />
          ) : isHttp ? (
            <Lock className="w-4 h-4 text-zinc-500" />
          ) : (
            <Search className="w-4 h-4 text-zinc-500" />
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => { setIsFocused(true); e.target.select(); }}
          onBlur={() => setIsFocused(false)}
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-zinc-500 truncate text-zinc-100"
          placeholder="Search or enter a KSP / web address"
        />
        {!isKsp && (isHttps || isHttp) && (
          <span className="flex-shrink-0 text-[10px] font-semibold tracking-wide text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
            KSP TUNNEL
          </span>
        )}
      </div>

      {/* New tab */}
      <button
        onClick={() => addTab()}
        title="New Tab"
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/70 rounded-md transition-colors"
      >
        <Plus className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
