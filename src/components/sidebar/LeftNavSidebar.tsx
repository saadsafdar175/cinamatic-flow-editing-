/**
 * CineFlow Studio - Left Navigation Sidebar
 * Primary tool selection: Media, Video, Audio, Text, Effects, Filters, Color, Retouch, Speed, Transitions, Keyframes, Settings
 */

import React from 'react';
import {
  FolderPlus,
  Video,
  Music,
  Type,
  Sparkles,
  SlidersHorizontal,
  Palette,
  Smile,
  Gauge,
  Shuffle,
  Diamond,
  Download,
  Settings,
  Home,
  Aperture,
  Grid,
} from 'lucide-react';
import { SidebarTab } from '../../types/editor';
import { useEditor } from '../../context/EditorContext';

interface LeftNavSidebarProps {
  onGoHome: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
}

export const LeftNavSidebar: React.FC<LeftNavSidebarProps> = ({
  onGoHome,
  onOpenExportModal,
  onOpenSettingsModal,
}) => {
  const { activeTab, setActiveTab } = useEditor();

  const primaryNavItems: Array<{ id: SidebarTab; label: string; icon: React.ElementType }> = [
    { id: 'media', label: 'Media', icon: FolderPlus },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'dslr', label: 'DSLR Cinema', icon: Aperture },
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'retouch', label: 'AI Retouch', icon: Smile },
    { id: 'lut', label: 'LUTs', icon: Grid },
    { id: 'speed', label: 'Speed', icon: Gauge },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
    { id: 'transitions', label: 'Transitions', icon: Shuffle },
    { id: 'keyframes', label: 'Keyframes', icon: Diamond },
  ];

  return (
    <aside className="w-16 bg-[#0c0d11] border-r border-[#1a1e27] flex flex-col items-center justify-between py-2 shrink-0 z-20 select-none">
      {/* Top section: Home & Tools */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Home */}
        <button
          onClick={onGoHome}
          className="w-12 h-11 flex flex-col items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-[#161922] transition-colors mb-1"
          title="Home Projects Hub"
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-medium tracking-tight">Home</span>
        </button>

        <div className="w-8 h-[1px] bg-[#1e2330] my-1" />

        {/* Editing Tools */}
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-11 flex flex-col items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#141720]'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-medium tracking-tight truncate max-w-[44px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom section: Export & Settings */}
      <div className="flex flex-col items-center gap-1 w-full pt-1 border-t border-[#1a1e27]">
        <button
          onClick={onOpenExportModal}
          className="w-12 h-11 flex flex-col items-center justify-center rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
          title="Export Video Project"
        >
          <Download className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-medium tracking-tight">Export</span>
        </button>

        <button
          onClick={onOpenSettingsModal}
          className="w-12 h-11 flex flex-col items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-[#161922] transition-colors"
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] font-medium tracking-tight">Settings</span>
        </button>
      </div>
    </aside>
  );
};
