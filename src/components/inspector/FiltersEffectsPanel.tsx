/**
 * CineFlow Studio - Filters & Effects Inspector Panel
 * 12 original filter categories (0-100% intensity) and 16 adjustable visual effects
 * (Film Grain, Bloom, Lens Flare, Light Leak, VHS, RGB Split, Glitch, Dust, Fog).
 */

import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Plus, Trash2, Check } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { ClipEffect, ClipFilter } from '../../types/editor';

const BUILTIN_FILTERS: Array<{ id: string; name: string; category: string; description: string }> = [
  { id: 'f_cinematic_noir', name: 'Cinematic Noir', category: 'Black & White', description: 'High contrast classic silver halide B&W.' },
  { id: 'f_dslr_clean', name: 'DSLR Studio Clean', category: 'DSLR', description: 'Neutral balanced commercial studio profile.' },
  { id: 'f_golden_glow', name: 'Golden Sunlight', category: 'Cinematic', description: 'Radiant warm amber rim lighting.' },
  { id: 'f_vintage_polaroid', name: '1980s Instant Film', category: 'Vintage', description: 'Creamy faded shadows and soft greens.' },
  { id: 'f_moody_emerald', name: 'Moody Nordic Forest', category: 'Moody', description: 'Deep pine greens and cool damp shadows.' },
  { id: 'f_tokyo_cyber', name: 'Tokyo Neon Cyber', category: 'Night', description: 'Electric cyan highlights and magenta shadows.' },
  { id: 'f_wedding_ivory', name: 'Wedding Pearl & Ivory', category: 'Wedding', description: 'Gentle airy whites and luminous skin tone.' },
  { id: 'f_travel_pacific', name: 'Pacific Coast Teal', category: 'Travel', description: 'Vibrant turquoise waters and rich skies.' },
  { id: 'f_portrait_velvet', name: 'Portrait Silk Skin', category: 'Portrait', description: 'Soft diffusion tailored for close-up portraits.' },
  { id: 'f_film_kodachrome', name: 'Kodachrome 64', category: 'Film', description: 'Iconic vivid primaries and punchy reds.' },
  { id: 'f_bright_minimal', name: 'Bright Nordic Minimal', category: 'Bright', description: 'High key clean exposure with airy shadows.' },
];

const AVAILABLE_EFFECTS: Array<{ type: string; name: string; category: string; defaultParam: string }> = [
  { type: 'grain', name: 'Organic Film Grain', category: 'Texture', defaultParam: 'Size' },
  { type: 'bloom', name: 'Cinematic Bloom', category: 'Optical', defaultParam: 'Radius' },
  { type: 'glow', name: 'Highlight Glow', category: 'Optical', defaultParam: 'Spread' },
  { type: 'lens_flare', name: 'Anamorphic Lens Flare', category: 'Optical', defaultParam: 'Streak' },
  { type: 'light_leak', name: 'Vintage Light Leak', category: 'Retro', defaultParam: 'Warmth' },
  { type: 'vhs', name: 'VHS Tape Degradation', category: 'Retro', defaultParam: 'Scanlines' },
  { type: 'glitch', name: 'Digital Data Glitch', category: 'Stylize', defaultParam: 'Jitter' },
  { type: 'rgb_split', name: 'RGB Chromatic Split', category: 'Stylize', defaultParam: 'Offset' },
  { type: 'dust_scratches', name: 'Dust & Film Scratches', category: 'Texture', defaultParam: 'Density' },
  { type: 'fog', name: 'Atmospheric Mist & Fog', category: 'Environment', defaultParam: 'Density' },
  { type: 'film_burn', name: 'Film Gate Burn', category: 'Retro', defaultParam: 'Intensity' },
  { type: 'motion_blur', name: 'Shutter Motion Blur', category: 'Motion', defaultParam: 'Angle' },
];

