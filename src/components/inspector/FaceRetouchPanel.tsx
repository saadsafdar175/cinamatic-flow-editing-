/**
 * CineFlow Studio - AI Face Retouch & Face Tracking Inspector Panel
 * Local facial zone detection, Natural vs Beauty mode, skin smoothing without plastic look,
 * eye brightness, teeth whitening, lip color enhancement, and face contour tracking.
 */

import React from 'react';
import { Smile, RotateCcw, Sparkles, Scan, Shield } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { FaceRetouchConfig } from '../../types/editor';

export const FaceRetouchPanel: React.FC = () => {
  const { selectedClip, updateClip, resetClipRetouch } = useEditor();

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to adjust AI Face Retouching.
      </div>
    );
  }

  const { faceRetouch } = selectedClip;

  const handleChange = (key: keyof FaceRetouchConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      faceRetouch: {
        ...c.faceRetouch,
        [key]: val,
      },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">AI Face Retouch</h3>
        </div>
        <button
          onClick={() => resetClipRetouch(selectedClip.id)}
          className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
          title="Reset Face Retouch"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Enable & Mode Toggle */}
      <div className="p-3 bg-[#141720] rounded-lg border border-[#202533] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Enable Face Retouch</span>
          </div>
          <input
            type="checkbox"
            checked={faceRetouch.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Natural Mode vs Beauty Mode */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleChange('mode', 'natural')}
            className={`flex-1 py-1.5 rounded border text-center transition-all ${
              faceRetouch.mode === 'natural'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                : 'bg-[#151821] border-[#252a38] text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Natural Mode (Default)
          </button>
          <button
            onClick={() => handleChange('mode', 'beauty')}
            className={`flex-1 py-1.5 rounded border text-center transition-all ${
              faceRetouch.mode === 'beauty'
                ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-medium'
                : 'bg-[#151821] border-[#252a38] text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Beauty Mode
          </button>
        </div>

        {/* Local Face Tracking Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e2330]">
          <div className="flex items-center gap-2">
            <Scan className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-300 text-[11px]">Real-Time Face Tracking</span>
          </div>
          <input
            type="checkbox"
            checked={faceRetouch.faceTracking}
            onChange={(e) => handleChange('faceTracking', e.target.checked)}
            className="w-4 h-4 accent-cyan-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Skin Controls */}
      <div className="space-y-3 pt-1">
        <h4 className="font-medium text-neutral-200">Skin Texture & Smoothing</h4>

        {/* Skin Smoothing */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Skin Smoothing</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.skinSmoothing}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.skinSmoothing}
            onChange={(e) => handleChange('skinSmoothing', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Skin Texture Preservation */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Texture Preservation (Anti-Plastic)</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.skinTexture}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.skinTexture}
            onChange={(e) => handleChange('skinTexture', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Blemish Reduction */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Blemish Reduction</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.blemishReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.blemishReduction}
            onChange={(e) => handleChange('blemishReduction', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Skin Tone Warmth */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Skin Tone Warmth</span>
            <span className="font-mono-numbers text-amber-400">{faceRetouch.skinTone}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={faceRetouch.skinTone}
            onChange={(e) => handleChange('skinTone', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Facial Features (Eyes, Teeth, Lips, Slimming) */}
      <div className="space-y-3 pt-3 border-t border-[#1f2430]">
        <h4 className="font-medium text-neutral-200">Facial Features Enhancement</h4>

        {/* Eye Brightness */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Eye Brightness & Catchlight</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.eyeBrightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.eyeBrightness}
            onChange={(e) => handleChange('eyeBrightness', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Teeth Whitening */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Teeth Whitening</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.teethWhitening}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.teethWhitening}
            onChange={(e) => handleChange('teethWhitening', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Lip Color */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Lip Color Enhancement</span>
            <span className="font-mono-numbers text-pink-400">{faceRetouch.lipColor}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.lipColor}
            onChange={(e) => handleChange('lipColor', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Face Slimming & Contour */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Face Slimming & Jaw Contour</span>
            <span className="font-mono-numbers text-neutral-200">{faceRetouch.faceSlimming}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={faceRetouch.faceSlimming}
            onChange={(e) => handleChange('faceSlimming', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
