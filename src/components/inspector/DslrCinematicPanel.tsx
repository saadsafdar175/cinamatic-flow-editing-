/**
 * CineFlow Studio - DSLR Cinematic Mode Inspector Panel
 * Professional camera optical emulsion, filmic highlights, micro-contrast, halation,
 * and 13 film presets with 0-100% intensity sliders.
 */

import React from 'react';
import { Aperture, RotateCcw, Sparkles } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { DslrCinematicConfig } from '../../types/editor';

const DSLR_PRESETS: Array<{
  name: string;
  description: string;
  values: Partial<DslrCinematicConfig>;
}> = [
  {
    name: 'DSLR Natural',
    description: 'Clean organic sensor roll-off and natural contrast curve.',
    values: {
      contrast: 15,
      highlightRollOff: 35,
      shadowControl: 10,
      filmicBlacks: 20,
      softHighlights: 25,
      microContrast: 30,
      grain: 15,
      vignette: 20,
      halation: 15,
      sharpness: 25,
    },
  },
  {
    name: 'Cinematic Warm',
    description: 'Golden cinema tungsten glow, soft highlights, subtle bloom.',
    values: {
      contrast: 20,
      highlightRollOff: 50,
      shadowControl: 15,
      filmicBlacks: 25,
      softHighlights: 40,
      bloom: 30,
      halation: 25,
      grain: 20,
      vignette: 25,
    },
  },
  {
    name: 'Cinematic Cool',
    description: 'Steely blue daylight balance, crisp clarity, clean shadow detail.',
    values: {
      contrast: 25,
      highlightRollOff: 40,
      shadowControl: -5,
      filmicBlacks: 18,
      clarity: 20,
      grain: 15,
      vignette: 30,
      sharpness: 35,
    },
  },
  {
    name: 'Hollywood',
    description: 'Blockbuster anamorphic flare feel with high micro-contrast and rich punch.',
    values: {
      contrast: 35,
      highlightRollOff: 60,
      shadowControl: 15,
      filmicBlacks: 30,
      microContrast: 45,
      bloom: 25,
      halation: 35,
      grain: 22,
      vignette: 35,
    },
  },
  {
    name: 'Teal & Orange',
    description: 'Extreme skin separation with cool ocean shadows and amber highlights.',
    values: {
      contrast: 30,
      highlightRollOff: 55,
      shadowControl: 20,
      filmicBlacks: 25,
      microContrast: 40,
      vignette: 28,
      chromaticAberration: 15,
    },
  },
  {
    name: 'Moody Film',
    description: 'Deep mysterious shadows, lowered dehaze, film grain texture.',
    values: {
      contrast: 25,
      highlightRollOff: 45,
      shadowControl: -20,
      filmicBlacks: 40,
      softHighlights: 35,
      grain: 35,
      vignette: 45,
      halation: 20,
    },
  },
  {
    name: 'Golden Hour',
    description: 'Rich sunlight warmth with soft lens flare and dreamy bloom.',
    values: {
      contrast: 18,
      highlightRollOff: 65,
      shadowControl: 15,
      softHighlights: 50,
      bloom: 40,
      halation: 30,
      grain: 18,
      vignette: 22,
    },
  },
  {
    name: 'Night Cinema',
    description: 'High sensitivity ISO film grain with controlled light halation and bloom.',
    values: {
      contrast: 30,
      highlightRollOff: 40,
      shadowControl: -15,
      filmicBlacks: 35,
      bloom: 35,
      halation: 40,
      grain: 40,
      vignette: 40,
    },
  },
  {
    name: 'Documentary',
    description: 'Real-world dynamic range preservation with mild organic contrast.',
    values: {
      contrast: 10,
      highlightRollOff: 30,
      shadowControl: 5,
      filmicBlacks: 15,
      clarity: 15,
      grain: 12,
      sharpness: 20,
    },
  },
  {
    name: 'Wedding Film',
    description: 'Dreamy soft focus highlights, luminous skin tones, pastel softness.',
    values: {
      contrast: 8,
      highlightRollOff: 70,
      shadowControl: 20,
      softHighlights: 60,
      bloom: 35,
      lensSoftness: 25,
      grain: 10,
      vignette: 15,
    },
  },
  {
    name: 'Travel Film',
    description: 'Vibrant punchy landscape dynamic range with sharp textures.',
    values: {
      contrast: 22,
      highlightRollOff: 40,
      clarity: 25,
      dehaze: 15,
      texture: 30,
      grain: 15,
      vignette: 20,
      sharpness: 30,
    },
  },
  {
    name: 'Portrait Film',
    description: 'Flattering medium contrast with soft highlight roll-off for faces.',
    values: {
      contrast: 12,
      highlightRollOff: 50,
      shadowControl: 10,
      softHighlights: 35,
      microContrast: 20,
      lensSoftness: 15,
      grain: 15,
      vignette: 25,
    },
  },
  {
    name: 'Dark Cinema',
    description: 'Heavy atmospheric tension with crushed blacks and prominent grain.',
    values: {
      contrast: 40,
      highlightRollOff: 30,
      shadowControl: -30,
      filmicBlacks: 50,
      grain: 45,
      vignette: 50,
      clarity: 15,
    },
  },
];

