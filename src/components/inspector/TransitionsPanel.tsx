/**
 * CineFlow Studio - Transitions Inspector Panel
 * Seamless transitions: Fade, Dissolve, Zoom, Blur, Slide, Push, Flash, Film Burn, Light Leak, Whip
 */

import React from 'react';
import { Shuffle, Check, Clock } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

const AVAILABLE_TRANSITIONS = [
  { id: 'fade', name: 'Dip to Black', category: 'Dissolve' },
  { id: 'cross_dissolve', name: 'Cross Dissolve', category: 'Dissolve' },
  { id: 'smooth_zoom', name: 'Smooth Zoom In', category: 'Motion' },
  { id: 'zoom_out', name: 'Dynamic Zoom Out', category: 'Motion' },
  { id: 'slide_left', name: 'Slide Push Left', category: 'Slide' },
  { id: 'slide_right', name: 'Slide Push Right', category: 'Slide' },
  { id: 'blur_dissolve', name: 'Gaussian Blur Fade', category: 'Blur' },
  { id: 'flash_white', name: 'Camera Flash White', category: 'Light' },
  { id: 'light_leak', name: 'Film Light Leak', category: 'Film' },
  { id: 'film_burn', name: 'Warm Film Burn', category: 'Film' },
  { id: 'whip_pan', name: 'Whip Pan Camera', category: 'Motion' },
  { id: 'spin', name: 'Dynamic Spin', category: 'Motion' },
];

export const TransitionsPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to attach entrance and exit transitions.
      </div>
    );
  }

  const { transitionIn, transitionOut } = selectedClip;

  const handleSetTransitionIn = (type: string) => {
    updateClip(selectedClip.id, () => ({
      transitionIn: {
        type,
        duration: transitionIn?.duration || 0.8,
      },
    }));
  };

  const handleDurationIn = (dur: number) => {
    if (!transitionIn) return;
    updateClip(selectedClip.id, (c) => ({
      transitionIn: { ...c.transitionIn!, duration: dur },
    }));
  };

  const handleRemoveTransitionIn = () => {
    updateClip(selectedClip.id, () => ({
      transitionIn: undefined,
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Transitions</h3>
        </div>
      </div>

      {/* Active Transition Info */}
      <div className="p-3 bg-[#141720] rounded-lg border border-[#202533] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">Clip Intro Transition</span>
          {transitionIn ? (
            <button
              onClick={handleRemoveTransitionIn}
              className="text-[10px] text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          ) : (
            <span className="text-[10px] text-neutral-500">None</span>
          )}
        </div>

        {transitionIn && (
          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Duration</span>
              </span>
              <span className="font-mono-numbers text-amber-400">
                {transitionIn.duration.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={transitionIn.duration}
              onChange={(e) => handleDurationIn(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Transitions Grid */}
      <div className="space-y-2">
        <label className="text-neutral-400 font-medium">Transition Catalog</label>
        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {AVAILABLE_TRANSITIONS.map((trans) => {
            const isSelected = transitionIn?.type === trans.id;
            return (
              <button
                key={trans.id}
                onClick={() => handleSetTransitionIn(trans.id)}
                className={`p-2 rounded text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-[#151821] border-[#202533] text-neutral-300 hover:bg-[#1b202d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[11px] truncate">{trans.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <div className="text-[9px] text-neutral-500 mt-0.5">{trans.category}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
