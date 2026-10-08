/**
 * CineFlow Studio - Main Inspector Host Panel
 * Unified right sidebar container with tab navigation for all active editing tools.
 */

import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { SidebarTab } from '../../types/editor';
import { BasicVideoPanel } from './BasicVideoPanel';
import { DslrCinematicPanel } from './DslrCinematicPanel';
import { ColorGradingPanel } from './ColorGradingPanel';
import { FaceRetouchPanel } from './FaceRetouchPanel';
import { LutSystemPanel } from './LutSystemPanel';
import { SpeedSlowMotionPanel } from './SpeedSlowMotionPanel';
import { KeyframeGraphPanel } from './KeyframeGraphPanel';
import { FiltersEffectsPanel } from './FiltersEffectsPanel';
import { TransitionsPanel } from './TransitionsPanel';
import { AudioPanel } from './AudioPanel';
import { TextPanel } from './TextPanel';
import { MaskChromaPanel } from './MaskChromaPanel';
import { EnhancementPanel } from './EnhancementPanel';
import { FilmicCameraPanel } from './FilmicCameraPanel';

export const InspectorPanel: React.FC = () => {
  const { activeTab, setActiveTab, selectedClip } = useEditor();

  const tabs: Array<{ id: SidebarTab; label: string }> = [
    { id: 'video', label: 'Transform' },
    { id: 'dslr', label: 'DSLR' },
    { id: 'color', label: 'Color' },
    { id: 'retouch', label: 'Retouch' },
    { id: 'lut', label: 'LUTs' },
    { id: 'speed', label: 'Speed' },
    { id: 'audio', label: 'Audio' },
    { id: 'text', label: 'Text' },
    { id: 'effects', label: 'Effects' },
    { id: 'filters', label: 'Filters' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'keyframes', label: 'Keyframes' },
    { id: 'mask', label: 'Mask / Key' },
    { id: 'filmic', label: 'Filmic' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return <BasicVideoPanel />;
      case 'dslr':
        return <DslrCinematicPanel />;
      case 'color':
        return <ColorGradingPanel />;
      case 'retouch':
        return <FaceRetouchPanel />;
      case 'lut':
        return <LutSystemPanel />;
      case 'speed':
        return <SpeedSlowMotionPanel />;
      case 'keyframes':
        return <KeyframeGraphPanel />;
      case 'filters':
      case 'effects':
        return <FiltersEffectsPanel />;
      case 'transitions':
        return <TransitionsPanel />;
      case 'audio':
        return <AudioPanel />;
      case 'text':
        return <TextPanel />;
      case 'mask':
        return <MaskChromaPanel />;
      case 'filmic':
        return <FilmicCameraPanel />;
      default:
        return <BasicVideoPanel />;
    }
  };

  return (
    <aside className="w-80 bg-[#101217] border-l border-[#1e222c] flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* Scrollable Quick Switch Tabs */}
      <div className="bg-[#0d0f14] border-b border-[#1b1f29] px-2 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161a23]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Selected Clip Notice Banner */}
      <div className="bg-[#131620] px-3 py-1.5 border-b border-[#1c202a] flex items-center justify-between text-[10px] text-neutral-400">
        <span className="truncate max-w-[190px]">
          Target: <strong className="text-neutral-200">{selectedClip?.name || 'No clip selected'}</strong>
        </span>
        {selectedClip && (
          <span className="font-mono-numbers text-amber-400 uppercase text-[9px] bg-amber-500/10 px-1 rounded">
            {selectedClip.type}
          </span>
        )}
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </aside>
  );
};
