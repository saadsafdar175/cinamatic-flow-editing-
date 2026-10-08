/**
 * CineFlow Studio - Masking & Chroma Key Inspector Panel
 * Geometric and gradient masks with feathering & invert, plus Chroma Key green screen removal.
 */

import React, { useState } from 'react';
import { Square, Circle, Scissors, Eye, RotateCcw } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { MaskConfig, ChromaKeyConfig } from '../../types/editor';

export const MaskChromaPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();
  const [activeTab, setActiveTab] = useState<'mask' | 'chroma'>('mask');

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to adjust masking or chroma key.
      </div>
    );
  }

  const { mask, chromaKey } = selectedClip;

  const handleMaskChange = (key: keyof MaskConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      mask: { ...c.mask, [key]: val },
    }));
  };

  const handleChromaChange = (key: keyof ChromaKeyConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      chromaKey: { ...c.chromaKey, [key]: val },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Masking & Chroma Key</h3>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1 bg-[#13161f] p-1 rounded-md border border-[#1e2330]">
        <button
          onClick={() => setActiveTab('mask')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === 'mask'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Shape Masking
        </button>
        <button
          onClick={() => setActiveTab('chroma')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === 'chroma'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Chroma Key (Green Screen)
        </button>
      </div>

      {/* Tab 1: Masking */}
      {activeTab === 'mask' && (
        <div className="space-y-3 pt-1">
          {/* Mask Shapes */}
          <div className="space-y-1.5">
            <label className="text-neutral-400 font-medium">Mask Geometry</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['none', 'rectangle', 'circle', 'linear'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleMaskChange('type', type)}
                  className={`py-1.5 rounded border text-center capitalize transition-colors ${
                    mask.type === type
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-[#151821] border-[#222735] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {mask.type !== 'none' && (
            <div className="space-y-3 pt-2">
              {/* Feather */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Edge Feathering</span>
                  <span className="font-mono-numbers">{mask.feather}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mask.feather}
                  onChange={(e) => handleMaskChange('feather', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              {/* Expansion */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Mask Expansion</span>
                  <span className="font-mono-numbers">{mask.expansion}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={mask.expansion}
                  onChange={(e) => handleMaskChange('expansion', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              {/* Invert Mask */}
              <div className="flex items-center justify-between p-2 rounded bg-[#131620] border border-[#202533]">
                <span className="text-neutral-200">Invert Mask</span>
                <input
                  type="checkbox"
                  checked={mask.invert}
                  onChange={(e) => handleMaskChange('invert', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Chroma Key */}
      {activeTab === 'chroma' && (
        <div className="space-y-3 pt-1">
          {/* Enable Chroma Key */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141720] border border-[#202533]">
            <span className="font-semibold text-white">Enable Chroma Key</span>
            <input
              type="checkbox"
              checked={chromaKey.enabled}
              onChange={(e) => handleChromaChange('enabled', e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          {chromaKey.enabled && (
            <div className="space-y-3 pt-1">
              {/* Key Color Picker */}
              <div className="flex items-center justify-between p-2 bg-[#151821] rounded border border-[#232836]">
                <span className="text-neutral-300">Target Key Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={chromaKey.keyColor}
                    onChange={(e) => handleChromaChange('keyColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono-numbers text-neutral-400 uppercase text-[11px]">
                    {chromaKey.keyColor}
                  </span>
                </div>
              </div>

              {/* Similarity */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Color Similarity Tolerance</span>
                  <span className="font-mono-numbers">{chromaKey.similarity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={chromaKey.similarity}
                  onChange={(e) => handleChromaChange('similarity', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              {/* Spill Reduction */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Spill Suppression</span>
                  <span className="font-mono-numbers">{chromaKey.spillReduction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={chromaKey.spillReduction}
                  onChange={(e) => handleChromaChange('spillReduction', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              {/* Edge Feather */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Edge Feather</span>
                  <span className="font-mono-numbers">{chromaKey.edgeFeather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={chromaKey.edgeFeather}
                  onChange={(e) => handleChromaChange('edgeFeather', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
