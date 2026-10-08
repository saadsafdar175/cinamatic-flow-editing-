/**
 * CineFlow Studio - Project Factory & Default Initial State
 */

import { EditorProject, Track, Clip, AspectRatioPreset } from '../types/editor';
import { INITIAL_SAMPLE_MEDIA } from '../services/sampleMedia';

export function createDefaultClip(
  trackId: string,
  type: 'video' | 'image' | 'audio' | 'text',
  name: string,
  sourceUrl: string,
  thumbnailUrl: string,
  startTime: number,
  duration: number
): Clip {
  return {
    id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    trackId,
    name,
    type,
    startTime,
    duration,
    sourceStartTime: 0,
    sourceDuration: duration,
    sourceUrl,
    thumbnailUrl,

    transform: {
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      blendMode: 'normal',
      flipH: false,
      flipV: false,
      crop: { top: 0, bottom: 0, left: 0, right: 0 },
    },

    speed: 1.0,
    speedCurve: [
      { time: 0, speed: 1.0 },
      { time: 0.5, speed: 1.0 },
      { time: 1.0, speed: 1.0 },
    ],
    opticalFlow: false,
    freezeFrame: false,
    isReversed: false,

    color: {
      exposure: 0,
      brightness: 0,
      contrast: 10,
      saturation: 15,
      vibrance: 10,
      temperature: 5,
      tint: 0,
      highlights: -5,
      shadows: 8,
      whites: 0,
      blacks: -5,
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

    dslrCinematic: {
      contrast: 15,
      highlightRollOff: 35,
      shadowControl: 10,
      filmicBlacks: 20,
      softHighlights: 25,
      microContrast: 30,
      clarity: 15,
      dehaze: 0,
      grain: 18,
      vignette: 22,
      bloom: 15,
      halation: 20,
      lensSoftness: 10,
      chromaticAberration: 8,
      lensDistortion: 0,
      sharpness: 25,
      texture: 20,
      activePreset: 'DSLR Natural',
      presetIntensity: 85,
    },

    lut: {
      id: 'teal-orange-hollywood',
      name: 'Teal & Orange Cinema',
      category: 'Cinema',
      intensity: 75,
    },

    filmicCamera: {
      filmStock: 'Kodak Vision3 500T',
      grainIntensity: 22,
      grainSize: 18,
      softHighlight: 30,
      blackCrush: 12,
      fade: 8,
      halation: 25,
      bloom: 15,
      gateWeave: 5,
      exposureVariation: 4,
      vignette: 20,
      protectSkinTones: true,
    },

    faceRetouch: {
      enabled: true,
      mode: 'natural',
      skinSmoothing: 40,
      skinTexture: 65,
      skinTone: 5,
      skinBrightness: 15,
      blemishReduction: 50,
      faceBrightness: 12,
      eyeBrightness: 25,
      eyeDetail: 30,
      teethWhitening: 35,
      lipColor: 20,
      faceContour: 15,
      jawRefinement: 10,
      noseRefinement: 5,
      faceSlimming: 10,
      faceTracking: true,
    },

    keyframes: {
      positionX: [],
      positionY: [],
      scale: [],
      rotation: [],
      opacity: [],
    },

    audio: {
      volume: 100,
      fadeIn: 0,
      fadeOut: 0,
      mute: false,
      noiseReduction: 20,
      eq: { bass: 2, mid: 0, treble: 1 },
      compressor: true,
      voiceEnhancement: 40,
      pitch: 0,
    },

    textConfig: {
      content: 'CINEFLOW STUDIO',
      urduContent: '',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 42,
      bold: true,
      italic: false,
      align: 'center',
      letterSpacing: 4,
      lineSpacing: 1.2,
      color: '#f8fafc',
      strokeColor: '#0f172a',
      strokeWidth: 2,
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 10,
      bgBox: false,
      bgColor: 'rgba(15, 23, 42, 0.7)',
      opacity: 1.0,
      animation: 'fade',
    },

    mask: {
      type: 'none',
      feather: 20,
      opacity: 100,
      expansion: 0,
      rotation: 0,
      invert: false,
    },

    chromaKey: {
      enabled: false,
      keyColor: '#00ff00',
      similarity: 40,
      smoothness: 10,
      spillReduction: 30,
      edgeFeather: 5,
    },

    effects: [
      {
        id: 'eff_grain',
        type: 'grain',
        name: 'Film Grain',
        category: 'Texture',
        enabled: true,
        intensity: 20,
        params: { size: 15, softness: 10 },
      },
    ],

    filter: {
      id: 'filter_warm_cinema',
      name: 'Cinematic Warmth',
      category: 'Cinematic',
      intensity: 70,
    },

    enhancement: {
      sharpen: 25,
      denoise: 15,
      deblur: 10,
      detailRecovery: 20,
      stabilization: 0,
      flickerRemoval: 0,
      hdEnhance: true,
      fourKEnhance: false,
    },
  };
}

export function createDefaultProject(
  name = 'Untitled Cinematic Project',
  preset: AspectRatioPreset = '16:9'
): EditorProject {
  const resolutions: Record<AspectRatioPreset, { width: number; height: number }> = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
    '21:9': { width: 2560, height: 1080 },
    custom: { width: 1920, height: 1080 },
  };

  const { width, height } = resolutions[preset] || resolutions['16:9'];

  const tracks: Track[] = [
    { id: 'track_vid_1', name: 'Video Track 1', type: 'video', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_vid_2', name: 'Video Track 2', type: 'video', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_vid_3', name: 'Video Track 3', type: 'video', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_overlay', name: 'Overlay Track', type: 'overlay', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_text', name: 'Text Track', type: 'text', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_music', name: 'Music Track', type: 'audio', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_voice', name: 'Voice Track', type: 'voice', isMuted: false, isLocked: false, isHidden: false, clips: [] },
    { id: 'track_sfx', name: 'Sound Effects Track', type: 'sfx', isMuted: false, isLocked: false, isHidden: false, clips: [] },
  ];

  // Seed with initial sample clips on Video Track 1, Text Track, and Music Track
  const goldenHourClip = createDefaultClip(
    'track_vid_1',
    'video',
    INITIAL_SAMPLE_MEDIA[0].name,
    INITIAL_SAMPLE_MEDIA[0].sourceUrl,
    INITIAL_SAMPLE_MEDIA[0].thumbnailUrl,
    0,
    6.0
  );

  const portraitClip = createDefaultClip(
    'track_vid_1',
    'video',
    INITIAL_SAMPLE_MEDIA[1].name,
    INITIAL_SAMPLE_MEDIA[1].sourceUrl,
    INITIAL_SAMPLE_MEDIA[1].thumbnailUrl,
    6.0,
    6.0
  );

  const titleTextClip = createDefaultClip(
    'track_text',
    'text',
    'Intro Cinematic Title',
    '',
    '',
    1.0,
    4.0
  );
  titleTextClip.textConfig.content = 'CINEMATIC HORIZON';
  titleTextClip.textConfig.fontSize = 54;

  const musicClip = createDefaultClip(
    'track_music',
    'audio',
    INITIAL_SAMPLE_MEDIA[5].name,
    INITIAL_SAMPLE_MEDIA[5].sourceUrl,
    INITIAL_SAMPLE_MEDIA[5].thumbnailUrl,
    0,
    12.0
  );

  tracks[0].clips.push(goldenHourClip, portraitClip);
  tracks[4].clips.push(titleTextClip);
  tracks[5].clips.push(musicClip);

  return {
    settings: {
      id: `proj_${Date.now()}`,
      name,
      aspectRatio: preset,
      width,
      height,
      fps: 30,
      duration: 12.0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    tracks,
  };
}
