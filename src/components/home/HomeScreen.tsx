/**
 * CineFlow Studio - Premium Cinematic Home Screen
 * Project launchpad with aspect ratio presets (16:9 YouTube, 9:16 Shorts/TikTok, 1:1, 4:5, 21:9),
 * recent project history, and local .cineflow open file picker.
 */

import React, { useState } from 'react';
import {
  Film,
  Plus,
  FolderOpen,
  Monitor,
  Smartphone,
  Square,
  Instagram,
  Clapperboard,
  Clock,
  Trash2,
  HardDrive,
  Download,
  Settings,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { AspectRatioPreset } from '../../types/editor';
import { getRecentProjects, importCineflowFile, RecentProjectItem } from '../../services/projectStorage';
import { formatTimeSeconds } from '../../utils/timecode';

interface HomeScreenProps {
  onEnterEditor: () => void;
  onOpenSettings: () => void;
  onOpenWindowsAppModal: () => void;
}

const PRESETS: Array<{
  id: AspectRatioPreset;
  title: string;
  subtitle: string;
  resolution: string;
  icon: React.ElementType;
}> = [
  { id: '16:9', title: 'YouTube 16:9', subtitle: 'Standard Landscape Video', resolution: '1920 × 1080', icon: Monitor },
  { id: '9:16', title: 'Shorts & TikTok 9:16', subtitle: 'Vertical Reels & Stories', resolution: '1080 × 1920', icon: Smartphone },
  { id: '21:9', title: 'Cinematic 21:9', subtitle: 'Anamorphic Widescreen', resolution: '2560 × 1080', icon: Clapperboard },
  { id: '1:1', title: 'Square 1:1', subtitle: 'Social Feed & Carousel', resolution: '1080 × 1080', icon: Square },
  { id: '4:5', title: 'Portrait 4:5', subtitle: 'Instagram Portrait Feed', resolution: '1080 × 1350', icon: Instagram },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onEnterEditor,
  onOpenSettings,
  onOpenWindowsAppModal,
}) => {
  const { newProject, loadProject } = useEditor();
  const [recentProjects, setRecentProjects] = useState<RecentProjectItem[]>(() => getRecentProjects());
  const [customName, setCustomName] = useState('New CineFlow Masterpiece');
  const [selectedPreset, setSelectedPreset] = useState<AspectRatioPreset>('16:9');

  const handleCreateNew = () => {
    newProject(customName.trim() || 'Untitled Project', selectedPreset);
    onEnterEditor();
  };

  const handleOpenFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const proj = await importCineflowFile(file);
      loadProject(proj);
      onEnterEditor();
    } catch {
      alert('Invalid or corrupted .cineflow file');
    }
  };

  return (
    <div className="flex h-screen bg-[#090a0d] text-[#e1e4ea] select-none overflow-hidden">
      {/* Left Navigation Rail */}
      <aside className="w-56 bg-[#0c0d12] border-r border-[#191c24] flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Film className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-sm text-white">
                CINEFLOW <span className="text-amber-500">STUDIO</span>
              </div>
              <div className="text-[10px] text-neutral-500">Offline Desktop Editor</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={onEnterEditor}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 font-medium text-xs text-left"
            >
              <Film className="w-4 h-4" />
              <span>Workspace Editor</span>
            </button>

            <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#161922] font-medium text-xs text-left cursor-pointer transition-colors">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Open .cineflow</span>
              <input
                type="file"
                accept=".cineflow,application/json"
                onChange={handleOpenFromFile}
                className="hidden"
              />
            </label>

            <button
              onClick={onOpenWindowsAppModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#161922] font-medium text-xs text-left transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Windows .exe App</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#161922] font-medium text-xs text-left transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>Preferences</span>
            </button>
          </nav>
        </div>

        {/* Offline Badge */}
        <div className="p-3 bg-[#131620] rounded-lg border border-[#1f2533] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% Offline Ready</span>
          </div>
          <p className="text-[10px] text-neutral-400">
            All grading, face retouch, and rendering execute locally on this device.
          </p>
        </div>
      </aside>

      {/* Main Home Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Project</h1>
          <p className="text-xs text-neutral-400">
            Select a canvas ratio for cinematic widescreen, YouTube, TikTok, or social video editing.
          </p>
        </div>

        {/* Project Name & Preset Selection */}
        <div className="bg-[#101218] border border-[#1e2330] rounded-xl p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Project Title</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full max-w-md bg-[#161922] border border-[#262c3e] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">Select Project Ratio Preset</label>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                        : 'bg-[#141720] border-[#222736] text-neutral-300 hover:bg-[#1a1f2c]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-[#1b202c] text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono-numbers text-[10px] text-neutral-400">
                        {p.resolution}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-white">{p.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{p.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Project</span>
            </button>

            <button
              onClick={onEnterEditor}
              className="px-4 py-2.5 bg-[#171b25] hover:bg-[#202534] border border-[#272e3f] text-neutral-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
            >
              Resume Current Project
            </button>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Recent Projects</span>
            </h2>
            <span className="text-[11px] text-neutral-500">{recentProjects.length} saved</span>
          </div>

          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recentProjects.map((rp) => (
                <div
                  key={rp.id}
                  onClick={onEnterEditor}
                  className="p-3.5 bg-[#10131a] hover:bg-[#161a24] border border-[#1e2330] hover:border-amber-500/50 rounded-xl flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-[#181c26] border border-[#262c3e] flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                        {rp.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{rp.aspectRatio}</span>
                        <span>·</span>
                        <span className="font-mono-numbers">{formatTimeSeconds(rp.duration)}</span>
                        <span>·</span>
                        <span>{rp.clipCount} clips</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-amber-500 font-medium group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#101218] border border-[#1e2330] rounded-xl text-center text-xs text-neutral-500">
              No recent projects recorded yet. Create or save your first project above.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