export const DslrCinematicPanel: React.FC = () => {
  const { selectedClip, updateClip, resetClipDslr } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a video clip to adjust DSLR Cinematic settings.
      </div>
    );
  }

  const { dslrCinematic } = selectedClip;

  const handleChange = (key: keyof DslrCinematicConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      dslrCinematic: {
        ...c.dslrCinematic,
        [key]: val,
      },
    }));
  };

  const applyPreset = (presetName: string) => {
    const found = DSLR_PRESETS.find((p) => p.name === presetName);
    if (!found) return;

    updateClip(selectedClip.id, (c) => ({
      dslrCinematic: {
        ...c.dslrCinematic,
        ...found.values,
        activePreset: presetName,
        presetIntensity: 100,
      },
    }));
  };

  return (
    <div className="p-4 space-y-5 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Aperture className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">DSLR Cinematic Look</h3>
        </div>
        <button
          onClick={() => resetClipDslr(selectedClip.id)}
          className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
          title="Reset DSLR look"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Library Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">Cinematic Presets (13)</label>
          {dslrCinematic.activePreset && (
            <span className="text-[11px] text-amber-400 font-medium">
              {dslrCinematic.activePreset}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {DSLR_PRESETS.map((preset) => {
            const isActive = dslrCinematic.activePreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.name)}
                className={`p-2 rounded text-left border transition-all ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-sm'
                    : 'bg-[#151821] border-[#222735] text-neutral-300 hover:bg-[#1b202c]'
                }`}
              >
                <div className="font-medium truncate text-[11px]">{preset.name}</div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preset Intensity Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-neutral-400">Preset Intensity</span>
            <span className="font-mono-numbers text-neutral-200">
              {dslrCinematic.presetIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.presetIntensity}
            onChange={(e) => handleChange('presetIntensity', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Core Optical Controls */}
      <div className="space-y-3 pt-3 border-t border-[#1f2430]">
        <h4 className="font-medium text-neutral-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Optical & Contrast Emulation</span>
        </h4>

        {/* Cinematic Contrast */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Cinematic Contrast</span>
            <span className="font-mono-numbers text-neutral-300">{dslrCinematic.contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={dslrCinematic.contrast}
            onChange={(e) => handleChange('contrast', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Highlight Roll-Off */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Highlight Roll-Off</span>
            <span className="font-mono-numbers text-neutral-300">
              {dslrCinematic.highlightRollOff}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.highlightRollOff}
            onChange={(e) => handleChange('highlightRollOff', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Filmic Blacks */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Filmic Blacks (Lift)</span>
            <span className="font-mono-numbers text-neutral-300">
              {dslrCinematic.filmicBlacks}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.filmicBlacks}
            onChange={(e) => handleChange('filmicBlacks', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Soft Highlights */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Soft Highlights</span>
            <span className="font-mono-numbers text-neutral-300">
              {dslrCinematic.softHighlights}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.softHighlights}
            onChange={(e) => handleChange('softHighlights', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Micro Contrast & Clarity */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Micro Contrast</span>
            <span className="font-mono-numbers text-neutral-300">
              {dslrCinematic.microContrast}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.microContrast}
            onChange={(e) => handleChange('microContrast', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Halation, Bloom & Film Emulsion */}
      <div className="space-y-3 pt-3 border-t border-[#1f2430]">
        <h4 className="font-medium text-neutral-200">Film Emulsion & Lens Artifacts</h4>

        {/* Film Grain */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Film Grain</span>
            <span className="font-mono-numbers text-neutral-300">{dslrCinematic.grain}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.grain}
            onChange={(e) => handleChange('grain', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Halation (Red edge glow on high contrast boundaries) */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Halation</span>
            <span className="font-mono-numbers text-neutral-300">{dslrCinematic.halation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.halation}
            onChange={(e) => handleChange('halation', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Bloom */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Bloom & Glow</span>
            <span className="font-mono-numbers text-neutral-300">{dslrCinematic.bloom}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.bloom}
            onChange={(e) => handleChange('bloom', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Vignette */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Cinematic Vignette</span>
            <span className="font-mono-numbers text-neutral-300">{dslrCinematic.vignette}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.vignette}
            onChange={(e) => handleChange('vignette', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Chromatic Aberration */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Chromatic Aberration</span>
            <span className="font-mono-numbers text-neutral-300">
              {dslrCinematic.chromaticAberration}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={dslrCinematic.chromaticAberration}
            onChange={(e) => handleChange('chromaticAberration', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
