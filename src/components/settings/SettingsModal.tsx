/**
 * CineFlow Studio - Workspace & Preferences Settings Modal
 * Offline configuration: GPU hardware acceleration, proxy media, face detection, autosave, cache
 */

import React, { useState } from 'react';
import {
  X,
  Settings,
  Cpu,
  Monitor,
  Zap,
  HardDrive,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'performance' | 'export' | 'ai' | 'cache'>('general');
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [proxyMedia, setProxyMedia] = useState(false);
  const [previewQuality, setPreviewQuality] = useState<'full' | 'half' | 'quarter'>('full');
  const [autosaveInterval, setAutosaveInterval] = useState(30);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    localStorage.removeItem('cineflow_cache');
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#111319] border border-[#232838] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 bg-[#0e1015] border-b border-[#1f2433] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-white">CineFlow Studio Preferences</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Tabs */}
        <div className="flex border-b border-[#1c212e] bg-[#0c0e13] px-4 gap-4 text-xs font-medium">
          {(['general', 'performance', 'export', 'ai', 'cache'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-neutral-300 min-h-[260px]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Application Theme</div>
                  <div className="text-[11px] text-neutral-500">Dark cinematic workstation interface</div>
                </div>
                <span className="text-neutral-400 font-medium">Cinematic Dark</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Default Interface Language</div>
                  <div className="text-[11px] text-neutral-500">Urdu Nastaliq and English typography support</div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ur')}
                  className="bg-[#171b26] border border-[#262c3e] rounded px-2.5 py-1 text-white outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="ur">اردو (Urdu)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Autosave Interval</div>
                  <div className="text-[11px] text-neutral-500">Local non-destructive project backups</div>
                </div>
                <span className="font-mono-numbers text-amber-400 font-medium">{autosaveInterval} seconds</span>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#141722] rounded-lg border border-[#232b3d]">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-white">Hardware GPU Acceleration</div>
                    <div className="text-[10px] text-neutral-400">DirectX / WebGL 2.0 hardware compositing</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={gpuAcceleration}
                  onChange={(e) => setGpuAcceleration(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#141722] rounded-lg border border-[#232b3d]">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold text-white">Proxy Editing Mode</div>
                    <div className="text-[10px] text-neutral-400">Generates lightweight 720p proxies for 4K footage</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={proxyMedia}
                  onChange={(e) => setProxyMedia(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Timeline Playback Resolution</span>
                <select
                  value={previewQuality}
                  onChange={(e) => setPreviewQuality(e.target.value as 'full' | 'half' | 'quarter')}
                  className="bg-[#171b26] border border-[#262c3e] rounded px-2.5 py-1 text-white outline-none"
                >
                  <option value="full">Full 1080p / 4K</option>
                  <option value="half">1/2 Quality (Fast)</option>
                  <option value="quarter">1/4 Quality (High Performance)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Default Export Format</span>
                <span className="font-mono-numbers text-amber-400">MP4 (H.264)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Default Video Frame Rate</span>
                <span className="font-mono-numbers text-neutral-300">30 FPS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Default Master Resolution</span>
                <span className="font-mono-numbers text-neutral-300">1920 × 1080 Full HD</span>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#141722] rounded-lg border border-[#232b3d] space-y-1">
                <div className="font-semibold text-white">100% Offline AI Execution</div>
                <p className="text-[10px] text-neutral-400">
                  Face detection, facial landmark tracking, and skin segmentation operate completely on the local CPU/GPU. No video frames leave your computer.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Local Thumbnail & Waveform Cache</div>
                  <div className="text-[10px] text-neutral-400">Stored inside browser local workspace sandbox</div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cache</span>
                </button>
              </div>

              {clearedNotice && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Local cache successfully cleared.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#0e1015] border-t border-[#1f2433] px-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b202c] hover:bg-[#252c3d] text-white rounded font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
