/**
 * CineFlow Studio - Filmic Camera Look Inspector Panel
 * Emulsion stock simulation (Kodak Vision3, Portra, Fuji Eterna, CineStill),
 * gate weave jitter, halation, grain size, and skin protection.
 */

import React from 'react';
import { Camera, ShieldCheck, RotateCcw } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { FilmicCameraConfig } from '../../types/editor';

const FILM_STOCKS = [
  { name: 'Kodak Vision3 500T', desc: 'Industry benchmark cinema stock with rich tungsten warm glow.' },
  { name: 'Kodak Portra 400', desc: 'Flattering creamy skin tones, medium grain, gentle latitude.' },
  { name: 'Fujifilm Eterna 250D', desc: 'Subdued saturation, soft shadow roll-off, cinematic pastels.' },
  { name: 'CineStill 800T', desc: 'Prominent red halation on streetlights, moody night look.' },
  { name: 'Ilford HP5 B&W', desc: 'Classic medium contrast black and white with organic silver grain.' },
  { name: 'Kodachrome 64', desc: 'Vivid historic dynamic range, punchy saturated primaries.' },
];

export const FilmicCameraPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to adjust Filmic Camera simulation.
      </div>
    );
  }

  const { filmicCamera } = selectedClip;

  const handleChange = (key: keyof FilmicCameraConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      filmicCamera: { ...c.filmicCamera, [key]: val },
    }));
  };

  const handleReset = () => {
    updateClip(selectedClip.id, () => ({
      filmicCamera: {
        filmStock: 'Kodak Vision3 500T',
        grainIntensity: 0,
        grainSize: 15,
        softHighlight: 0,
        blackCrush: 0,
        fade: 0,
        halation: 0,
        bloom: 0,
        gateWeave: 0,
        exposureVariation: 0,
        vignette: 0,
        protectSkinTones: true,
      },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Filmic Camera Emulsion</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] text-amber-500 hover:text-amber-400"
        >
          Reset
        </button>
      </div>

      {/* Skin Protection */}
      <div className="flex items-center justify-between p-2 rounded bg-[#13161f] border border-[#202533]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-neutral-200 font-medium">Protect Human Skin Tones</span>
        </div>
        <input
          type="checkbox"
          checked={filmicCamera.protectSkinTones}
          onChange={(e) => handleChange('protectSkinTones', e.target.checked)}
          className="w-4 h-4 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Film Stock Selection */}
      <div className="space-y-2">
        <label className="text-neutral-400 font-medium">Film Stock Simulation</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {FILM_STOCKS.map((stock) => {
            const isSelected = filmicCamera.filmStock === stock.name;
            return (
              <button
                key={stock.name}
                onClick={() => handleChange('filmStock', stock.name)}
                className={`w-full p-2 rounded text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                    : 'bg-[#151821] border-[#222735] text-neutral-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="font-medium text-[11px]">{stock.name}</div>
                <div className="text-[9px] text-neutral-500 mt-0.5">{stock.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 pt-2 border-t border-[#1f2430]">
        {/* Grain Intensity */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Emulsion Grain Intensity</span>
            <span className="font-mono-numbers">{filmicCamera.grainIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filmicCamera.grainIntensity}
            onChange={(e) => handleChange('grainIntensity', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Gate Weave (Organic mechanical projector jitter) */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Mechanical Gate Weave (Jitter)</span>
            <span className="font-mono-numbers">{filmicCamera.gateWeave}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={filmicCamera.gateWeave}
            onChange={(e) => handleChange('gateWeave', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Exposure Variation */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Subtle Exposure Variation (Flicker)</span>
            <span className="font-mono-numbers">{filmicCamera.exposureVariation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={filmicCamera.exposureVariation}
            onChange={(e) => handleChange('exposureVariation', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Halation */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Optical Halation</span>
            <span className="font-mono-numbers">{filmicCamera.halation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filmicCamera.halation}
            onChange={(e) => handleChange('halation', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Black Crush & Fade */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400 text-[11px]">Black Crush</span>
              <span className="font-mono-numbers">{filmicCamera.blackCrush}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={filmicCamera.blackCrush}
              onChange={(e) => handleChange('blackCrush', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400 text-[11px]">Fade Lift</span>
              <span className="font-mono-numbers">{filmicCamera.fade}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={filmicCamera.fade}
              onChange={(e) => handleChange('fade', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
