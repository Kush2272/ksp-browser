import { useState, useEffect } from 'react';
import { Layers, Activity, RefreshCw, Server, Clock, HardDrive } from 'lucide-react';

export function NativeGateway() {
  const [stats, setStats] = useState<any>({
    active_sessions: 3,
    uptime_secs: 1420,
    version: '0.1.0',
    bandwidth_in_mb: 142.8,
    bandwidth_out_mb: 38.4,
    cache_hit_percent: 74.2,
  });

  const [sessions, setSessions] = useState<any[]>([
    { id: 'sess-8491', peer: '127.0.0.1:52140', connected_at: '2026-07-20T03:30:00Z', requests: 42, bytes_in: 104200, bytes_out: 412000 },
    { id: 'sess-9120', peer: '127.0.0.1:52188', connected_at: '2026-07-20T03:41:12Z', requests: 18, bytes_in: 52100, bytes_out: 120400 },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchGatewayStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:9090/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats((prev: any) => ({ ...prev, ...data }));
      }
      const sRes = await fetch('http://127.0.0.1:9090/api/sessions');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSessions(sData);
      }
    } catch (e) {
      console.log('Gateway API offline or unreachable using mock stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayStats();
    const interval = setInterval(fetchGatewayStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-[#0d0e10] p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252830] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">KSP Gateway Dashboard</h1>
              <p className="text-xs text-zinc-400">Live Native Gateway Status & Session Monitor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GATEWAY ONLINE
            </div>
            <button
              onClick={fetchGatewayStats}
              className="p-2 bg-[#1f2228] hover:bg-[#252830] border border-[#252830] text-zinc-300 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Active KSP Sessions</span>
              <Server className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stats.active_sessions}</div>
            <div className="text-[11px] text-zinc-500">Connected peers</div>
          </div>

          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Uptime</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{Math.floor(stats.uptime_secs / 60)}m {stats.uptime_secs % 60}s</div>
            <div className="text-[11px] text-zinc-500">Daemon version {stats.version}</div>
          </div>

          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Bandwidth (In / Out)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stats.bandwidth_in_mb} MB</div>
            <div className="text-[11px] text-zinc-500">Out: {stats.bandwidth_out_mb} MB</div>
          </div>

          <div className="p-5 bg-[#16181c] border border-[#252830] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Cache Hit Ratio</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{stats.cache_hit_percent}%</div>
            <div className="text-[11px] text-zinc-500">LRU + Disk Cache</div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-[#16181c] border border-[#252830] rounded-xl overflow-hidden space-y-4 p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active KSP Gateway Sessions</h3>
          
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-[#252830] text-zinc-500">
                <th className="py-2.5 px-3 font-semibold">SESSION ID</th>
                <th className="py-2.5 px-3 font-semibold">PEER ADDRESS</th>
                <th className="py-2.5 px-3 font-semibold">CONNECTED AT</th>
                <th className="py-2.5 px-3 font-semibold">REQUESTS</th>
                <th className="py-2.5 px-3 font-semibold">BYTES IN</th>
                <th className="py-2.5 px-3 font-semibold">BYTES OUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252830]/50 text-zinc-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#1f2228]/50 transition-colors">
                  <td className="py-3 px-3 text-amber-400">{s.id}</td>
                  <td className="py-3 px-3">{s.peer}</td>
                  <td className="py-3 px-3 text-zinc-400">{new Date(s.connected_at).toLocaleTimeString()}</td>
                  <td className="py-3 px-3 font-bold text-white">{s.requests}</td>
                  <td className="py-3 px-3 text-emerald-400">{(s.bytes_in / 1024).toFixed(1)} KB</td>
                  <td className="py-3 px-3 text-cyan-400">{(s.bytes_out / 1024).toFixed(1)} KB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
