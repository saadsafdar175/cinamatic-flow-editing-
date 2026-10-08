/**
 * CineFlow Studio - Main Editor Context & State Manager
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  EditorProject,
  Clip,
  Track,
  SidebarTab,
  AspectRatioPreset,
} from '../types/editor';
import { createDefaultProject, createDefaultClip } from './defaultProject';
import {
  saveProjectToLocalStorage,
  loadProjectFromLocalStorage,
  exportCineflowFile,
} from '../services/projectStorage';
import { INITIAL_SAMPLE_MEDIA, MediaAsset, processUserMediaFile } from '../services/sampleMedia';
import { stepFrame } from '../utils/timecode';
import { playProceduralAudioNote } from '../services/audioEngine';

interface EditorContextType {
  project: EditorProject;
  playhead: number;
  isPlaying: boolean;
  activeTab: SidebarTab;
  selectedClipId: string | null;
  selectedClip: Clip | null;
  selectedTrackId: string | null;
  timelineZoom: number; // pixels per second
  isSnapping: boolean;
  isMagnetic: boolean;
  isRippleDelete: boolean;
  safeAreas: boolean;
  compareMode: 'none' | 'split' | 'before';
  mediaAssets: MediaAsset[];
  canUndo: boolean;
  canRedo: boolean;
  autosaveNotice: string | null;

  // Navigation & Tabs
  setActiveTab: (tab: SidebarTab) => void;
  setPlayhead: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSelectedClipId: (id: string | null) => void;
  setSelectedTrackId: (id: string | null) => void;
  setTimelineZoom: (zoom: number) => void;
  setIsSnapping: (val: boolean) => void;
  setIsMagnetic: (val: boolean) => void;
  setIsRippleDelete: (val: boolean) => void;
  setSafeAreas: (val: boolean) => void;
  setCompareMode: (mode: 'none' | 'split' | 'before') => void;

  // Project operations
  newProject: (name: string, preset: AspectRatioPreset) => void;
  loadProject: (p: EditorProject) => void;
  saveProjectFile: () => void;
  updateProjectSettings: (updates: Partial<EditorProject['settings']>) => void;

  // Clip operations
  addClipToTrack: (trackId: string, asset: MediaAsset, targetTime?: number) => void;
  addTextClip: (urdu?: boolean) => void;
  splitClipAtPlayhead: () => void;
  deleteSelectedClip: () => void;
  duplicateSelectedClip: () => void;
  copySelectedClip: () => void;
  pasteClip: () => void;
  updateClip: (clipId: string, updater: (clip: Clip) => Clip | Partial<Clip>) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  trimClip: (clipId: string, newStart: number, newDuration: number) => void;

  // Resets
  resetClipColor: (clipId: string) => void;
  resetClipDslr: (clipId: string) => void;
  resetClipRetouch: (clipId: string) => void;
  resetClipSpeed: (clipId: string) => void;
  resetClipEffects: (clipId: string) => void;

  // Media
  importMediaFiles: (files: FileList | File[]) => Promise<void>;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<EditorProject>(() => {
    const cached = loadProjectFromLocalStorage();
    return cached || createDefaultProject('My CineFlow Feature Film', '16:9');
  });

  const [playhead, setPlayheadState] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('video');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(() => {
    return project.tracks[0]?.clips[0]?.id || null;
  });
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('track_vid_1');
  const [timelineZoom, setTimelineZoom] = useState<number>(45); // 45px per second
  const [isSnapping, setIsSnapping] = useState<boolean>(true);
  const [isMagnetic, setIsMagnetic] = useState<boolean>(false);
  const [isRippleDelete, setIsRippleDelete] = useState<boolean>(false);
  const [safeAreas, setSafeAreas] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<'none' | 'split' | 'before'>('none');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(INITIAL_SAMPLE_MEDIA);
  const [autosaveNotice, setAutosaveNotice] = useState<string | null>(null);

  // Undo / Redo history
  const historyRef = useRef<EditorProject[]>([project]);
  const historyIndexRef = useRef<number>(0);
  const clipboardRef = useRef<Clip | null>(null);

  const pushHistory = useCallback((newProject: EditorProject) => {
    const currentIndex = historyIndexRef.current;
    const history = historyRef.current.slice(0, currentIndex + 1);
    history.push(JSON.parse(JSON.stringify(newProject)));
    if (history.length > 30) history.shift();
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
  }, []);

  const setPlayhead = useCallback((time: number) => {
    setPlayheadState(Math.max(0, Math.min(project.settings.duration, time)));
  }, [project.settings.duration]);

  // Selected Clip
  const selectedClip = React.useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of project.tracks) {
      const found = track.clips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    return null;
  }, [project.tracks, selectedClipId]);

  // Recalculate project duration based on furthest clip edge
  const updateProjectDuration = useCallback((tracks: Track[]) => {
    let maxEnd = 12.0; // minimum 12 seconds
    for (const track of tracks) {
      for (const clip of track.clips) {
        maxEnd = Math.max(maxEnd, clip.startTime + clip.duration + 2.0);
      }
    }
    return Math.ceil(maxEnd);
  }, []);

  // Update a clip
  const updateClip = useCallback(
    (clipId: string, updater: (clip: Clip) => Clip | Partial<Clip>) => {
      setProject((prev) => {
        let changed = false;
        const newTracks = prev.tracks.map((track) => {
          const clipIdx = track.clips.findIndex((c) => c.id === clipId);
          if (clipIdx === -1) return track;
          changed = true;
          const currentClip = track.clips[clipIdx];
          const result = updater(currentClip);
          const updatedClip = { ...currentClip, ...result };
          const newClips = [...track.clips];
          newClips[clipIdx] = updatedClip;
          return { ...track, clips: newClips };
        });

        if (!changed) return prev;
        const newDur = updateProjectDuration(newTracks);
        const nextProject: EditorProject = {
          ...prev,
          settings: { ...prev.settings, duration: newDur, updatedAt: Date.now() },
          tracks: newTracks,
        };
        pushHistory(nextProject);
        return nextProject;
      });
    },
    [pushHistory, updateProjectDuration]
  );

  // Add clip to track
  const addClipToTrack = useCallback(
    (trackId: string, asset: MediaAsset, targetTime?: number) => {
      setProject((prev) => {
        const track = prev.tracks.find((t) => t.id === trackId);
        if (!track) return prev;

        // Determine startTime: targetTime or end of last clip on track
        let startTime = targetTime ?? 0;
        if (targetTime === undefined) {
          const lastClip = track.clips[track.clips.length - 1];
          startTime = lastClip ? lastClip.startTime + lastClip.duration : 0;
        }

        const newClip = createDefaultClip(
          trackId,
          asset.type,
          asset.name,
          asset.sourceUrl,
          asset.thumbnailUrl,
          startTime,
          asset.duration
        );

        const newTracks = prev.tracks.map((t) => {
          if (t.id === trackId) {
            return { ...t, clips: [...t.clips, newClip] };
          }
          return t;
        });

        const newDur = updateProjectDuration(newTracks);
        const nextProject = {
          ...prev,
          settings: { ...prev.settings, duration: newDur, updatedAt: Date.now() },
          tracks: newTracks,
        };
        setSelectedClipId(newClip.id);
        pushHistory(nextProject);
        return nextProject;
      });
    },
    [pushHistory, updateProjectDuration]
  );

  // Add text clip
  const addTextClip = useCallback(
    (urdu = false) => {
      setProject((prev) => {
        const textTrack = prev.tracks.find((t) => t.type === 'text') || prev.tracks[4];
        const newClip = createDefaultClip(
          textTrack.id,
          'text',
          urdu ? 'Urdu Nastaliq Text' : 'Text Overlay',
          '',
          '',
          playhead,
          4.0
        );

        if (urdu) {
          newClip.textConfig.urduContent = 'خوش آمدید سائن فلو اسٹوڈیو';
          newClip.textConfig.content = '';
          newClip.textConfig.fontSize = 48;
        } else {
          newClip.textConfig.content = 'CINEMATIC TEXT TITLE';
        }

        const newTracks = prev.tracks.map((t) => {
          if (t.id === textTrack.id) {
            return { ...t, clips: [...t.clips, newClip] };
          }
          return t;
        });

        const nextProject = {
          ...prev,
          settings: { ...prev.settings, updatedAt: Date.now() },
          tracks: newTracks,
        };
        setSelectedClipId(newClip.id);
        setActiveTab('text');
        pushHistory(nextProject);
        return nextProject;
      });
    },
    [playhead, pushHistory]
  );

  // Split clip at playhead
  const splitClipAtPlayhead = useCallback(() => {
    if (!selectedClipId) return;

    setProject((prev) => {
      let splitted = false;
      const newTracks = prev.tracks.map((track) => {
        const clipIdx = track.clips.findIndex((c) => c.id === selectedClipId);
        if (clipIdx === -1) return track;

        const clip = track.clips[clipIdx];
        if (playhead <= clip.startTime + 0.1 || playhead >= clip.startTime + clip.duration - 0.1) {
          return track; // Cannot split too close to edges
        }

        const firstDuration = playhead - clip.startTime;
        const secondDuration = clip.duration - firstDuration;

        const clipA: Clip = {
          ...clip,
          duration: firstDuration,
        };

        const clipB: Clip = {
          ...JSON.parse(JSON.stringify(clip)),
          id: `clip_${Date.now()}_split`,
          startTime: playhead,
          duration: secondDuration,
          sourceStartTime: clip.sourceStartTime + firstDuration * clip.speed,
        };

        splitted = true;
        const updatedClips = [...track.clips];
        updatedClips.splice(clipIdx, 1, clipA, clipB);
        setSelectedClipId(clipB.id);
        return { ...track, clips: updatedClips };
      });

      if (!splitted) return prev;
      const nextProject = { ...prev, tracks: newTracks, settings: { ...prev.settings, updatedAt: Date.now() } };
      pushHistory(nextProject);
      return nextProject;
    });
  }, [playhead, pushHistory, selectedClipId]);

  // Delete clip (with ripple delete option)
  const deleteSelectedClip = useCallback(() => {
    if (!selectedClipId) return;

    setProject((prev) => {
      let deleted = false;
      const newTracks = prev.tracks.map((track) => {
        const clipIdx = track.clips.findIndex((c) => c.id === selectedClipId);
        if (clipIdx === -1) return track;

        deleted = true;
        const deletedClip = track.clips[clipIdx];
        let remaining = track.clips.filter((c) => c.id !== selectedClipId);

        // Ripple delete: shift all clips after the deleted one to close gap
        if (isRippleDelete) {
          const shiftAmount = deletedClip.duration;
          remaining = remaining.map((c) => {
            if (c.startTime > deletedClip.startTime) {
              return { ...c, startTime: Math.max(0, c.startTime - shiftAmount) };
            }
            return c;
          });
        }

        return { ...track, clips: remaining };
      });

      if (!deleted) return prev;
      setSelectedClipId(null);
      const newDur = updateProjectDuration(newTracks);
      const nextProject = {
        ...prev,
        settings: { ...prev.settings, duration: newDur, updatedAt: Date.now() },
        tracks: newTracks,
      };
      pushHistory(nextProject);
      return nextProject;
    });
  }, [isRippleDelete, pushHistory, selectedClipId, updateProjectDuration]);

  // Duplicate clip
  const duplicateSelectedClip = useCallback(() => {
    if (!selectedClip) return;

    setProject((prev) => {
      const track = prev.tracks.find((t) => t.id === selectedClip.trackId);
      if (!track) return prev;

      const dupClip: Clip = {
        ...JSON.parse(JSON.stringify(selectedClip)),
        id: `clip_${Date.now()}_dup`,
        startTime: selectedClip.startTime + selectedClip.duration + 0.2,
      };

      const newTracks = prev.tracks.map((t) => {
        if (t.id === selectedClip.trackId) {
          return { ...t, clips: [...t.clips, dupClip] };
        }
        return t;
      });

      const nextProject = { ...prev, tracks: newTracks, settings: { ...prev.settings, updatedAt: Date.now() } };
      setSelectedClipId(dupClip.id);
      pushHistory(nextProject);
      return nextProject;
    });
  }, [pushHistory, selectedClip]);

  // Copy & Paste
  const copySelectedClip = useCallback(() => {
    if (selectedClip) {
      clipboardRef.current = JSON.parse(JSON.stringify(selectedClip));
    }
  }, [selectedClip]);

  const pasteClip = useCallback(() => {
    if (!clipboardRef.current) return;
    const clipToPaste = clipboardRef.current;
    const targetTrackId = selectedTrackId || clipToPaste.trackId;

    const newClip: Clip = {
      ...JSON.parse(JSON.stringify(clipToPaste)),
      id: `clip_${Date.now()}_paste`,
      trackId: targetTrackId,
      startTime: playhead,
    };

    setProject((prev) => {
      const newTracks = prev.tracks.map((t) => {
        if (t.id === targetTrackId) {
          return { ...t, clips: [...t.clips, newClip] };
        }
        return t;
      });
      const nextProject = { ...prev, tracks: newTracks, settings: { ...prev.settings, updatedAt: Date.now() } };
      setSelectedClipId(newClip.id);
      pushHistory(nextProject);
      return nextProject;
    });
  }, [playhead, pushHistory, selectedTrackId]);

  // Move clip
  const moveClip = useCallback(
    (clipId: string, newStartTime: number, newTrackId?: string) => {
      setProject((prev) => {
        let moved = false;
        let movingClip: Clip | null = null;

        // Remove from old track
        const tracksWithout = prev.tracks.map((t) => {
          const idx = t.clips.findIndex((c) => c.id === clipId);
          if (idx !== -1) {
            movingClip = { ...t.clips[idx] };
            return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
          }
          return t;
        });

        if (!movingClip) return prev;

        const targetTrack = newTrackId || (movingClip as Clip).trackId;
        const updatedClip: Clip = {
          ...(movingClip as Clip),
          trackId: targetTrack,
          startTime: Math.max(0, newStartTime),
        };

        const finalTracks = tracksWithout.map((t) => {
          if (t.id === targetTrack) {
            return { ...t, clips: [...t.clips, updatedClip] };
          }
          return t;
        });

        moved = true;
        const newDur = updateProjectDuration(finalTracks);
        const nextProject = {
          ...prev,
          settings: { ...prev.settings, duration: newDur, updatedAt: Date.now() },
          tracks: finalTracks,
        };
        pushHistory(nextProject);
        return nextProject;
      });
    },
    [pushHistory, updateProjectDuration]
  );

  // Trim clip
  const trimClip = useCallback(
    (clipId: string, newStart: number, newDuration: number) => {
      updateClip(clipId, (c) => ({
        startTime: Math.max(0, newStart),
        duration: Math.max(0.2, newDuration),
      }));
    },
    [updateClip]
  );

  // Resets for non-destructive editing
  const resetClipColor = useCallback((clipId: string) => {
    updateClip(clipId, (c) => ({
      color: {
        exposure: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        vibrance: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        curves: {
          rgb: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
          r: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
          g: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
          b: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        },
        lift: { r: 0, g: 0, b: 0, luminance: 0 },
        gamma: { r: 0, g: 0, b: 0, luminance: 0 },
        gain: { r: 0, g: 0, b: 0, luminance: 0 },
        offset: { r: 0, g: 0, b: 0, luminance: 0 },
        skinToneProtection: true,
      },
    }));
  }, [updateClip]);

  const resetClipDslr = useCallback((clipId: string) => {
    updateClip(clipId, (c) => ({
      dslrCinematic: {
        contrast: 0,
        highlightRollOff: 0,
        shadowControl: 0,
        filmicBlacks: 0,
        softHighlights: 0,
        microContrast: 0,
        clarity: 0,
        dehaze: 0,
        grain: 0,
        vignette: 0,
        bloom: 0,
        halation: 0,
        lensSoftness: 0,
        chromaticAberration: 0,
        lensDistortion: 0,
        sharpness: 0,
        texture: 0,
        activePreset: 'None',
        presetIntensity: 0,
      },
    }));
  }, [updateClip]);

  const resetClipRetouch = useCallback((clipId: string) => {
    updateClip(clipId, (c) => ({
      faceRetouch: {
        enabled: false,
        mode: 'natural',
        skinSmoothing: 0,
        skinTexture: 50,
        skinTone: 0,
        skinBrightness: 0,
        blemishReduction: 0,
        faceBrightness: 0,
        eyeBrightness: 0,
        eyeDetail: 0,
        teethWhitening: 0,
        lipColor: 0,
        faceContour: 0,
        jawRefinement: 0,
        noseRefinement: 0,
        faceSlimming: 0,
        faceTracking: true,
      },
    }));
  }, [updateClip]);

  const resetClipSpeed = useCallback((clipId: string) => {
    updateClip(clipId, () => ({
      speed: 1.0,
      opticalFlow: false,
      freezeFrame: false,
      isReversed: false,
      speedCurve: [
        { time: 0, speed: 1.0 },
        { time: 0.5, speed: 1.0 },
        { time: 1.0, speed: 1.0 },
      ],
    }));
  }, [updateClip]);

  const resetClipEffects = useCallback((clipId: string) => {
    updateClip(clipId, () => ({
      effects: [],
      filter: { id: '', name: 'Normal', category: 'Standard', intensity: 0 },
    }));
  }, [updateClip]);

  // Import local user files
  const importMediaFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const f of list) {
      try {
        const asset = await processUserMediaFile(f);
        setMediaAssets((prev) => [asset, ...prev]);
      } catch (err) {
        console.error('Failed to import user file', err);
      }
    }
  }, []);

  // Undo / Redo
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prevState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setProject(prevState);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      setProject(nextState);
    }
  }, []);

  // Playback control
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setPlayheadState((prev) => Math.min(project.settings.duration, stepFrame(prev, 1, project.settings.fps)));
  }, [project.settings.duration, project.settings.fps]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setPlayheadState((prev) => Math.max(0, stepFrame(prev, -1, project.settings.fps)));
  }, [project.settings.fps]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastStamp = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastStamp) / 1000;
      lastStamp = now;

      setPlayheadState((prev) => {
        const next = prev + delta;
        if (next >= project.settings.duration) {
          setIsPlaying(false);
          return 0; // loop back to start
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, project.settings.duration]);

  // Play procedural audio if clips active
  useEffect(() => {
    if (isPlaying && Math.random() < 0.08) {
      // Gentle auditory feedback
      const activeAudioTrack = project.tracks.find((t) => t.type === 'audio' || t.type === 'sfx');
      if (activeAudioTrack && !activeAudioTrack.isMuted) {
        playProceduralAudioNote('music', 0.15);
      }
    }
  }, [isPlaying, playhead, project.tracks]);

  // Autosave every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      saveProjectToLocalStorage(project);
      setAutosaveNotice('Autosaved');
      setTimeout(() => setAutosaveNotice(null), 2500);
    }, 30000);
    return () => clearInterval(timer);
  }, [project]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectedClip();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClip();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        splitClipAtPlayhead();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    stepBackward,
    stepForward,
    undo,
    redo,
    copySelectedClip,
    pasteClip,
    splitClipAtPlayhead,
    deleteSelectedClip,
  ]);

  const newProject = (name: string, preset: AspectRatioPreset) => {
    const p = createDefaultProject(name, preset);
    setProject(p);
    setSelectedClipId(p.tracks[0]?.clips[0]?.id || null);
    setPlayheadState(0);
    setIsPlaying(false);
    historyRef.current = [p];
    historyIndexRef.current = 0;
  };

  const loadProject = (p: EditorProject) => {
    setProject(p);
    setSelectedClipId(p.tracks[0]?.clips[0]?.id || null);
    setPlayheadState(0);
    setIsPlaying(false);
    historyRef.current = [p];
    historyIndexRef.current = 0;
  };

  const saveProjectFile = () => {
    exportCineflowFile(project);
    setAutosaveNotice('Saved .cineflow');
    setTimeout(() => setAutosaveNotice(null), 3000);
  };

  const updateProjectSettings = (updates: Partial<EditorProject['settings']>) => {
    setProject((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates, updatedAt: Date.now() },
    }));
  };

  return (
    <EditorContext.Provider
      value={{
        project,
        playhead,
        isPlaying,
        activeTab,
        selectedClipId,
        selectedClip,
        selectedTrackId,
        timelineZoom,
        isSnapping,
        isMagnetic,
        isRippleDelete,
        safeAreas,
        compareMode,
        mediaAssets,
        canUndo,
        canRedo,
        autosaveNotice,

        setActiveTab,
        setPlayhead,
        setIsPlaying,
        togglePlay,
        stepForward,
        stepBackward,
        setSelectedClipId,
        setSelectedTrackId,
        setTimelineZoom,
        setIsSnapping,
        setIsMagnetic,
        setIsRippleDelete,
        setSafeAreas,
        setCompareMode,

        newProject,
        loadProject,
        saveProjectFile,
        updateProjectSettings,

        addClipToTrack,
        addTextClip,
        splitClipAtPlayhead,
        deleteSelectedClip,
        duplicateSelectedClip,
        copySelectedClip,
        pasteClip,
        updateClip,
        moveClip,
        trimClip,

        resetClipColor,
        resetClipDslr,
        resetClipRetouch,
        resetClipSpeed,
        resetClipEffects,

        importMediaFiles,
        undo,
        redo,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
