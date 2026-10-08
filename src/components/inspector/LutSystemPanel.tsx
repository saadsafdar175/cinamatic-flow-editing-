/**
 * CineFlow Studio - 3D LUT System Inspector Panel
 * Import .cube / .3dl files, procedural cinema LUT presets, intensity adjustment, and .cube export
 */

import React, { useRef } from 'react';
import { Grid, Upload, Trash2, Download, Check } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { PROCEDURAL_LUTS, generateCubeLutFile } from '../../utils/lutParser';

export const LutSystemPanel: React.FC = () => {
  const { selectedClip, updateClip } = useEditor();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select a clip to apply 3D LUTs.
      </div>
    );
  }

  const { lut } = selectedClip;

  const handleSelectProceduralLut = (lutId: string, lutName: string, category: string) => {
    updateClip(selectedClip.id, (c) => ({
      lut: {
        ...c.lut,
        id: lutId,
        name: lutName,
        category,
        intensity: c.lut.intensity || 80,
      },
    }));
  };

  const handleIntensityChange = (val: number) => {
    updateClip(selectedClip.id, (c) => ({
      lut: {
        ...c.lut,
        intensity: val,
      },
    }));
  };

  const handleRemoveLut = () => {
    updateClip(selectedClip.id, (c) => ({
      lut: {
        id: '',
        name: 'None',
        category: '',
        intensity: 0,
        cubeData: undefined,
      },
    }));
  };

  // Import local .cube or .3dl file
  const handleImportCubeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      updateClip(selectedClip.id, (c) => ({
        lut: {
          id: `custom_${file.name}`,
          name: file.name.replace(/\.(cube|3dl)$/i, ''),
          category: 'Custom',
          intensity: 100,
          cubeData: text,
        },
      }));
    } catch {
      alert('Failed to parse .CUBE LUT file');
    }
  };

  // Export current grade as a standard .cube file
  const handleExportCube = () => {
    const cubeContent = generateCubeLutFile(
      `${selectedClip.name}_Grade`,
      (r, g, b) => {
        // Procedural film curve applied to grid
        const activeProc = PROCEDURAL_LUTS.find((p) => p.id === lut.id);
        if (activeProc) {
          return activeProc.curve(r, g, b);
        }
        return [r * 1.05, g * 0.98, b * 0.95];
      },
      17
    );

    const blob = new Blob([cubeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lut.name || 'CineFlow_Grade'}.cube`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">3D LUT Engine</h3>
        </div>
        {lut.id && (
          <button
            onClick={handleRemoveLut}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
            title="Remove LUT"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Import & Export Custom .CUBE buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 py-2 bg-[#151821] hover:bg-[#1e2330] border border-[#232836] rounded text-neutral-200 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Import .CUBE / .3DL</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".cube,.3dl"
            onChange={handleImportCubeFile}
            className="hidden"
          />
        </button>

        <button
          onClick={handleExportCube}
          className="flex items-center justify-center gap-1.5 py-2 bg-[#151821] hover:bg-[#1e2330] border border-[#232836] rounded text-neutral-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export .CUBE</span>
        </button>
      </div>

      {/* Current Active LUT & Intensity */}
      {lut.id ? (
        <div className="p-3 bg-[#141720] rounded-lg border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-medium text-white">{lut.name}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono-numbers">{lut.intensity}%</span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>LUT Intensity</span>
              <span className="font-mono-numbers">{lut.intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lut.intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#13161f] rounded-lg border border-[#1e2330] text-center text-neutral-500">
          No LUT active. Select a cinematic preset below or import a .cube file.
        </div>
      )}

      {/* Built-in Procedural LUT Presets */}
      <div className="space-y-2 pt-2">
        <label className="text-neutral-400 font-medium">Built-In Cinematic LUTs</label>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {PROCEDURAL_LUTS.map((item) => {
            const isSelected = lut.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectProceduralLut(item.id, item.name, item.category)}
                className={`p-2 rounded text-left border transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                    : 'bg-[#151821] border-[#222735] text-neutral-300 hover:bg-[#1a1f2b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.previewColor }}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="font-medium text-[11px] mt-1.5 truncate">{item.name}</div>
                <div className="text-[9px] text-neutral-400 truncate mt-0.5">{item.category}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
