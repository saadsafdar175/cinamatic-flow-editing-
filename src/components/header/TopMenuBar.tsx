/**
 * CineFlow Studio - Top Menu Bar
 * Clean 3-zone desktop workstation header: Brand & Project Name — Quick Actions — Export & Packaging
 */

import React, { useState } from 'react';
import {
  Film,
  Undo2,
  Redo2,
  Save,
  Download,
  FolderOpen,
  Monitor,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { importCineflowFile } from '../../services/projectStorage';
import { AspectRatioPreset } from '../../types/editor';

interface TopMenuBarProps {
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenWindowsAppModal: () => void;
  onGoHome: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({
  onOpenExportModal,
  onOpenWindowsAppModal,
  onGoHome,
}) => {
  const {
    project,
    updateProjectSettings,
    undo,
    redo,
    canUndo,
    canRedo,
    saveProjectFile,
    loadProject,
    autosaveNotice,
  } = useEditor();

  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.settings.name);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (projectName.trim()) {
      updateProjectSettings({ name: projectName.trim() });
    } else {
      setProjectName(project.settings.name);
    }
  };

  const handleOpenProjectInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const loaded = await importCineflowFile(file);
        loadProject(loaded);
      } catch {
        alert('Invalid .cineflow project file');
      }
    }
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = e.target.value as AspectRatioPreset;
    let width = 1920;
    let height = 1080;
    if (ratio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (ratio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (ratio === '4:5') {
      width = 1080;
      height = 1350;
    } else if (ratio === '21:9') {
      width = 2560;
      height = 1080;
    }
    updateProjectSettings({ aspectRatio: ratio, width, height });
  };

  return (
    <header className="h-12 bg-[#0e1014] border-b border-[#1f232d] px-4 flex items-center justify-between z-30 select-none">
      {/* Zone 1: Brand & Project Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-amber-500 hover:text-amber-400 transition-colors group"
          title="Return to Home Screen"
        >
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Film className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-bold tracking-wider text-sm text-white">
            CINEFLOW <span className="text-amber-500 font-semibold">STUDIO</span>
          </span>
        </button>

        <div className="h-4 w-[1px] bg-[#222733]" />

        {/* Project Name editable */}
        {isEditingName ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            autoFocus
            className="bg-[#171a22] text-xs text-white px-2 py-1 rounded border border-amber-500/50 outline-none w-48"
          />
        ) : (
          <button
            onClick={() => {
              setProjectName(project.settings.name);
              setIsEditingName(true);
            }}
            className="text-xs text-neutral-300 hover:text-white transition-colors truncate max-w-[200px] text-left"
            title="Click to rename project"
          >
            {project.settings.name}
          </button>
        )}

        {/* Aspect Ratio Picker */}
        <div className="flex items-center gap-1 bg-[#151820] border border-[#232733] rounded px-1.5 py-0.5">
          <Layers className="w-3 h-3 text-neutral-500" />
          <select
            value={project.settings.aspectRatio}
            onChange={handleAspectRatioChange}
            className="bg-transparent text-[11px] text-neutral-300 outline-none cursor-pointer pr-1"
          >
            <option value="16:9" className="bg-[#151820] text-neutral-300">16:9 YouTube</option>
            <option value="9:16" className="bg-[#151820] text-neutral-300">9:16 Shorts/Reels</option>
            <option value="1:1" className="bg-[#151820] text-neutral-300">1:1 Square</option>
            <option value="4:5" className="bg-[#151820] text-neutral-300">4:5 Instagram</option>
            <option value="21:9" className="bg-[#151820] text-neutral-300">21:9 Cinema</option>
          </select>
        </div>
      </div>

      {/* Zone 2: Workspace Controls (Undo, Redo, Open, Save) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded transition-colors ${
            canUndo ? 'text-neutral-300 hover:text-white hover:bg-[#1a1e27]' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded transition-colors ${
            canRedo ? 'text-neutral-300 hover:text-white hover:bg-[#1a1e27]' : 'text-neutral-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#222733] mx-1" />

        {/* Open .cineflow */}
        <label
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-[#1a1e27] rounded cursor-pointer transition-colors"
          title="Open .cineflow Project"
        >
          <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
          <span>Open</span>
          <input
            type="file"
            accept=".cineflow,application/json"
            onChange={handleOpenProjectInput}
            className="hidden"
          />
        </label>

        {/* Save .cineflow */}
        <button
          onClick={saveProjectFile}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-[#1a1e27] rounded transition-colors"
          title="Save as .cineflow file"
        >
          <Save className="w-3.5 h-3.5 text-neutral-400" />
          <span>Save</span>
        </button>

        {/* Autosave Status Notice */}
        {autosaveNotice && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded ml-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{autosaveNotice}</span>
          </div>
        )}
      </div>

      {/* Zone 3: Windows Desktop Build & Export Video */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWindowsAppModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-[#151820] hover:bg-[#1e232f] border border-[#272c3a] rounded transition-colors"
          title="Windows Desktop Package (.exe)"
        >
          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          <span>Windows App</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded transition-colors shadow-sm cursor-pointer"
          title="Export Video Project"
        >
          <Download className="w-3.5 h-3.5 text-neutral-950" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
