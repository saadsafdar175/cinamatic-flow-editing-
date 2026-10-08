/**
 * CineFlow Studio - Professional Multi-Track Video Timeline
 * 8 Tracks, scrubbing playhead, clip drag-and-drop, trim handles, split, delete,
 * duplicate, ripple delete, magnetic snapping, waveform visualization, and zoom.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  Layers,
  Magnet,
  Maximize,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { Track, Clip } from '../../types/editor';
import { formatTimeSeconds } from '../../utils/timecode';

export const Timeline: React.FC = () => {
  const {
    project,
    playhead,
    setPlayhead,
    selectedClipId,
    setSelectedClipId,
    selectedTrackId,
    setSelectedTrackId,
    timelineZoom,
    setTimelineZoom,
    isSnapping,
    setIsSnapping,
    isMagnetic,
    setIsMagnetic,
    isRippleDelete,
    setIsRippleDelete,
    splitClipAtPlayhead,
    deleteSelectedClip,
    duplicateSelectedClip,
    copySelectedClip,
    pasteClip,
    moveClip,
    trimClip,
    addTextClip,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tracksContainerRef = useRef<HTMLDivElement | null>(null);

  // Dragging states
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    sourceTrackId: string;
    startX: number;
    initialStartTime: number;
  } | null>(null);

  const [trimmingClip, setTrimmingClip] = useState<{
    clipId: string;
    handle: 'left' | 'right';
    startX: number;
    initialStartTime: number;
    initialDuration: number;
  } | null>(null);

  // Pixel width of the entire timeline
  const timelinePixelWidth = Math.max(1200, project.settings.duration * timelineZoom);

  // Time to pixel conversion
  const timeToPx = (time: number) => time * timelineZoom;
  const pxToTime = (px: number) => Math.max(0, px / timelineZoom);

  // Snapping helper
  const snapTime = (targetTime: number, excludeClipId?: string): number => {
    if (!isSnapping) return targetTime;
    const snapThreshold = 6 / timelineZoom; // snap within ~6 pixels

    // Snap to playhead
    if (Math.abs(targetTime - playhead) < snapThreshold) {
      return playhead;
    }

    // Snap to clip edges
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.id === excludeClipId) continue;
        if (Math.abs(targetTime - clip.startTime) < snapThreshold) {
          return clip.startTime;
        }
        if (Math.abs(targetTime - (clip.startTime + clip.duration)) < snapThreshold) {
          return clip.startTime + clip.duration;
        }
      }
    }

    return targetTime;
  };

  // Timeline scrubber click / drag
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updatePlayheadFromMouse(e);
  };

  const updatePlayheadFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (!tracksContainerRef.current) return;
    const rect = tracksContainerRef.current.getBoundingClientRect();
    const scrollLeft = tracksContainerRef.current.scrollLeft;
    const clientX = e.clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(project.settings.duration, pxToTime(clientX)));
    setPlayhead(newTime);
  };

  // Global mouse listeners for clip dragging, trimming, and scrubbing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromMouse(e);
      } else if (draggingClip) {
        const deltaX = e.clientX - draggingClip.startX;
        const deltaTime = deltaX / timelineZoom;
        let newStartTime = Math.max(0, draggingClip.initialStartTime + deltaTime);
        newStartTime = snapTime(newStartTime, draggingClip.clipId);
        moveClip(draggingClip.clipId, newStartTime);
      } else if (trimmingClip) {
        const deltaX = e.clientX - trimmingClip.startX;
        const deltaTime = deltaX / timelineZoom;

        if (trimmingClip.handle === 'left') {
          let newStart = Math.max(0, trimmingClip.initialStartTime + deltaTime);
          newStart = snapTime(newStart, trimmingClip.clipId);
          const newDur = Math.max(0.2, trimmingClip.initialDuration - (newStart - trimmingClip.initialStartTime));
          trimClip(trimmingClip.clipId, newStart, newDur);
        } else {
          // Right handle
          let newDur = Math.max(0.2, trimmingClip.initialDuration + deltaTime);
          const rightEdge = snapTime(trimmingClip.initialStartTime + newDur, trimmingClip.clipId);
          newDur = Math.max(0.2, rightEdge - trimmingClip.initialStartTime);
          trimClip(trimmingClip.clipId, trimmingClip.initialStartTime, newDur);
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClip(null);
      setTrimmingClip(null);
    };

    if (isScrubbing || draggingClip || trimmingClip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbing,
    draggingClip,
    trimmingClip,
    timelineZoom,
    moveClip,
    trimClip,
    setPlayhead,
    project.settings.duration,
  ]);

  // Handle Drag Over / Drop from Media Library
  const handleTimelineDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const asset = JSON.parse(dataStr);
      if (!tracksContainerRef.current) return;
      const rect = tracksContainerRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left + tracksContainerRef.current.scrollLeft;
      const dropTime = Math.max(0, pxToTime(dropX));
      // Add clip to dropped track
      const { addClipToTrack } = useEditor();
      addClipToTrack(trackId, asset, dropTime);
    } catch {
      // ignore
    }
  };

  // Generate ruler tick marks
  const renderRulerTicks = () => {
    const ticks = [];
    const totalSecs = Math.ceil(project.settings.duration);
    const step = timelineZoom > 60 ? 1 : timelineZoom > 30 ? 2 : 5;

    for (let s = 0; s <= totalSecs; s += step) {
      const left = timeToPx(s);
      ticks.push(
        <div
          key={s}
          className="absolute top-0 bottom-0 border-l border-[#232838] flex items-end pb-1 pl-1"
          style={{ left: `${left}px` }}
        >
          <span className="text-[10px] font-mono-numbers text-neutral-400 select-none">
            {formatTimeSeconds(s)}
          </span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div
      ref={containerRef}
      className="h-72 bg-[#0c0d11] border-t border-[#1e222c] flex flex-col z-20 select-none"
    >
      {/* Timeline Action Bar */}
      <div className="h-9 bg-[#111319] border-b border-[#1c202a] px-3 flex items-center justify-between">
        {/* Left: Editing Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={splitClipAtPlayhead}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              selectedClipId
                ? 'bg-[#1a1e28] text-neutral-200 hover:text-white hover:bg-amber-500/20 hover:text-amber-300'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Split Clip at Playhead (Ctrl+B)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            onClick={deleteSelectedClip}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              selectedClipId
                ? 'bg-[#1a1e28] text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Delete Selected Clip (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={duplicateSelectedClip}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              selectedClipId
                ? 'bg-[#1a1e28] text-neutral-300 hover:text-white hover:bg-[#252b3a]'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Duplicate Clip"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => addTextClip(false)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[#1a1e28] text-neutral-300 hover:text-white hover:bg-[#252b3a] transition-colors"
            title="Add Text Clip to Timeline"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>Add Text</span>
          </button>
        </div>

        {/* Center: Timeline Behaviors (Snapping, Magnetic, Ripple) */}
        <div className="flex items-center gap-2">
          {/* Snapping */}
          <button
            onClick={() => setIsSnapping(!isSnapping)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isSnapping
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Snapping (magnet to clip edges and playhead)"
          >
            <Magnet className="w-3 h-3" />
            <span>Snap</span>
          </button>

          {/* Magnetic Timeline */}
          <button
            onClick={() => setIsMagnetic(!isMagnetic)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isMagnetic
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Magnetic Timeline (eliminates gaps automatically)"
          >
            <Layers className="w-3 h-3" />
            <span>Magnetic</span>
          </button>

          {/* Ripple Delete Toggle */}
          <button
            onClick={() => setIsRippleDelete(!isRippleDelete)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isRippleDelete
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Ripple Delete (shifts subsequent clips when deleting)"
          >
            <span>Ripple</span>
          </button>
        </div>

        {/* Right: Zoom Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimelineZoom(Math.max(15, timelineZoom - 10))}
            className="text-neutral-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="15"
            max="120"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(parseInt(e.target.value, 10))}
            className="w-24"
            title="Timeline Zoom Level"
          />
          <button
            onClick={() => setTimelineZoom(Math.min(120, timelineZoom + 10))}
            className="text-neutral-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers (Width 170px) */}
        <div className="w-44 bg-[#0e1015] border-r border-[#1a1e27] flex flex-col shrink-0 select-none">
          {/* Ruler spacer */}
          <div className="h-6 bg-[#13161f] border-b border-[#1c202a] px-3 flex items-center justify-between text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            <span>Tracks</span>
            <span>{project.tracks.length}</span>
          </div>

          {/* Track Headers list */}
          <div className="flex-1 overflow-y-auto">
            {project.tracks.map((track) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`h-11 px-2.5 flex items-center justify-between border-b border-[#171a24] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#181c26] text-amber-400' : 'text-neutral-300 hover:bg-[#131620]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[11px] font-medium truncate">{track.name}</span>
                  </div>

                  {/* Track Controls (Mute / Lock) */}
                  <div className="flex items-center gap-1 text-neutral-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        track.isMuted = !track.isMuted;
                      }}
                      className="p-1 hover:text-neutral-200 rounded"
                      title="Mute track"
                    >
                      {track.isMuted ? (
                        <VolumeX className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        track.isLocked = !track.isLocked;
                      }}
                      className="p-1 hover:text-neutral-200 rounded"
                      title="Lock track"
                    >
                      {track.isLocked ? (
                        <Lock className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Scrollable Timeline Viewport */}
        <div
          ref={tracksContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#090a0d]"
        >
          <div style={{ width: `${timelinePixelWidth}px`, minWidth: '100%' }} className="relative h-full">
            {/* Top Ruler */}
            <div
              onMouseDown={handleRulerMouseDown}
              className="h-6 bg-[#12151e] border-b border-[#1c202a] relative cursor-pointer sticky top-0 z-30 shadow-sm"
            >
              {renderRulerTicks()}
            </div>

            {/* Playhead Indicator Line */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40 transition-all duration-75"
              style={{ left: `${timeToPx(playhead)}px` }}
            >
              {/* Playhead Head */}
              <div className="w-3 h-3 bg-amber-500 rotate-45 -ml-1.5 -mt-1 shadow-md" />
              {/* Vertical red/amber guide line */}
              <div className="w-[1.5px] bg-amber-500 h-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>

            {/* Track Lanes */}
            <div className="flex flex-col">
              {project.tracks.map((track) => (
                <div
                  key={track.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleTimelineDrop(e, track.id)}
                  className={`h-11 border-b border-[#151821] relative flex items-center transition-colors ${
                    selectedTrackId === track.id ? 'bg-[#11141c]' : 'bg-[#0b0c10]'
                  }`}
                >
                  {/* Clips on Track */}
                  {track.clips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const left = timeToPx(clip.startTime);
                    const width = Math.max(12, timeToPx(clip.duration));

                    const isAudio = clip.type === 'audio';
                    const isText = clip.type === 'text';

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClipId(clip.id);
                          setSelectedTrackId(track.id);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedClipId(clip.id);
                          setSelectedTrackId(track.id);
                          setDraggingClip({
                            clipId: clip.id,
                            sourceTrackId: track.id,
                            startX: e.clientX,
                            initialStartTime: clip.startTime,
                          });
                        }}
                        className={`absolute h-8 rounded top-1.5 flex items-center overflow-hidden cursor-grab active:cursor-grabbing border transition-shadow ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/70 shadow-[0_0_10px_rgba(245,158,11,0.3)] z-10'
                            : isAudio
                            ? 'border-purple-800/60 bg-purple-950/40 hover:border-purple-600'
                            : isText
                            ? 'border-blue-800/60 bg-blue-950/40 hover:border-blue-600'
                            : 'border-[#2d3446] bg-[#1a202d] hover:border-neutral-500'
                        }`}
                        style={{ left: `${left}px`, width: `${width}px` }}
                      >
                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedClipId(clip.id);
                            setTrimmingClip({
                              clipId: clip.id,
                              handle: 'left',
                              startX: e.clientX,
                              initialStartTime: clip.startTime,
                              initialDuration: clip.duration,
                            });
                          }}
                          className="w-2.5 h-full bg-neutral-600/40 hover:bg-amber-400/80 cursor-ew-resize absolute left-0 top-0 bottom-0 z-20 transition-colors"
                          title="Drag to trim start"
                        />

                        {/* Clip Content & Thumbnail */}
                        <div className="flex items-center gap-1.5 px-3 w-full overflow-hidden pointer-events-none">
                          {clip.thumbnailUrl && !isAudio && !isText && (
                            <img
                              src={clip.thumbnailUrl}
                              alt=""
                              className="w-5 h-5 object-cover rounded shrink-0 opacity-80"
                            />
                          )}
                          <span className="text-[11px] font-medium text-neutral-200 truncate">
                            {isText
                              ? clip.textConfig.urduContent || clip.textConfig.content
                              : clip.name}
                          </span>
                          <span className="text-[9px] font-mono-numbers text-neutral-400 ml-auto shrink-0">
                            {formatTimeSeconds(clip.duration)}
                          </span>
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedClipId(clip.id);
                            setTrimmingClip({
                              clipId: clip.id,
                              handle: 'right',
                              startX: e.clientX,
                              initialStartTime: clip.startTime,
                              initialDuration: clip.duration,
                            });
                          }}
                          className="w-2.5 h-full bg-neutral-600/40 hover:bg-amber-400/80 cursor-ew-resize absolute right-0 top-0 bottom-0 z-20 transition-colors"
                          title="Drag to trim end"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
