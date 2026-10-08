/**
 * CineFlow Studio - Video Enhancement Inspector Panel
 * Local stabilization, sharpen, deblur, denoise, detail recovery, and HD / 4K Enhance
 */

import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { VideoEnhancementConfig } from '../../types/editor';

export const EnhancementPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to apply video enhancements.
      </div>
    );
  }

  const { enhancement } = selectedClip;

  const handleChange = (key: keyof VideoEnhancementConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      enhancement: { ...c.enhancement, [key]: val },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-neutral-100 text-sm">Video Enhancement</h3>
        </div>
      </div>

      {/* HD & 4K Enhance Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleChange('hdEnhance', !enhancement.hdEnhance)}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            enhancement.hdEnhance
              ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm'
              : 'bg-[#151821] border-[#222735] text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>HD Enhance</span>
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Clarity & local contrast</div>
        </button>

        <button
          onClick={() => handleChange('fourKEnhance', !enhancement.fourKEnhance)}
          className={`p-2.5 rounded-lg border text-left transition-all ${
            enhancement.fourKEnhance
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
              : 'bg-[#151821] border-[#222735] text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4K Super Res</span>
          </div>
          <div className="text-[9px] text-neutral-400 mt-0.5">Edge texture reconstruction</div>
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-3 pt-2">
        {/* Sharpen */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Unsharp Mask (Sharpen)</span>
            <span className="font-mono-numbers">{enhancement.sharpen}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancement.sharpen}
            onChange={(e) => handleChange('sharpen', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Denoise */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Temporal Denoise</span>
            <span className="font-mono-numbers">{enhancement.denoise}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancement.denoise}
            onChange={(e) => handleChange('denoise', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Deblur */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Motion Deblur</span>
            <span className="font-mono-numbers">{enhancement.deblur}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancement.deblur}
            onChange={(e) => handleChange('deblur', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Stabilization */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Electronic Gyro Stabilization</span>
            <span className="font-mono-numbers">{enhancement.stabilization}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancement.stabilization}
            onChange={(e) => handleChange('stabilization', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
