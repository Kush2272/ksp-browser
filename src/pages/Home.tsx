import { Shield, Search, ExternalLink, Activity, Layers, Code, Terminal, FileText, Cpu } from 'lucide-react';
import { useTabStore } from '../store';

export function Home() {
  const { getActiveTab, updateTab, addTab } = useTabStore();
  const activeTab = getActiveTab();

  const developerShortcuts = [
    { name: 'GitHub', url: 'https://github.com', icon: Code },
    { name: 'StackOverflow', url: 'https://stackoverflow.com', icon: Terminal },
    { name: 'Rust Docs', url: 'https://doc.rust-lang.org', icon: Cpu },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: FileText },
    { name: 'crates.io', url: 'https://crates.io', icon: Layers },
    { name: 'Protocol Inspector', url: 'ksp://protocol', icon: Activity },
  ];

  const navigateTo = (url: string, title: string) => {
    if (activeTab) {
      updateTab(activeTab.id, { url, title });
    } else {
      addTab(url);
    }
  };

  return (
    <div className="flex-1 bg-[#0d0e10] p-8 overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-300">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 pt-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/5">
            <Shield className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">KSP Browser Platform</h1>
          <p className="text-sm text-zinc-400">The high-speed desktop browser built for the Kush Secure Protocol</p>
        </div>

        {/* Central Search Bar */}
        <div className="max-w-2xl mx-auto flex items-center bg-[#16181c] border border-[#252830] rounded-2xl p-2 px-4 shadow-xl focus-within:border-amber-500/50 transition-all">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Search the web or enter KSP address..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                const q = e.currentTarget.value;
                const target = q.includes('://') ? q : `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
                navigateTo(target, q);
              }
            }}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-500 font-medium py-2"
          />
          <kbd className="px-2 py-1 text-[10px] font-mono text-zinc-400 bg-[#1f2228] border border-[#252830] rounded">ENTER</kbd>
        </div>

        {/* Speed Dial Shortcuts (Developer Profile) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-zinc-400 tracking-wider">
            <span>Speed Dial Shortcuts</span>
            <span className="text-amber-400 font-mono text-[11px]">Developer Profile</span>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {developerShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.url, item.name)}
                  className="flex flex-col items-center justify-center p-4 bg-[#16181c] hover:bg-[#1f2228] border border-[#252830] hover:border-amber-500/30 rounded-xl transition-all group shadow-sm hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1f2228] group-hover:bg-amber-500/10 flex items-center justify-center text-zinc-300 group-hover:text-amber-400 transition-colors mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-white truncate w-full text-center">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Native Widgets Section */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          {/* Gateway Status Widget */}
          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Gateway Daemon Status</h3>
              </div>
              <button onClick={() => navigateTo('ksp://gateway', 'Gateway Dashboard')} className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium">
                View Native Dashboard <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
              <div className="p-3 bg-[#1f2228] rounded-xl border border-[#252830]">
                <div className="text-zinc-500 text-[10px] uppercase">Listener</div>
                <div className="text-white font-bold mt-0.5">127.0.0.1:8765</div>
              </div>
              <div className="p-3 bg-[#1f2228] rounded-xl border border-[#252830]">
                <div className="text-zinc-500 text-[10px] uppercase">Latency</div>
                <div className="text-emerald-400 font-bold mt-0.5">2.1 ms</div>
              </div>
            </div>
          </div>

          {/* Quick Tools Widget */}
          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Internal Tools</h3>
              <span className="text-xs text-zinc-400">KSP Engine v1.0</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => navigateTo('ksp://protocol', 'Protocol Inspector')} className="p-3 bg-[#1f2228] hover:bg-[#252830] rounded-xl border border-[#252830] text-left font-medium text-zinc-200 transition-colors">
                ⚡ Protocol Inspector
              </button>
              <button onClick={() => navigateTo('ksp://settings', 'Settings')} className="p-3 bg-[#1f2228] hover:bg-[#252830] rounded-xl border border-[#252830] text-left font-medium text-zinc-200 transition-colors">
                ⚙️ Preferences
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
