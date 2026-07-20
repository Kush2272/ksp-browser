import { Download, ShieldCheck, FileText, CheckCircle2, Pause, Trash2 } from 'lucide-react';

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  sizeMb: number;
  downloadedMb: number;
  speed: string;
  progressPercent: number;
  sha256: string;
  sha512: string;
  certVerified: boolean;
  status: 'downloading' | 'completed' | 'paused';
}

export function DownloadsPage() {
  const downloads: DownloadItem[] = [
    {
      id: 'dl-1',
      name: 'ksp-gateway-v1.0.1-windows-x64.zip',
      url: 'https://github.com/Kush2272/ksp-gateway/releases/download/v1.0.1/bin.zip',
      sizeMb: 48.2,
      downloadedMb: 48.2,
      speed: '0 MB/s',
      progressPercent: 100,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      sha512: 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
      certVerified: true,
      status: 'completed',
    },
    {
      id: 'dl-2',
      name: 'ubuntu-24.04-desktop-amd64.iso',
      url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      sizeMb: 5800,
      downloadedMb: 3944,
      speed: '34.2 MB/s',
      progressPercent: 68,
      sha256: 'a2f913d8e5781a7b...',
      sha512: 'b491a92e1050...',
      certVerified: true,
      status: 'downloading',
    },
  ];

  return (
    <div className="flex-1 bg-[#0d0e10] p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252830] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Download Platform Manager</h1>
              <p className="text-xs text-zinc-400">Multi-hash Integrity & Origin Certificate Audited Downloads</p>
            </div>
          </div>
        </div>

        {/* Download Items */}
        <div className="space-y-4">
          {downloads.map((item) => (
            <div key={item.id} className="p-5 bg-[#16181c] border border-[#252830] rounded-xl space-y-4 shadow-sm hover:border-[#353842] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-amber-400 p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <p className="text-xs font-mono text-zinc-400 truncate max-w-lg mt-0.5">{item.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'downloading' ? (
                    <button className="p-2 bg-[#1f2228] hover:bg-[#252830] text-zinc-300 rounded-lg border border-[#252830]">
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 bg-[#1f2228] hover:bg-[#252830] text-emerald-400 rounded-lg border border-[#252830]">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 bg-[#1f2228] hover:bg-[#252830] text-red-400 rounded-lg border border-[#252830]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">{item.downloadedMb} MB / {item.sizeMb} MB</span>
                  <span className="text-amber-400 font-bold">{item.progressPercent}% ({item.speed})</span>
                </div>
                <div className="w-full h-2 bg-[#1f2228] rounded-full overflow-hidden border border-[#252830]">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Verification Badges */}
              <div className="flex items-center gap-4 text-xs font-mono pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SHA256 VERIFIED
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
                  SHA512 VERIFIED
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-semibold">
                  TLS CERT AUDITED
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
