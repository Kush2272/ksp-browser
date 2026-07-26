import { useState } from 'react';
import { useTabStore } from '../store';
import { ProtocolInspector } from './ProtocolInspector/ProtocolInspector';
import { Onboarding } from '../pages/Onboarding';
import { Home } from '../pages/Home';
import { NativeGateway } from '../pages/NativeGateway';
import { DownloadsPage } from '../pages/DownloadsPage';
import { SettingsPage } from '../pages/SettingsPage';

export function Viewport() {
  const { getActiveTab } = useTabStore();
  const activeTab = getActiveTab();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  if (!hasCompletedOnboarding && activeTab?.url === 'ksp://start') {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  if (!activeTab) return null;

  // Internal routing for KSP Browser native pages
  if (activeTab.url === 'ksp://protocol') {
    return <ProtocolInspector />;
  }
  if (activeTab.url === 'ksp://home' || activeTab.url === 'ksp://start') {
    return <Home />;
  }
  if (activeTab.url === 'ksp://gateway') {
    return <NativeGateway />;
  }
  if (activeTab.url === 'ksp://downloads') {
    return <DownloadsPage />;
  }
  if (activeTab.url === 'ksp://settings') {
    return <SettingsPage />;
  }

  return (
    <div className="flex-1 bg-[#0d0e10] flex flex-col relative overflow-hidden">
      <iframe
        src={activeTab.url}
        title={activeTab.title}
        className="w-full h-full border-none"
      />
    </div>
  );
}
