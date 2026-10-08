/**
 * CineFlow Studio - Text & Typography Inspector Panel
 * Professional English and Urdu (Nastaliq) text editor, font styling, stroke, shadows,
 * background boxes, and kinetic typography animations.
 */

import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Languages } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { TextConfig } from '../../types/editor';

const TEXT_ANIMATIONS: Array<{ id: TextConfig['animation']; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade In' },
  { id: 'slide', label: 'Smooth Slide' },
  { id: 'pop', label: 'Pop Elastic' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'zoom', label: 'Dynamic Zoom' },
  { id: 'bounce', label: 'Bounce' },
];

export const TextPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();

  if (!selectedClip || selectedClip.type !== 'text') {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a text clip on the Text Track to edit typography.
      </div>
    );
  }

  const { textConfig } = selectedClip;

  const handleChange = (key: keyof TextConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      textConfig: {
        ...c.textConfig,
        [key]: val,
      },
    }));
  };

  const handleSetUrduPreset = () => {
    updateClip(selectedClip.id, (c) => ({
      textConfig: {
        ...c.textConfig,
        urduContent: 'خوش آمدید سائن فلو اسٹوڈیو',
        fontSize: 48,
        letterSpacing: 0,
        fontFamily: 'Noto Nastaliq Urdu',
      },
    }));
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Text & Typography</h3>
        </div>

        {/* Quick Urdu toggle button */}
        <button
          onClick={handleSetUrduPreset}
          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded transition-colors"
          title="Insert Urdu Nastaliq Sample"
        >
          <Languages className="w-3 h-3" />
          <span>اردو Nastaliq</span>
        </button>
      </div>

      {/* English Content Input */}
      <div className="space-y-1.5">
        <label className="text-neutral-400 font-medium">Text Content (English)</label>
        <textarea
          rows={2}
          value={textConfig.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Enter video text title..."
          className="w-full bg-[#151821] border border-[#232836] rounded p-2 text-white outline-none focus:border-amber-500/50 resize-none"
        />
      </div>

      {/* Urdu Content Input */}
      <div className="space-y-1.5">
        <label className="text-neutral-400 font-medium">اردو مواد (Urdu Nastaliq Text)</label>
        <textarea
          rows={2}
          dir="rtl"
          value={textConfig.urduContent || ''}
          onChange={(e) => handleChange('urduContent', e.target.value)}
          placeholder="اردو متن یہاں درج کریں..."
          className="w-full font-urdu bg-[#151821] border border-[#232836] rounded p-2 text-white outline-none focus:border-amber-500/50 resize-none text-right text-sm leading-relaxed"
        />
      </div>

      {/* Font Family & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-neutral-400 font-medium block mb-1">Font Family</label>
          <select
            value={textConfig.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full bg-[#151821] border border-[#232836] rounded px-2 py-1.5 text-neutral-200 outline-none"
          >
            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            <option value="Noto Nastaliq Urdu">Noto Nastaliq (اردو)</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
            <option value="sans-serif">System Sans</option>
            <option value="serif">Classic Serif</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400 font-medium">Font Size</span>
            <span className="font-mono-numbers">{textConfig.fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="120"
            value={textConfig.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
            className="w-full mt-1.5"
          />
        </div>
      </div>

      {/* Style & Alignment toolbar */}
      <div className="flex items-center gap-1 bg-[#13161f] p-1 rounded border border-[#202533]">
        <button
          onClick={() => handleChange('bold', !textConfig.bold)}
          className={`p-1.5 rounded transition-colors ${
            textConfig.bold ? 'bg-[#252b3a] text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleChange('italic', !textConfig.italic)}
          className={`p-1.5 rounded transition-colors ${
            textConfig.italic ? 'bg-[#252b3a] text-amber-400 italic' : 'text-neutral-400 hover:text-white'
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#232836] mx-1" />

        <button
          onClick={() => handleChange('align', 'left')}
          className={`p-1.5 rounded ${
            textConfig.align === 'left' ? 'bg-[#252b3a] text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleChange('align', 'center')}
          className={`p-1.5 rounded ${
            textConfig.align === 'center' ? 'bg-[#252b3a] text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleChange('align', 'right')}
          className={`p-1.5 rounded ${
            textConfig.align === 'right' ? 'bg-[#252b3a] text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Color, Stroke & Shadow */}
      <div className="space-y-3 pt-2 border-t border-[#1f2430]">
        <div className="grid grid-cols-2 gap-2">
          {/* Text Color */}
          <div className="flex items-center justify-between p-2 bg-[#151821] rounded border border-[#232836]">
            <span className="text-neutral-300">Text Color</span>
            <input
              type="color"
              value={textConfig.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>

          {/* Stroke Color */}
          <div className="flex items-center justify-between p-2 bg-[#151821] rounded border border-[#232836]">
            <span className="text-neutral-300">Stroke Outline</span>
            <input
              type="color"
              value={textConfig.strokeColor}
              onChange={(e) => handleChange('strokeColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
        </div>

        {/* Stroke Width Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Stroke Width</span>
            <span className="font-mono-numbers">{textConfig.strokeWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={textConfig.strokeWidth}
            onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Drop Shadow Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Drop Shadow Glow</span>
            <span className="font-mono-numbers">{textConfig.shadowBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={textConfig.shadowBlur}
            onChange={(e) => handleChange('shadowBlur', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Kinetic Typography Animations */}
      <div className="space-y-2 pt-2 border-t border-[#1f2430]">
        <label className="text-neutral-400 font-medium">Text In-Animation</label>
        <div className="grid grid-cols-3 gap-1.5">
          {TEXT_ANIMATIONS.map((anim) => (
            <button
              key={anim.id}
              onClick={() => handleChange('animation', anim.id)}
              className={`py-1.5 px-2 rounded border text-center transition-colors ${
                textConfig.animation === anim.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                  : 'bg-[#151821] border-[#222735] text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
