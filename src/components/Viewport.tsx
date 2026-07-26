import { useState, useEffect, useRef } from 'react';
import { useTabStore } from '../store';
import { ProtocolInspector } from './ProtocolInspector/ProtocolInspector';
import { Onboarding } from '../pages/Onboarding';
import { Home } from '../pages/Home';
import { NativeGateway } from '../pages/NativeGateway';
import { DownloadsPage } from '../pages/DownloadsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { toTunnelUrl } from '../utils/tunnel';

export function Viewport() {
  const { getActiveTab, updateTab } = useTabStore();
  const activeTab = getActiveTab();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isExternal = !!activeTab?.url && activeTab.url.startsWith('http');
  const tunnelUrl = isExternal ? (toTunnelUrl(activeTab!.url) ?? activeTab!.url) : null;

  // Reflect iframe load state on the tab's loading spinner.
  useEffect(() => {
    if (isExternal && activeTab) {
      updateTab(activeTab.id, { isLoading: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.id, tunnelUrl]);

  if (!hasCompletedOnboarding && activeTab?.url === 'ksp://start') {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  if (!activeTab) return null;

  // 1. Native KSP system pages (built-in browser UI).
  if (activeTab.url === 'ksp://protocol') return <ProtocolInspector />;
  if (activeTab.url === 'ksp://home' || activeTab.url === 'ksp://start') return <Home />;
  if (activeTab.url === 'ksp://gateway') return <NativeGateway />;
  if (activeTab.url === 'ksp://downloads') return <DownloadsPage />;
  if (activeTab.url === 'ksp://settings') return <SettingsPage />;

  // 2. External web content — rendered through the KSP gateway via the
  //    `kspweb` custom scheme. The iframe's document and every relative
  //    subresource are fetched over the encrypted KSP tunnel.
  if (isExternal && tunnelUrl) {
    return (
      <div className="flex-1 bg-white relative overflow-hidden">
        <iframe
          ref={iframeRef}
          // key forces a fresh element on URL change so reload/navigation works.
          key={tunnelUrl}
          src={tunnelUrl}
          onLoad={() => updateTab(activeTab.id, { isLoading: false })}
          title={activeTab.title}
          className="absolute inset-0 w-full h-full border-0 bg-white"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  // 3. Fallback for anything else.
  return (
    <div className="flex-1 bg-[#0d0e10] flex flex-col items-center justify-center gap-3 text-zinc-500">
      <p className="text-sm">Unsupported address</p>
      <p className="text-xs font-mono text-zinc-600">{activeTab.url}</p>
    </div>
  );
}
