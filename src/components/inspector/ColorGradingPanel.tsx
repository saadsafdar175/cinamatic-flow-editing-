/**
 * CineFlow Studio - Filmic Color Grading Inspector Panel
 * Basic Exposure, White Balance, Pro RGB Curves, and 3-Way Color Wheels (Lift, Gamma, Gain, Offset)
 * with Skin Tone Protection and Auto White Balance.
 */

import React, { useState, useRef } from 'react';
import { Palette, RotateCcw, Wand2, ShieldCheck, Sun } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { ColorGradingConfig, ColorWheelVal } from '../../types/editor';

export const ColorGradingPanel: React.FC = () => {
  const { selectedClip, updateClip, resetClipColor } = useEditor();
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'wheels' | 'curves'>('basic');

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to grade colors.
      </div>
    );
  }

  const { color } = selectedClip;

  const handleColorChange = (key: keyof ColorGradingConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      color: {
        ...c.color,
        [key]: val,
      },
    }));
  };

  // Auto White Balance algorithm simulation
  const handleAutoWhiteBalance = () => {
    updateClip(selectedClip.id, (c) => ({
      color: {
        ...c.color,
        temperature: -8,
        tint: 3,
        saturation: Math.min(30, c.color.saturation + 5),
      },
    }));
  };

  // Auto Color balance simulation
  const handleAutoColor = () => {
    updateClip(selectedClip.id, (c) => ({
      color: {
        ...c.color,
        exposure: 5,
        contrast: 15,
        shadows: 8,
        highlights: -10,
        whites: 4,
        blacks: -6,
      },
    }));
  };

  // Helper for color wheel adjustment
  const handleColorWheelChange = (
    wheel: 'lift' | 'gamma' | 'gain' | 'offset',
    field: keyof ColorWheelVal,
    value: number
  ) => {
    const currentWheel = color[wheel];
    updateClip(selectedClip.id, (c) => ({
      color: {
        ...c.color,
        [wheel]: {
          ...currentWheel,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Filmic Color Grading</h3>
        </div>
        <button
          onClick={() => resetClipColor(selectedClip.id)}
          className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
          title="Reset Color Adjustments"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Auto Tools & Skin Protection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAutoColor}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-[#151821] hover:bg-[#1f2433] border border-[#232836] rounded text-neutral-200 transition-colors"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto Color</span>
        </button>

        <button
          onClick={handleAutoWhiteBalance}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-[#151821] hover:bg-[#1f2433] border border-[#232836] rounded text-neutral-200 transition-colors"
        >
          <Sun className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auto WB</span>
        </button>
      </div>

      {/* Skin Tone Protection Toggle */}
      <div className="flex items-center justify-between p-2 rounded bg-[#13161f] border border-[#202533]">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-4 h-4 ${color.skinToneProtection ? 'text-amber-400' : 'text-neutral-500'}`} />
          <span className="text-neutral-200 font-medium">Protect Skin Tones</span>
        </div>
        <input
          type="checkbox"
          checked={color.skinToneProtection}
          onChange={(e) => handleColorChange('skinToneProtection', e.target.checked)}
          className="w-4 h-4 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Mode Tabs (Basic / Color Wheels / Curves) */}
      <div className="flex items-center gap-1 bg-[#13161f] p-1 rounded-md border border-[#1e2330]">
        {(['basic', 'wheels', 'curves'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-1 text-[11px] font-medium capitalize rounded transition-colors ${
              activeSubTab === tab
                ? 'bg-[#222736] text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subtab 1: Basic Grading */}
      {activeSubTab === 'basic' && (
        <div className="space-y-3 pt-1">
          {/* Exposure */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Exposure</span>
              <span className="font-mono-numbers text-neutral-200">{color.exposure}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.exposure}
              onChange={(e) => handleColorChange('exposure', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Contrast</span>
              <span className="font-mono-numbers text-neutral-200">{color.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.contrast}
              onChange={(e) => handleColorChange('contrast', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Temperature (Cool -> Warm) */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Temperature</span>
              <span className="font-mono-numbers text-amber-400">{color.temperature}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.temperature}
              onChange={(e) => handleColorChange('temperature', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Tint (Green -> Magenta) */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Tint</span>
              <span className="font-mono-numbers text-pink-400">{color.tint}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.tint}
              onChange={(e) => handleColorChange('tint', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Saturation</span>
              <span className="font-mono-numbers text-neutral-200">{color.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.saturation}
              onChange={(e) => handleColorChange('saturation', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Vibrance */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Vibrance</span>
              <span className="font-mono-numbers text-neutral-200">{color.vibrance}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={color.vibrance}
              onChange={(e) => handleColorChange('vibrance', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Shadows & Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2330]">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400 text-[11px]">Shadows</span>
                <span className="font-mono-numbers text-neutral-300">{color.shadows}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={color.shadows}
                onChange={(e) => handleColorChange('shadows', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400 text-[11px]">Highlights</span>
                <span className="font-mono-numbers text-neutral-300">{color.highlights}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={color.highlights}
                onChange={(e) => handleColorChange('highlights', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: 3-Way Color Wheels */}
      {activeSubTab === 'wheels' && (
        <div className="space-y-4 pt-1">
          {(['lift', 'gamma', 'gain', 'offset'] as const).map((wheel) => {
            const label =
              wheel === 'lift'
                ? 'Lift (Shadows)'
                : wheel === 'gamma'
                ? 'Gamma (Midtones)'
                : wheel === 'gain'
                ? 'Gain (Highlights)'
                : 'Offset (Master)';

            const val = color[wheel];

            return (
              <div key={wheel} className="p-2.5 bg-[#141720] rounded-lg border border-[#202533] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200 text-xs">{label}</span>
                  <button
                    onClick={() => {
                      handleColorWheelChange(wheel, 'r', 0);
                      handleColorWheelChange(wheel, 'g', 0);
                      handleColorWheelChange(wheel, 'b', 0);
                      handleColorWheelChange(wheel, 'luminance', 0);
                    }}
                    className="text-[10px] text-neutral-500 hover:text-amber-400"
                  >
                    Reset
                  </button>
                </div>

                {/* Color Sliders for R, G, B channels */}
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-rose-400 font-mono-numbers">Red {val.r.toFixed(1)}</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={val.r}
                      onChange={(e) => handleColorWheelChange(wheel, 'r', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <span className="text-emerald-400 font-mono-numbers">Green {val.g.toFixed(1)}</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={val.g}
                      onChange={(e) => handleColorWheelChange(wheel, 'g', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <span className="text-blue-400 font-mono-numbers">Blue {val.b.toFixed(1)}</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={val.b}
                      onChange={(e) => handleColorWheelChange(wheel, 'b', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtab 3: RGB Curves */}
      {activeSubTab === 'curves' && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-[#141720] rounded-lg border border-[#202533] flex flex-col items-center">
            <span className="text-xs font-medium text-neutral-300 self-start mb-2">RGB Tone Curve</span>
            {/* Interactive tone curve canvas simulation */}
            <div className="w-52 h-44 bg-[#0a0c10] border border-[#272e3d] rounded relative flex items-center justify-center">
              <svg className="w-full h-full p-2" viewBox="0 0 100 100">
                {/* Grid */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2430" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2430" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#1f2430" strokeWidth="0.5" />
                <line x1="25" y1="0" x2="25" y2="100" stroke="#1f2430" strokeWidth="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2430" strokeWidth="0.5" />
                <line x1="75" y1="0" x2="75" y2="100" stroke="#1f2430" strokeWidth="0.5" />

                {/* S-curve line based on contrast */}
                <path
                  d="M 5 95 C 30 90, 70 10, 95 5"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />

                {/* Control points */}
                <circle cx="5" cy="95" r="3" fill="#f59e0b" />
                <circle cx="35" cy="70" r="3" fill="#ffffff" />
                <circle cx="65" cy="30" r="3" fill="#ffffff" />
                <circle cx="95" cy="5" r="3" fill="#f59e0b" />
              </svg>
            </div>
            <span className="text-[10px] text-neutral-500 mt-2">
              Drag control points to sculpt tone curve response.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
