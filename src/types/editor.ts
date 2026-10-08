/**
 * CineFlow Studio - Editor Data Models and Types
 */

export type AspectRatioPreset = '16:9' | '9:16' | '1:1' | '4:5' | '21:9' | 'custom';

export interface ProjectSettings {
  id: string;
  name: string;
  aspectRatio: AspectRatioPreset;
  width: number;
  height: number;
  fps: number;
  duration: number; // total project duration in seconds
  createdAt: number;
  updatedAt: number;
}

export type TrackType = 'video' | 'overlay' | 'text' | 'audio' | 'voice' | 'sfx';

export interface Point {
  x: number;
  y: number;
}

export interface ColorWheelVal {
  r: number;
  g: number;
  b: number;
  luminance: number;
}

export interface CurvePoints {
  rgb: Point[];
  r: Point[];
  g: Point[];
  b: Point[];
}

export interface Keyframe {
  time: number; // relative to clip start in seconds
  value: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier';
}

export interface SpeedCurvePoint {
  time: number; // 0 to 1
  speed: number; // 0.1 to 4.0
}

export interface TextConfig {
  content: string;
  urduContent?: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineSpacing: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  bgBox: boolean;
  bgColor: string;
  opacity: number;
  animation: 'none' | 'fade' | 'slide' | 'pop' | 'typewriter' | 'zoom' | 'bounce';
}

export interface MaskConfig {
  type: 'none' | 'rectangle' | 'circle' | 'linear' | 'gradient';
  feather: number; // 0 - 100
  opacity: number; // 0 - 100
  expansion: number; // -100 - 100
  rotation: number; // 0 - 360
  invert: boolean;
}

export interface ChromaKeyConfig {
  enabled: boolean;
  keyColor: string; // hex
  similarity: number; // 0 - 100
  smoothness: number; // 0 - 100
  spillReduction: number; // 0 - 100
  edgeFeather: number; // 0 - 50
}

export interface AudioConfig {
  volume: number; // 0 - 200%
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  mute: boolean;
  noiseReduction: number; // 0 - 100
  eq: {
    bass: number; // -12 to +12 dB
    mid: number;
    treble: number;
  };
  compressor: boolean;
  voiceEnhancement: number; // 0 - 100
  pitch: number; // -12 to +12 semitones
}

export interface FaceRetouchConfig {
  enabled: boolean;
  mode: 'natural' | 'beauty';
  // Skin
  skinSmoothing: number; // 0 - 100
  skinTexture: number; // 0 - 100
  skinTone: number; // -50 to +50
  skinBrightness: number; // 0 - 100
  blemishReduction: number; // 0 - 100
  // Face
  faceBrightness: number; // 0 - 100
  eyeBrightness: number; // 0 - 100
  eyeDetail: number; // 0 - 100
  teethWhitening: number; // 0 - 100
  lipColor: number; // 0 - 100
  faceContour: number; // 0 - 100
  jawRefinement: number; // 0 - 100
  noseRefinement: number; // 0 - 100
  faceSlimming: number; // 0 - 100
  faceTracking: boolean;
}

export interface DslrCinematicConfig {
  contrast: number; // -50 to +50
  highlightRollOff: number; // 0 - 100
  shadowControl: number; // -50 to +50
  filmicBlacks: number; // 0 - 100
  softHighlights: number; // 0 - 100
  microContrast: number; // 0 - 100
  clarity: number; // -50 to +50
  dehaze: number; // -50 to +50
  grain: number; // 0 - 100
  vignette: number; // 0 - 100
  bloom: number; // 0 - 100
  halation: number; // 0 - 100
  lensSoftness: number; // 0 - 100
  chromaticAberration: number; // 0 - 100
  lensDistortion: number; // -50 to +50
  sharpness: number; // 0 - 100
  texture: number; // 0 - 100
  activePreset: string;
  presetIntensity: number; // 0 - 100
}

