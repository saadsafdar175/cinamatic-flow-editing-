/**
 * CineFlow Studio - Windows Desktop Application & Installer Architecture Modal
 * Explains how CineFlow Studio builds into CineFlowStudio.exe and CineFlowStudio-Setup.exe
 */

import React from 'react';
import { X, Monitor, Download, CheckCircle2, Terminal, Shield, Cpu } from 'lucide-react';

interface WindowsInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsInstallerModal: React.FC<WindowsInstallerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#111319] border border-[#232838] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 bg-[#0e1015] border-b border-[#1f2433] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Windows Desktop Application Architecture</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-neutral-300">
          <div className="p-3 bg-[#131722] rounded-lg border border-[#232a3b] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Offline-First Windows Executables</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              CineFlow Studio is fully structured for electron-builder to generate:
            </p>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-amber-400">
              <li>CineFlowStudio.exe (Portable Standalone)</li>
              <li>CineFlowStudio-Setup.exe (Windows NSIS Installer)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Packaging Commands</span>
            </h3>
            <div className="p-2.5 bg-[#0a0c10] border border-[#202534] rounded font-mono text-[11px] text-neutral-300 space-y-1">
              <div className="text-neutral-500"># 1. Compile frontend client</div>
              <div className="text-cyan-400">npm run build</div>
              <div className="text-neutral-500 mt-2"># 2. Package for 64-bit Windows</div>
              <div className="text-emerald-400">npx electron-builder --win --x64</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Native Capabilities Included</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#141720] rounded border border-[#202533] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero cloud dependencies</span>
              </div>
              <div className="p-2 bg-[#141720] rounded border border-[#202533] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>DirectX / WebGL GPU pipeline</span>
              </div>
              <div className="p-2 bg-[#141720] rounded border border-[#202533] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Local .cineflow project files</span>
              </div>
              <div className="p-2 bg-[#141720] rounded border border-[#202533] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Local AI Face Retouching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#0e1015] border-t border-[#1f2433] px-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b202c] hover:bg-[#252c3d] text-white rounded font-medium text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
