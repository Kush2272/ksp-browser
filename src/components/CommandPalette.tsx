import { useState, useEffect } from 'react';
import { useTabStore } from '../store';
import { Search, Shield, Activity, Download, Settings, History, Layers } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { addTab, updateTab, getActiveTab } = useTabStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose(); else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeTab = getActiveTab();

  const actions = [
    { id: 'home', title: 'Open Home Page', icon: Shield, action: () => openUrl('ksp://home') },
    { id: 'protocol', title: 'Open Protocol Inspector', icon: Activity, action: () => openUrl('ksp://protocol') },
    { id: 'gateway', title: 'Open Gateway Dashboard', icon: Layers, action: () => openUrl('ksp://gateway') },
    { id: 'downloads', title: 'Open Downloads', icon: Download, action: () => openUrl('ksp://downloads') },
    { id: 'history', title: 'Open History', icon: History, action: () => openUrl('ksp://history') },
    { id: 'settings', title: 'Open Settings', icon: Settings, action: () => openUrl('ksp://settings') },
  ];

  const openUrl = (url: string) => {
    if (activeTab) {
      updateTab(activeTab.id, { url, title: url.replace('ksp://', '') });
    } else {
      addTab(url);
    }
    onClose();
  };

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-xl bg-[#16181c] border border-[#252830] rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 h-12 border-b border-[#252830] gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search (Ctrl+K)..."
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder-zinc-500 font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors gap-3 group text-left"
              >
                <div className="p-1.5 rounded-md bg-zinc-800 group-hover:bg-amber-500/10 text-zinc-400 group-hover:text-amber-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
