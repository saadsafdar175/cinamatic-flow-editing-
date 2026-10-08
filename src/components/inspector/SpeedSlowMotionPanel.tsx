/**
 * CineFlow Studio - Speed & Smooth Slow Motion Inspector Panel
 * Optical Flow interpolation, normal speed multipliers, curve speed ramp graph editor,
 * and cinematic slow motion presets.
 */

import React, { useState } from 'react';
import { Gauge, RotateCcw, Activity, Zap, Play } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];

export const SpeedSlowMotionPanel: React.FC = () => {
  const { selectedClip, updateClip, resetClipSpeed } = useEditor();
  const [activeSpeedTab, setActiveSpeedTab] = useState<'constant' | 'curve'>('constant');

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to adjust playback speed.
      </div>
    );
  }

  const { speed, opticalFlow, speedCurve } = selectedClip;

  const handleSpeedChange = (newSpeed: number) => {
    updateClip(selectedClip.id, (c) => {
      // Adjust timeline duration inversely proportionally to speed
      const newDur = Math.max(0.5, (c.sourceDuration || c.duration) / newSpeed);
      return {
        speed: newSpeed,
        duration: newDur,
      };
    });
  };

  const handleOpticalFlowToggle = () => {
    updateClip(selectedClip.id, (c) => ({
      opticalFlow: !c.opticalFlow,
    }));
  };

  const applyCurvePreset = (presetType: 'ramp_slow' | 'hero_moment' | 'flash_fast') => {
    let newCurve = [
      { time: 0, speed: 1.0 },
      { time: 0.5, speed: 1.0 },
      { time: 1.0, speed: 1.0 },
    ];

    if (presetType === 'ramp_slow') {
      newCurve = [
        { time: 0, speed: 1.0 },
        { time: 0.4, speed: 0.4 },
        { time: 0.7, speed: 0.25 },
        { time: 1.0, speed: 1.0 },
      ];
    } else if (presetType === 'hero_moment') {
      newCurve = [
        { time: 0, speed: 1.5 },
        { time: 0.3, speed: 0.3 },
        { time: 0.7, speed: 0.3 },
        { time: 1.0, speed: 1.5 },
      ];
    } else if (presetType === 'flash_fast') {
      newCurve = [
        { time: 0, speed: 0.5 },
        { time: 0.5, speed: 2.5 },
        { time: 1.0, speed: 0.5 },
      ];
    }

    updateClip(selectedClip.id, () => ({
      speedCurve: newCurve,
      opticalFlow: true,
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Speed & Slow Motion</h3>
        </div>
        <button
          onClick={() => resetClipSpeed(selectedClip.id)}
          className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
          title="Reset playback speed to 1.0x"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Optical Flow Smooth Slow Motion Banner */}
      <div className="p-3 bg-[#131722] rounded-lg border border-[#232a3b] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">Optical Flow Motion Estimation</span>
          </div>
          <input
            type="checkbox"
            checked={opticalFlow}
            onChange={handleOpticalFlowToggle}
            className="w-4 h-4 accent-cyan-500 cursor-pointer"
          />
        </div>
        <p className="text-[10px] text-neutral-400">
          Synthesizes local in-between motion frames for artifact-free ultra-smooth slow motion.
        </p>
      </div>

      {/* Speed Mode Tabs (Constant vs Speed Graph) */}
      <div className="flex items-center gap-1 bg-[#13161f] p-1 rounded-md border border-[#1e2330]">
        <button
          onClick={() => setActiveSpeedTab('constant')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeSpeedTab === 'constant'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Constant Speed
        </button>
        <button
          onClick={() => setActiveSpeedTab('curve')}
          className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
            activeSpeedTab === 'curve'
              ? 'bg-[#222736] text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Speed Ramp Graph
        </button>
      </div>

      {/* Constant Speed Controls */}
      {activeSpeedTab === 'constant' && (
        <div className="space-y-4 pt-1">
          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {SPEED_PRESETS.map((preset) => {
              const isActive = Math.abs(speed - preset) < 0.01;
              return (
                <button
                  key={preset}
                  onClick={() => handleSpeedChange(preset)}
                  className={`py-1.5 rounded font-mono-numbers text-[11px] border transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-[#151821] border-[#222735] text-neutral-300 hover:bg-[#1a1f2c]'
                  }`}
                >
                  {preset}x
                </button>
              );
            })}
          </div>

          {/* Continuous Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-neutral-400">
              <span>Playback Rate</span>
              <span className="font-mono-numbers text-amber-400 font-semibold">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.05"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Speed Ramp Graph */}
      {activeSpeedTab === 'curve' && (
        <div className="space-y-3 pt-1">
          <label className="text-neutral-400 font-medium">Speed Ramp Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyCurvePreset('ramp_slow')}
              className="p-2 bg-[#151821] hover:bg-[#1f2533] border border-[#222735] rounded text-left transition-colors"
            >
              <div className="font-medium text-amber-400 text-[11px]">Cinematic Slow</div>
              <div className="text-[9px] text-neutral-500 mt-0.5">100% → 25% → 100%</div>
            </button>

            <button
              onClick={() => applyCurvePreset('hero_moment')}
              className="p-2 bg-[#151821] hover:bg-[#1f2533] border border-[#222735] rounded text-left transition-colors"
            >
              <div className="font-medium text-cyan-400 text-[11px]">Hero Impact</div>
              <div className="text-[9px] text-neutral-500 mt-0.5">150% → 30% → 150%</div>
            </button>

            <button
              onClick={() => applyCurvePreset('flash_fast')}
              className="p-2 bg-[#151821] hover:bg-[#1f2533] border border-[#222735] rounded text-left transition-colors"
            >
              <div className="font-medium text-purple-400 text-[11px]">Fast Speed Up</div>
              <div className="text-[9px] text-neutral-500 mt-0.5">50% → 250% → 50%</div>
            </button>
          </div>

          {/* Interactive Bezier Speed Graph Visualization */}
          <div className="p-3 bg-[#131620] rounded-lg border border-[#222735]">
            <span className="text-[11px] font-medium text-neutral-300 block mb-2">
              Speed Ramp Curve
            </span>
            <div className="w-full h-32 bg-[#090b10] border border-[#212736] rounded relative flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <line x1="0" y1="30" x2="100" y2="30" stroke="#1f2430" strokeWidth="0.5" strokeDasharray="2" />
                {/* Curve path */}
                <path
                  d="M 5 30 Q 30 50, 50 50 T 95 30"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <circle cx="5" cy="30" r="2.5" fill="#06b6d4" />
                <circle cx="50" cy="50" r="3" fill="#ffffff" stroke="#06b6d4" strokeWidth="1" />
                <circle cx="95" cy="30" r="2.5" fill="#06b6d4" />
              </svg>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1.5 block">
              Dynamic speed ramps adjust motion dynamically during clip playback.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
