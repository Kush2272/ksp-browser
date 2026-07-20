import { useState } from 'react';
import { Settings, Shield, Sliders, HardDrive, Lock, Search, Code, Cpu, Globe, Layers, Eye } from 'lucide-react';

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Eye },
    { id: 'gateway', name: 'Gateway', icon: Layers },
    { id: 'downloads', name: 'Downloads', icon: HardDrive },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'privacy', name: 'Privacy', icon: Lock },
    { id: 'search', name: 'Search', icon: Search },
    { id: 'profiles', name: 'Profiles', icon: Globe },
    { id: 'developer', name: 'Developer', icon: Code },
    { id: 'experimental', name: 'Experimental', icon: Cpu },
    { id: 'advanced', name: 'Advanced', icon: Sliders },
  ];

  return (
    <div className="flex-1 bg-[#0d0e10] flex overflow-hidden">
      {/* Sidebar Categories */}
      <div className="w-64 border-r border-[#252830] bg-[#16181c] p-4 space-y-1">
        <h2 className="text-xs font-bold uppercase text-zinc-400 px-3 py-2 tracking-wider">Browser Preferences</h2>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isSelected
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1f2228]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-[#252830] pb-4">
            <h1 className="text-xl font-bold text-white capitalize">{activeCategory} Preferences</h1>
            <p className="text-xs text-zinc-400">Configure global KSP Browser options for {activeCategory}.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#16181c] border border-[#252830] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Enable KSP Protocol Acceleration</div>
                  <div className="text-xs text-zinc-400">Prioritize zero-RTT KSP sessions over HTTP/2</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-amber-400 w-4 h-4" />
              </div>
            </div>

            <div className="p-4 bg-[#16181c] border border-[#252830] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Default Search Engine</div>
                  <div className="text-xs text-zinc-400">Omnibox query target</div>
                </div>
                <select className="bg-[#1f2228] border border-[#252830] text-xs text-white px-3 py-1.5 rounded-lg outline-none">
                  <option value="duckduckgo">DuckDuckGo</option>
                  <option value="google">Google</option>
                  <option value="brave">Brave Search</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[#16181c] border border-[#252830] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Target Gateway Daemon</div>
                  <div className="text-xs text-zinc-400">KSP translation endpoint</div>
                </div>
                <input
                  type="text"
                  defaultValue="127.0.0.1:8765"
                  className="bg-[#1f2228] border border-[#252830] text-xs font-mono text-amber-400 px-3 py-1.5 rounded-lg outline-none w-48 text-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
