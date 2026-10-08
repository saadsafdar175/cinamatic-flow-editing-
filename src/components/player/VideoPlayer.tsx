/**
 * CineFlow Studio - Professional Video Player Monitor
 * Real-time canvas preview, frame-accurate transport controls, timecode display,
 * safe area overlays, zoom levels, and Before/After grading comparison.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Maximize2,
  ZoomIn,
  Sliders,
  Columns,
  Eye,
  Crosshair,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { renderCompositedFrame } from '../../services/videoCompositor';
import { secondsToTimecode, timecodeToSeconds } from '../../utils/timecode';

export const VideoPlayer: React.FC = () => {
  const {
    project,
    playhead,
    isPlaying,
    togglePlay,
    setPlayhead,
    stepForward,
    stepBackward,
    safeAreas,
    setSafeAreas,
    compareMode,
    setCompareMode,
  } = useEditor();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<'fit' | '50%' | '100%' | '200%'>('fit');
  const [splitPos, setSplitPos] = useState<number>(0.5);
  const [isEditingTimecode, setIsEditingTimecode] = useState(false);
  const [timecodeInput, setTimecodeInput] = useState('');

  // Re-render canvas whenever playhead, project settings, clips, or compareMode changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Maintain aspect ratio resolution
    if (canvas.width !== project.settings.width || canvas.height !== project.settings.height) {
      canvas.width = project.settings.width;
      canvas.height = project.settings.height;
    }

    renderCompositedFrame(canvas, project, playhead, {
      showSafeAreas: safeAreas,
      compareMode,
      splitPosition: splitPos,
    });
  }, [
    project,
    playhead,
    safeAreas,
    compareMode,
    splitPos,
    project.settings.width,
    project.settings.height,
  ]);

  const handleStop = () => {
    if (isPlaying) togglePlay();
    setPlayhead(0);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleTimecodeSubmit = () => {
    setIsEditingTimecode(false);
    const secs = timecodeToSeconds(timecodeInput, project.settings.fps);
    setPlayhead(secs);
  };

  // Determine canvas sizing based on zoom
  const getCanvasScaleStyle = (): React.CSSProperties => {
    if (zoomLevel === '50%') return { width: '50%', height: 'auto' };
    if (zoomLevel === '100%')
      return { width: `${project.settings.width}px`, maxWidth: 'none', height: 'auto' };
    if (zoomLevel === '200%')
      return { width: `${project.settings.width * 2}px`, maxWidth: 'none', height: 'auto' };
    // Fit
    return { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#0b0c10] border-b border-[#1b1f29] relative overflow-hidden select-none"
    >
      {/* Top Preview Status Bar */}
      <div className="h-8 bg-[#0f1117] border-b border-[#1b1f29] px-3 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="font-medium text-neutral-300">
            {project.settings.width}×{project.settings.height} ({project.settings.aspectRatio})
          </span>
          <span className="text-neutral-600">|</span>
          <span className="font-mono-numbers text-neutral-300">{project.settings.fps} FPS</span>
        </div>

        {/* Viewport Zoom & Compare Controls */}
        <div className="flex items-center gap-2">
          {/* Compare Mode Toggle */}
          <div className="flex items-center bg-[#151821] border border-[#222735] rounded p-0.5">
            <button
              onClick={() => setCompareMode('none')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                compareMode === 'none' ? 'bg-[#252b3a] text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Standard view"
            >
              Normal
            </button>
            <button
              onClick={() => setCompareMode('split')}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                compareMode === 'split' ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Before / After Split Screen"
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setCompareMode('before')}
              className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                compareMode === 'before' ? 'bg-cyan-500/20 text-cyan-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Show Original Unprocessed"
            >
              <Eye className="w-3 h-3" />
              <span>Original</span>
            </button>
          </div>

          {/* Safe Areas Overlay */}
          <button
            onClick={() => setSafeAreas(!safeAreas)}
            className={`p-1 rounded transition-colors ${
              safeAreas ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-400 hover:text-white'
            }`}
            title="Toggle Safe Margins & Center Crosshair"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Selector */}
          <div className="flex items-center gap-1 bg-[#151821] border border-[#222735] rounded px-1.5 py-0.5">
            <ZoomIn className="w-3 h-3 text-neutral-500" />
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(e.target.value as 'fit' | '50%' | '100%' | '200%')}
              className="bg-transparent text-[10px] text-neutral-300 outline-none cursor-pointer"
            >
              <option value="fit" className="bg-[#151821]">Fit</option>
              <option value="50%" className="bg-[#151821]">50%</option>
              <option value="100%" className="bg-[#151821]">100%</option>
              <option value="200%" className="bg-[#151821]">200%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Preview Monitor Viewport */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-[#07080b]">
        <div className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl rounded overflow-hidden">
          <canvas
            ref={canvasRef}
            className="transition-transform duration-75 block bg-black"
            style={getCanvasScaleStyle()}
          />

          {/* Draggable Split-Screen Slider Handle */}
          {compareMode === 'split' && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={splitPos}
              onChange={(e) => setSplitPos(parseFloat(e.target.value))}
              className="absolute inset-x-0 bottom-4 w-2/3 mx-auto z-10 opacity-70 hover:opacity-100 transition-opacity"
              title="Slide Before / After split"
            />
          )}
        </div>
      </div>

      {/* Transport Control Bar */}
      <div className="h-11 bg-[#0f1117] border-t border-[#1b1f29] px-4 flex items-center justify-between z-10">
        {/* Left: Timecode Display */}
        <div className="flex items-center gap-2">
          {isEditingTimecode ? (
            <input
              type="text"
              value={timecodeInput}
              onChange={(e) => setTimecodeInput(e.target.value)}
              onBlur={handleTimecodeSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTimecodeSubmit()}
              autoFocus
              className="bg-[#181c26] text-amber-400 font-mono-numbers text-xs px-2 py-0.5 rounded border border-amber-500/50 outline-none w-28"
            />
          ) : (
            <button
              onClick={() => {
                setTimecodeInput(secondsToTimecode(playhead, project.settings.fps));
                setIsEditingTimecode(true);
              }}
              className="font-mono-numbers text-xs font-semibold text-amber-400 hover:text-amber-300 bg-[#161a24] border border-[#232838] px-2.5 py-1 rounded transition-colors"
              title="Click to jump to exact timecode"
            >
              {secondsToTimecode(playhead, project.settings.fps)}
            </button>
          )}

          <span className="text-neutral-500 text-xs">/</span>

          <span className="font-mono-numbers text-xs text-neutral-400">
            {secondsToTimecode(project.settings.duration, project.settings.fps)}
          </span>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={stepBackward}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-[#1a1e29] rounded transition-colors"
            title="Previous Frame (Arrow Left)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Play / Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStop}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-[#1a1e29] rounded transition-colors"
            title="Stop & Reset to Start"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={stepForward}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-[#1a1e29] rounded transition-colors"
            title="Next Frame (Arrow Right)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreen}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#1a1e29] rounded transition-colors"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
