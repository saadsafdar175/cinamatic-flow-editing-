/**
 * CineFlow Studio - Basic Video Editing Inspector Panel
 * Transform, position, scale, rotation, opacity, blend modes, flip, crop, freeze, reverse
 */

import React from 'react';
import { RotateCw, FlipHorizontal, FlipVertical, Snowflake, History, RotateCcw } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export const BasicVideoPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip on the timeline to edit video properties.
      </div>
    );
  }

  const { transform, freezeFrame, isReversed } = selectedClip;

  const handleTransformChange = (key: keyof typeof transform, value: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      transform: {
        ...c.transform,
        [key]: value,
      },
    }));
  };

  const handleReset = () => {
    updateClip(selectedClip.id, () => ({
      transform: {
        x: 0,
        y: 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        blendMode: 'normal',
        flipH: false,
        flipV: false,
        crop: { top: 0, bottom: 0, left: 0, right: 0 },
      },
      freezeFrame: false,
      isReversed: false,
    }));
  };

  return (
    <div className="p-4 space-y-5 text-xs text-neutral-300">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <h3 className="font-semibold text-neutral-100 text-sm">Transform & Basic</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
          title="Reset transforms"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Position X & Y */}
      <div className="space-y-2">
        <label className="text-neutral-400 font-medium">Position (X / Y)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-[#151821] border border-[#232836] rounded px-2 py-1">
            <span className="text-neutral-500 mr-2 text-[11px]">X</span>
            <input
              type="number"
              value={Math.round(transform.x)}
              onChange={(e) => handleTransformChange('x', parseFloat(e.target.value) || 0)}
              className="bg-transparent text-white w-full outline-none font-mono-numbers text-xs"
            />
            <span className="text-neutral-500 text-[10px]">px</span>
          </div>

          <div className="flex items-center bg-[#151821] border border-[#232836] rounded px-2 py-1">
            <span className="text-neutral-500 mr-2 text-[11px]">Y</span>
            <input
              type="number"
              value={Math.round(transform.y)}
              onChange={(e) => handleTransformChange('y', parseFloat(e.target.value) || 0)}
              className="bg-transparent text-white w-full outline-none font-mono-numbers text-xs"
            />
            <span className="text-neutral-500 text-[10px]">px</span>
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">Scale</label>
          <span className="font-mono-numbers text-neutral-300">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.05"
          value={transform.scale}
          onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">Rotation</label>
          <span className="font-mono-numbers text-neutral-300">{Math.round(transform.rotation)}°</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation}
            onChange={(e) => handleTransformChange('rotation', parseFloat(e.target.value))}
            className="w-full"
          />
          <button
            onClick={() => handleTransformChange('rotation', (transform.rotation + 90) % 360)}
            className="p-1.5 bg-[#151821] hover:bg-[#1f2433] rounded text-neutral-300"
            title="Rotate +90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Opacity */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">Opacity</label>
          <span className="font-mono-numbers text-neutral-300">
            {Math.round(transform.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1.0"
          step="0.02"
          value={transform.opacity}
          onChange={(e) => handleTransformChange('opacity', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Blend Modes */}
      <div className="space-y-1.5">
        <label className="text-neutral-400 font-medium">Blend Mode</label>
        <select
          value={transform.blendMode}
          onChange={(e) => handleTransformChange('blendMode', e.target.value)}
          className="w-full bg-[#151821] border border-[#232836] rounded px-2.5 py-1.5 text-neutral-200 outline-none cursor-pointer"
        >
          <option value="normal">Normal</option>
          <option value="screen">Screen (Lighten)</option>
          <option value="multiply">Multiply (Darken)</option>
          <option value="overlay">Overlay</option>
          <option value="soft-light">Soft Light</option>
          <option value="hard-light">Hard Light</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="difference">Difference</option>
        </select>
      </div>

      {/* Flip Controls & Actions */}
      <div className="space-y-2 pt-2 border-t border-[#1f2430]">
        <label className="text-neutral-400 font-medium">Orientation & Playback</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTransformChange('flipH', !transform.flipH)}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded border transition-colors ${
              transform.flipH
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#151821] border-[#232836] text-neutral-300 hover:bg-[#1c212e]'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip H</span>
          </button>

          <button
            onClick={() => handleTransformChange('flipV', !transform.flipV)}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded border transition-colors ${
              transform.flipV
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#151821] border-[#232836] text-neutral-300 hover:bg-[#1c212e]'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Flip V</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => updateClip(selectedClip.id, () => ({ freezeFrame: !freezeFrame }))}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded border transition-colors ${
              freezeFrame
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-[#151821] border-[#232836] text-neutral-300 hover:bg-[#1c212e]'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Freeze Frame</span>
          </button>

          <button
            onClick={() => updateClip(selectedClip.id, () => ({ isReversed: !isReversed }))}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded border transition-colors ${
              isReversed
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-[#151821] border-[#232836] text-neutral-300 hover:bg-[#1c212e]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Reverse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
