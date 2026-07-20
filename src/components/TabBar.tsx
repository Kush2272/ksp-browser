import React from 'react';
import { useTabStore } from '../store';
import { Plus, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export function TabBar() {
  const { tabs, addTab, closeTab, setActiveTab, getActiveTab } = useTabStore();

  return (
    <div className="flex items-center h-10 bg-zinc-900 border-b border-zinc-800 text-sm select-none" data-tauri-drag-region>
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden hide-scrollbar items-end h-full px-2 gap-1 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.isActive;
          const isKsp = tab.url.startsWith('ksp://');
          
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group flex items-center h-full min-w-[150px] max-w-[240px] px-3 gap-2 rounded-t-md cursor-pointer transition-colors border border-b-0
                ${isActive 
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50' 
                  : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300'}
              `}
            >
              <div className="flex-shrink-0">
                {isKsp ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 truncate text-xs font-medium">
                {tab.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={`flex-shrink-0 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 ${isActive ? 'opacity-100' : ''}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={() => addTab()}
        className="mx-2 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