export interface FilmicCameraConfig {
  filmStock: string; // 'Kodak Vision3 500T' | 'Kodak Portra 400' | 'Fujifilm Eterna 250D' | 'CineStill 800T' | 'Ilford HP5 B&W' | 'Kodachrome 64'
  grainIntensity: number;
  grainSize: number;
  softHighlight: number;
  blackCrush: number;
  fade: number;
  halation: number;
  bloom: number;
  gateWeave: number; // subtle organic jitter
  exposureVariation: number;
  vignette: number;
  protectSkinTones: boolean;
}

export interface ColorGradingConfig {
  exposure: number; // -100 to 100
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  vibrance: number; // -100 to 100
  temperature: number; // -100 to 100 (cool to warm)
  tint: number; // -100 to 100 (green to magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  curves: CurvePoints;
  lift: ColorWheelVal; // shadows
  gamma: ColorWheelVal; // midtones
  gain: ColorWheelVal; // highlights
  offset: ColorWheelVal;
  skinToneProtection: boolean;
}

export interface LutConfig {
  id: string;
  name: string;
  category: string;
  intensity: number; // 0 - 100
  cubeData?: string; // raw CUBE text or parsed table
}

export interface ClipEffect {
  id: string;
  type: string;
  name: string;
  category: string;
  enabled: boolean;
  intensity: number; // 0 - 100
  params: Record<string, number>;
}

export interface ClipFilter {
  id: string;
  name: string;
  category: string;
  intensity: number; // 0 - 100
}

export interface VideoEnhancementConfig {
  sharpen: number;
  denoise: number;
  deblur: number;
  detailRecovery: number;
  stabilization: number;
  flickerRemoval: number;
  hdEnhance: boolean;
  fourKEnhance: boolean;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'text';
  startTime: number; // position on timeline in seconds
  duration: number; // duration on timeline in seconds
  sourceStartTime: number; // trim offset from start of original media
  sourceDuration: number; // total duration of raw source media
  sourceUrl: string; // object URL or generated canvas stream/data url
  thumbnailUrl: string;

  // Basic Transform
  transform: {
    x: number; // pixel offset from center
    y: number;
    scale: number; // 1.0 = 100%
    rotation: number; // degrees
    opacity: number; // 0 - 1.0
    blendMode: GlobalCompositeOperation | 'normal';
    flipH: boolean;
    flipV: boolean;
    crop: { top: number; bottom: number; left: number; right: number };
  };

  // Speed
  speed: number; // 0.25 to 4.0
  speedCurve: SpeedCurvePoint[];
  opticalFlow: boolean;
  freezeFrame: boolean;
  isReversed: boolean;

  // Features
  color: ColorGradingConfig;
  dslrCinematic: DslrCinematicConfig;
  lut: LutConfig;
  filmicCamera: FilmicCameraConfig;
  faceRetouch: FaceRetouchConfig;
  keyframes: Record<string, Keyframe[]>; // property name -> array of keyframes
  audio: AudioConfig;
  textConfig: TextConfig;
  mask: MaskConfig;
  chromaKey: ChromaKeyConfig;
  effects: ClipEffect[];
  filter: ClipFilter;
  enhancement: VideoEnhancementConfig;

  // Transitions
  transitionIn?: { type: string; duration: number };
  transitionOut?: { type: string; duration: number };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  isHidden: boolean;
  clips: Clip[];
}

export interface EditorProject {
  settings: ProjectSettings;
  tracks: Track[];
}

export type SidebarTab =
  | 'home'
  | 'media'
  | 'video'
  | 'audio'
  | 'text'
  | 'effects'
  | 'filters'
  | 'color'
  | 'retouch'
  | 'speed'
  | 'transitions'
  | 'keyframes'
  | 'dslr'
  | 'filmic'
  | 'lut'
  | 'mask'
  | 'export'
  | 'settings';
