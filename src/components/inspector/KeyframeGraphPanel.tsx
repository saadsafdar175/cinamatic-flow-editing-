/**
 * CineFlow Studio - Keyframe System & Graph Editor Inspector Panel
 * Multi-property keyframing (Position, Scale, Rotation, Opacity, Exposure), easing curves,
 * and interactive Graph Editor curve visualization.
 */

import React, { useState } from 'react';
import { Diamond, Plus, Trash2, Activity, Play } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { Keyframe } from '../../types/editor';

const KEYFRAME_PROPERTIES = [
  { id: 'scale', name: 'Scale' },
  { id: 'positionX', name: 'Position X' },
  { id: 'positionY', name: 'Position Y' },
  { id: 'rotation', name: 'Rotation' },
  { id: 'opacity', name: 'Opacity' },
  { id: 'exposure', name: 'Exposure' },
];

export const KeyframeGraphPanel: React.FC = () => {
  const { selectedClip, updateClip, playhead } = useEditor();
  const [activeProp, setActiveProp] = useState<string>('scale');

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to animate keyframes.
      </div>
    );
  }

  const { keyframes, startTime, duration } = selectedClip;
  const clipRelativeTime = Math.max(0, Math.min(duration, playhead - startTime));

  const currentKeyframes: Keyframe[] = keyframes[activeProp] || [];

  // Check if there is already a keyframe near current time
  const existingKfIndex = currentKeyframes.findIndex(
    (k) => Math.abs(k.time - clipRelativeTime) < 0.05
  );
  const hasKeyframeAtPlayhead = existingKfIndex !== -1;

  // Add or toggle keyframe at current playhead
  const handleToggleKeyframe = () => {
    let currentVal = 1.0;
    if (activeProp === 'scale') currentVal = selectedClip.transform.scale;
    if (activeProp === 'positionX') currentVal = selectedClip.transform.x;
    if (activeProp === 'positionY') currentVal = selectedClip.transform.y;
    if (activeProp === 'rotation') currentVal = selectedClip.transform.rotation;
    if (activeProp === 'opacity') currentVal = selectedClip.transform.opacity;
    if (activeProp === 'exposure') currentVal = selectedClip.color.exposure;

    if (hasKeyframeAtPlayhead) {
      // Remove it
      const updated = currentKeyframes.filter((_, idx) => idx !== existingKfIndex);
      updateClip(selectedClip.id, (c) => ({
        keyframes: { ...c.keyframes, [activeProp]: updated },
      }));
    } else {
      // Add it
      const newKf: Keyframe = {
        time: clipRelativeTime,
        value: currentVal,
        easing: 'ease-in-out',
      };
      const updated = [...currentKeyframes, newKf].sort((a, b) => a.time - b.time);
      updateClip(selectedClip.id, (c) => ({
        keyframes: { ...c.keyframes, [activeProp]: updated },
      }));
    }
  };

  const handleUpdateEasing = (kfIdx: number, easing: Keyframe['easing']) => {
    const updated = [...currentKeyframes];
    updated[kfIdx].easing = easing;
    updateClip(selectedClip.id, (c) => ({
      keyframes: { ...c.keyframes, [activeProp]: updated },
    }));
  };

  const handleRemoveKf = (kfIdx: number) => {
    const updated = currentKeyframes.filter((_, idx) => idx !== kfIdx);
    updateClip(selectedClip.id, (c) => ({
      keyframes: { ...c.keyframes, [activeProp]: updated },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Diamond className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Keyframe Graph Editor</h3>
        </div>
      </div>

      {/* Property Selector */}
      <div className="space-y-1.5">
        <label className="text-neutral-400 font-medium">Animatable Property</label>
        <div className="grid grid-cols-3 gap-1.5">
          {KEYFRAME_PROPERTIES.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setActiveProp(prop.id)}
              className={`py-1.5 px-2 rounded text-[11px] border text-center transition-colors ${
                activeProp === prop.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                  : 'bg-[#151821] border-[#222735] text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {prop.name}
            </button>
          ))}
        </div>
      </div>

      {/* Keyframe Trigger at Playhead */}
      <div className="p-3 bg-[#131620] rounded-lg border border-[#222735] flex items-center justify-between">
        <div>
          <div className="font-medium text-white">
            Keyframe at {clipRelativeTime.toFixed(2)}s
          </div>
          <div className="text-[10px] text-neutral-400">
            {currentKeyframes.length} keyframes set on {activeProp}
          </div>
        </div>

        <button
          onClick={handleToggleKeyframe}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
            hasKeyframeAtPlayhead
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-sm'
          }`}
        >
          <Diamond className="w-3.5 h-3.5" />
          <span>{hasKeyframeAtPlayhead ? 'Remove Keyframe' : 'Add Keyframe'}</span>
        </button>
      </div>

      {/* Visual Graph Editor */}
      <div className="p-3 bg-[#131620] rounded-lg border border-[#222735] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-neutral-300 font-medium text-[11px] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Curve Graph</span>
          </span>
          <span className="text-[10px] text-neutral-500">0s - {duration.toFixed(1)}s</span>
        </div>

        {/* Graph Canvas SVG */}
        <div className="w-full h-36 bg-[#090b10] border border-[#202636] rounded relative p-2 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Horizontal Grid */}
            <line x1="0" y1="25" x2="200" y2="25" stroke="#1c202a" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="200" y2="50" stroke="#1c202a" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="200" y2="75" stroke="#1c202a" strokeWidth="0.5" />

            {/* Playhead line inside graph */}
            <line
              x1={(clipRelativeTime / duration) * 200}
              y1="0"
              x2={(clipRelativeTime / duration) * 200}
              y2="100"
              stroke="#f59e0b"
              strokeWidth="1"
            />

            {/* Bezier Keyframe Curve Line */}
            {currentKeyframes.length >= 2 ? (
              <polyline
                points={currentKeyframes
                  .map((k) => `${(k.time / duration) * 200},${100 - (k.value / 2) * 50}`)
                  .join(' ')}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
            ) : null}

            {/* Keyframe Nodes */}
            {currentKeyframes.map((k, idx) => {
              const cx = (k.time / duration) * 200;
              const cy = Math.max(10, Math.min(90, 100 - (k.value / 2) * 50));
              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Keyframe List Table with Easing */}
      {currentKeyframes.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <label className="text-neutral-400 font-medium">Keyframe Points & Easing</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {currentKeyframes.map((k, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-[#151821] rounded border border-[#202533]"
              >
                <div className="flex items-center gap-2">
                  <Diamond className="w-3 h-3 text-amber-400" />
                  <span className="font-mono-numbers text-[11px] text-white">
                    {k.time.toFixed(2)}s
                  </span>
                  <span className="text-[10px] text-neutral-400">Val: {k.value.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={k.easing}
                    onChange={(e) =>
                      handleUpdateEasing(idx, e.target.value as Keyframe['easing'])
                    }
                    className="bg-[#101217] text-[10px] text-neutral-300 border border-[#282f40] rounded px-1.5 py-0.5 outline-none"
                  >
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In-Out</option>
                    <option value="bezier">Smooth Bezier</option>
                  </select>

                  <button
                    onClick={() => handleRemoveKf(idx)}
                    className="text-neutral-500 hover:text-rose-400"
                    title="Delete keyframe"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