export const FiltersEffectsPanel: React.FC = () => {
  const { selectedClip, updateClip, resetClipEffects } = useEditor();
  const [activeTab, setActiveTab] = useState<'filters' | 'effects'>('filters');

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to apply filters and visual effects.
      </div>
    );
  }

  const { filter, effects } = selectedClip;

  const handleApplyFilter = (f: { id: string; name: string; category: string }) => {
    updateClip(selectedClip.id, () => ({
      filter: {
        id: f.id,
        name: f.name,
        category: f.category,
        intensity: filter.intensity || 80,
      },
    }));
  };

  const handleFilterIntensity = (val: number) => {
    updateClip(selectedClip.id, (c) => ({
      filter: { ...c.filter, intensity: val },
    }));
  };

  const handleAddEffect = (effDef: typeof AVAILABLE_EFFECTS[0]) => {
    const newEffect: ClipEffect = {
      id: `eff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: effDef.type,
      name: effDef.name,
      category: effDef.category,
      enabled: true,
      intensity: 75,
      params: { strength: 60, spread: 40 },
    };

    updateClip(selectedClip.id, (c) => ({
      effects: [...c.effects, newEffect],
    }));
  };

  const handleRemoveEffect = (effId: string) => {
    updateClip(selectedClip.id, (c) => ({
      effects: c.effects.filter((e) => e.id !== effId),
    }));
  };

  const handleToggleEffect = (effId: string) => {
    updateClip(selectedClip.id, (c) => ({
      effects: c.effects.map((e) => (e.id === effId ? { ...e, enabled: !e.enabled } : e)),
    }));
  };

  const handleEffectIntensity = (effId: string, val: number) => {
    updateClip(selectedClip.id, (c) => ({
      effects: c.effects.map((e) => (e.id === effId ? { ...e, intensity: val } : e)),
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Filters & Visual Effects</h3>
        </div>
        <button
          onClick={() => resetClipEffects(selectedClip.id)}
          className="text-[11px] text-amber-500 hover:text-amber-400"
        >
          Reset All
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1 bg-[#13161f] p-1 rounded-md border border-[#1e2330]">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === 'filters'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Filters ({BUILTIN_FILTERS.length})
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeTab === 'effects'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Effects ({effects.length} Active)
        </button>
      </div>

      {/* Tab 1: Filters */}
      {activeTab === 'filters' && (
        <div className="space-y-3 pt-1">
          {filter.id && (
            <div className="p-3 bg-[#141720] rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{filter.name}</span>
                <span className="font-mono-numbers text-amber-400">{filter.intensity}%</span>
              </div>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filter.intensity}
                  onChange={(e) => handleFilterIntensity(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {BUILTIN_FILTERS.map((f) => {
              const isActive = filter.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleApplyFilter(f)}
                  className={`p-2.5 rounded text-left border transition-all ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#151821] border-[#202533] text-neutral-300 hover:bg-[#1b202c]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[11px] truncate">{f.name}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 truncate">{f.category}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Visual Effects */}
      {activeTab === 'effects' && (
        <div className="space-y-4 pt-1">
          {/* Active Effects Stack */}
          {effects.length > 0 && (
            <div className="space-y-2">
              <label className="text-neutral-400 font-medium">Applied Effects</label>
              <div className="space-y-2">
                {effects.map((eff) => (
                  <div
                    key={eff.id}
                    className="p-2.5 bg-[#141720] rounded-lg border border-[#232938] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={eff.enabled}
                          onChange={() => handleToggleEffect(eff.id)}
                          className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                        />
                        <span className="font-medium text-white">{eff.name}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveEffect(eff.id)}
                        className="text-neutral-500 hover:text-rose-400"
                        title="Remove effect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Intensity</span>
                        <span className="font-mono-numbers text-neutral-200">{eff.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={eff.intensity}
                        onChange={(e) => handleEffectIntensity(eff.id, parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog of Effects to Add */}
          <div className="space-y-2">
            <label className="text-neutral-400 font-medium">Add Visual Effect</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {AVAILABLE_EFFECTS.map((eff) => (
                <button
                  key={eff.type}
                  onClick={() => handleAddEffect(eff)}
                  className="p-2 bg-[#151821] hover:bg-[#1f2533] border border-[#202533] rounded text-left transition-colors flex items-center justify-between"
                >
                  <div className="overflow-hidden">
                    <div className="font-medium text-[11px] text-neutral-200 truncate">
                      {eff.name}
                    </div>
                    <div className="text-[9px] text-neutral-500 truncate">{eff.category}</div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
