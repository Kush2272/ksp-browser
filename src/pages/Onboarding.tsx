import { useState } from 'react';
import { Shield, Lock, Search, Code, Globe, GraduationCap, BookOpen, Layers, Check, ArrowRight } from 'lucide-react';
import { useTabStore } from '../store';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedSearch, setSelectedSearch] = useState('duckduckgo');
  const [selectedProfile, setSelectedProfile] = useState('developer');
  const [gatewayChoice, setGatewayChoice] = useState('local');

  const { addTab, getActiveTab, updateTab } = useTabStore();

  const handleFinish = () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      updateTab(activeTab.id, { url: 'ksp://home', title: 'KSP Home' });
    } else {
      addTab('ksp://home');
    }
    onComplete();
  };

  return (
    <div className="flex-1 bg-[#0d0e10] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#16181c] border border-[#252830] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#252830]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">KSP Browser Setup</h2>
              <p className="text-xs text-zinc-400">Step {step} of 5</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-amber-400' : i < step ? 'w-2 bg-amber-500/50' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & KSP Vision */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h1 className="text-2xl font-bold text-white">Welcome to KSP Browser</h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              A high-performance desktop browser engineered from the ground up for the Kush Secure Protocol (KSP).
            </p>

            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="p-4 rounded-xl bg-[#1f2228] border border-[#252830] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">0</div>
                <h3 className="text-sm font-semibold text-white">Zero-RTT Handshake</h3>
                <p className="text-xs text-zinc-400">Sub-millisecond connection setup with session resumption.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#1f2228] border border-[#252830] space-y-2">
                <Shield className="w-6 h-6 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Native AEAD Encryption</h3>
                <p className="text-xs text-zinc-400">Hardware-accelerated AES-256-GCM session cryptography.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#1f2228] border border-[#252830] space-y-2">
                <Layers className="w-6 h-6 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Gateway Interop</h3>
                <p className="text-xs text-zinc-400">Seamless translation between KSP frames and HTTPS/WSS web standards.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Search Engine Setup */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">Select Default Search Engine</h1>
              <p className="text-xs text-zinc-400 mt-1">Choose your preferred default search provider for omnibox queries.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'duckduckgo', name: 'DuckDuckGo', desc: 'Privacy-focused search', icon: Shield },
                { id: 'google', name: 'Google', desc: 'Standard global web search', icon: Search },
                { id: 'brave', name: 'Brave Search', desc: 'Independent private index', icon: Lock },
                { id: 'ksp', name: 'KSP Search', desc: 'Native KSP index (Experimental)', icon: Globe },
              ].map((engine) => {
                const Icon = engine.icon;
                const isSelected = selectedSearch === engine.id;
                return (
                  <button
                    key={engine.id}
                    onClick={() => setSelectedSearch(engine.id)}
                    className={`flex items-start p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#1f2228] border-[#252830] text-zinc-300 hover:bg-[#252830]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold flex items-center justify-between">
                        {engine.name}
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{engine.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Profile Templates */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">Choose Profile Template</h1>
              <p className="text-xs text-zinc-400 mt-1">Preset shortcuts and speed dial bookmarks tailored to your workflow.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'developer', name: 'Developer', desc: 'GitHub, StackOverflow, Rust Docs, MDN', icon: Code },
                { id: 'standard', name: 'Standard', desc: 'YouTube, Wikipedia, LinkedIn, X, Reddit', icon: Globe },
                { id: 'student', name: 'Student', desc: 'Notion, Google Classroom, Wikipedia, Docs', icon: GraduationCap },
                { id: 'research', name: 'Research', desc: 'ArXiv, Google Scholar, Semantic Scholar', icon: BookOpen },
              ].map((prof) => {
                const Icon = prof.icon;
                const isSelected = selectedProfile === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => setSelectedProfile(prof.id)}
                    className={`flex items-start p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-[#1f2228] border-[#252830] text-zinc-300 hover:bg-[#252830]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold flex items-center justify-between">
                        {prof.name}
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{prof.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Gateway Configuration */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">KSP Gateway Connection</h1>
              <p className="text-xs text-zinc-400 mt-1">Configure your target KSP Gateway translation bridge.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'local', title: 'Local Gateway (Default)', desc: 'Connect to local daemon on 127.0.0.1:8765' },
                { id: 'remote', title: 'Remote Edge Cluster', desc: 'Connect to Anycast regional gateway cluster' },
                { id: 'discover', title: 'Auto-Discover', desc: 'Scan local network for active KSP gateways' },
              ].map((gw) => (
                <label
                  key={gw.id}
                  onClick={() => setGatewayChoice(gw.id)}
                  className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                    gatewayChoice === gw.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-[#1f2228] border-[#252830] text-zinc-300 hover:bg-[#252830]'
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{gw.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{gw.desc}</div>
                  </div>
                  <input
                    type="radio"
                    checked={gatewayChoice === gw.id}
                    onChange={() => {}}
                    className="accent-amber-400 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Ready to Launch */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center py-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Check className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-white">KSP Browser Ready</h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Your browser platform is configured with the <span className="text-amber-400 font-semibold uppercase">{selectedProfile}</span> profile template and connected to the gateway.
            </p>

            <div className="p-4 bg-[#1f2228] border border-[#252830] rounded-xl text-left max-w-md mx-auto space-y-2 text-xs font-mono text-zinc-300">
              <div>✓ Search Engine: <span className="text-white capitalize">{selectedSearch}</span></div>
              <div>✓ Profile Mode: <span className="text-white capitalize">{selectedProfile}</span></div>
              <div>✓ Gateway Target: <span className="text-white">127.0.0.1:8765</span></div>
              <div>✓ Developer Tools: <span className="text-emerald-400">Enabled</span></div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#252830]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg bg-[#1f2228] hover:bg-[#252830] text-zinc-300 text-sm font-medium transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              Launch KSP Browser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
