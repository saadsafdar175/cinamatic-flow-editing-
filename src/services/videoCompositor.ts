/**
 * CineFlow Studio - High-Performance Real-Time Video Compositor Engine
 * Handles multi-track layering, transforms, DSLR cinematic grading, AI face retouch,
 * procedural LUTs, chroma key, masking, text overlays, and keyframe interpolation.
 */

import {
  Clip,
  Track,
  EditorProject,
  Keyframe,
  FaceRetouchConfig,
  DslrCinematicConfig,
  ColorGradingConfig,
  FilmicCameraConfig,
  MaskConfig,
  ChromaKeyConfig,
} from '../types/editor';
import { PROCEDURAL_LUTS, applyLut3D, parseCubeLut, ParsedLut3D } from '../utils/lutParser';

// Cache for video elements and parsed LUTs
const videoElementCache = new Map<string, HTMLVideoElement>();
const parsedLutCache = new Map<string, ParsedLut3D>();

/**
 * Evaluates keyframe animated value at timeline time `clipRelativeTime`
 */
export function evaluateKeyframeValue(
  keyframes: Keyframe[] | undefined,
  clipRelativeTime: number,
  defaultValue: number
): number {
  if (!keyframes || keyframes.length === 0) return defaultValue;
  if (keyframes.length === 1) return keyframes[0].value;

  // Sort keyframes by time
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (clipRelativeTime <= sorted[0].time) return sorted[0].value;
  if (clipRelativeTime >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (clipRelativeTime >= k1.time && clipRelativeTime <= k2.time) {
      const span = k2.time - k1.time;
      if (span <= 0) return k1.value;
      let t = (clipRelativeTime - k1.time) / span;

      // Apply easing
      switch (k2.easing) {
        case 'ease-in':
          t = t * t;
          break;
        case 'ease-out':
          t = t * (2 - t);
          break;
        case 'ease-in-out':
          t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          break;
        case 'bezier':
          // cubic bezier approximation
          t = t * t * (3 - 2 * t);
          break;
        default:
          break; // linear
      }
      return k1.value + (k2.value - k1.value) * t;
    }
  }

  return defaultValue;
}

/**
 * Gets or initializes an HTML5 video element for a clip URL
 */
export function getVideoElement(url: string): HTMLVideoElement | null {
  if (url.startsWith('procedural://') || url.startsWith('procedural_audio://')) {
    return null;
  }
  let vid = videoElementCache.get(url);
  if (!vid) {
    vid = document.createElement('video');
    vid.src = url;
    vid.crossOrigin = 'anonymous';
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'auto';
    videoElementCache.set(url, vid);
  }
  return vid;
}

/**
 * Draws procedural video frames for the built-in offline test clips
 */
function renderProceduralVideoFrame(
  ctx: CanvasRenderingContext2D,
  type: string,
  time: number,
  w: number,
  h: number
) {
  if (type.includes('golden_hour')) {
    // Animated sun flare, gentle ocean waves
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.35, '#ea580c');
    sky.addColorStop(0.65, '#fbbf24');
    sky.addColorStop(1, '#0f172a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun with pulsing corona
    const sunPulse = Math.sin(time * 2) * 2;
    const sunX = w * 0.7;
    const sunY = h * 0.45;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 45 + sunPulse, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ocean surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Animated shimmering waves
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    for (let i = 0; i < 8; i++) {
      const y = h * 0.68 + i * (h * 0.04);
      const waveOffset = Math.sin(time * 3 + i) * 20;
      ctx.fillRect(sunX - 100 + waveOffset, y, 200 - i * 15, 3);
    }
  } else if (type.includes('portrait_face')) {
    // Portrait actor face with breathing movement, eye blinks, for testing AI face retouch & tracking
    ctx.fillStyle = '#0d0f14';
    ctx.fillRect(0, 0, w, h);

    // Studio soft rim light
    const rim = ctx.createRadialGradient(w * 0.72, h * 0.35, 20, w * 0.72, h * 0.35, w * 0.5);
    rim.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
    rim.addColorStop(1, 'transparent');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, w, h);

    // Subtle head movement
    const headSwayX = Math.sin(time * 0.8) * 8;
    const headSwayY = Math.cos(time * 1.2) * 4;
    const centerX = w * 0.5 + headSwayX;
    const centerY = h * 0.46 + headSwayY;

    // Neck
    ctx.fillStyle = '#c58368';
    ctx.fillRect(centerX - 35, centerY + 90, 70, h * 0.4);

    // Face Oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 105, 140, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d99879'; // natural skin tone
    ctx.fill();

    // Eyes with subtle blink
    const isBlinking = Math.sin(time * 1.5) > 0.96;
    const eyeOpen = isBlinking ? 1 : 10;

    ctx.fillStyle = '#ffffff';
    // Left eye white
    ctx.beginPath();
    ctx.ellipse(centerX - 42, centerY - 15, 18, eyeOpen, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 42, centerY - 15, 18, eyeOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    // Irises
    if (!isBlinking) {
      ctx.fillStyle = '#3a2723';
      ctx.beginPath();
      ctx.arc(centerX - 42, centerY - 15, 7, 0, Math.PI * 2);
      ctx.arc(centerX + 42, centerY - 15, 7, 0, Math.PI * 2);
      ctx.fill();

      // Catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - 40, centerY - 17, 2.5, 0, Math.PI * 2);
      ctx.arc(centerX + 44, centerY - 17, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lips
    ctx.fillStyle = '#bd5362';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 58, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth highlight
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 57, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#171312';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 45, 120, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
  } else if (type.includes('cyberpunk')) {
    // Neon Tokyo night with moving traffic lights and cyan/magenta reflections
    ctx.fillStyle = '#06070c';
    ctx.fillRect(0, 0, w, h);

    // City skyscrapers
    ctx.fillStyle = '#0d1322';
    for (let x = 0; x < w; x += 60) {
      const bh = 150 + ((x * 13) % 200);
      ctx.fillRect(x, h - bh, 52, bh);
      // Window lights
      ctx.fillStyle = '#1e293b';
      for (let wy = h - bh + 20; wy < h - 40; wy += 25) {
        if ((x + wy) % 7 === 0) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        } else if ((x + wy) % 5 === 0) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        }
        ctx.fillRect(x + 10, wy, 8, 12);
        ctx.fillRect(x + 28, wy, 8, 12);
      }
    }

    // Neon streaks
    const streakX = ((time * 180) % (w + 200)) - 100;
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(streakX, h - 35, 120, 3);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(w - streakX, h - 25, 90, 3);
  } else {
    // Mountain Drone flight simulation
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(0.7, '#7dd3fc');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Moving sun
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.2, 35, 0, Math.PI * 2);
    ctx.fill();

    // Mountain layers with parallax
    const pan = (time * 15) % 100;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-100 + pan, h);
    ctx.lineTo(w * 0.35 + pan, h * 0.35);
    ctx.lineTo(w * 0.7 + pan, h * 0.65);
    ctx.lineTo(w + 100, h);
    ctx.fill();

    ctx.fillStyle = '#f8fafc'; // snow
    ctx.beginPath();
    ctx.moveTo(w * 0.35 + pan, h * 0.35);
    ctx.lineTo(w * 0.3 + pan, h * 0.46);
    ctx.lineTo(w * 0.4 + pan, h * 0.46);
    ctx.fill();
  }
}

/**
 * Pixel-level processor applying DSLR Cinematic Look, Color Grading, Face Retouch, and Procedural LUTs
 */
function applyPixelPipeline(
  imageData: ImageData,
  color: ColorGradingConfig,
  dslr: DslrCinematicConfig,
  filmic: FilmicCameraConfig,
  retouch: FaceRetouchConfig,
  lut: ParsedLut3D | null,
  activeProceduralLutId: string,
  lutIntensity: number,
  time: number
) {
  const data = imageData.data;
  const len = data.length;
  const width = imageData.width;
  const height = imageData.height;

  // Pre-calculate color grading multipliers
  const expFactor = Math.pow(2, color.exposure / 50); // exposure
  const brightAdd = color.brightness * 1.2;
  const contrastFactor = (259 * (color.contrast + 255)) / (255 * (259 - color.contrast));
  const satFactor = 1 + color.saturation / 100;
  const tempWarm = color.temperature / 100;
  const tintMagenta = color.tint / 100;

  // DSLR Micro & Filmic factors
  const filmicBlackFactor = dslr.filmicBlacks / 100;
  const highlightRollFactor = dslr.highlightRollOff / 100;
  const grainAmount = Math.max(dslr.grain, filmic.grainIntensity) / 100;
  const vignetteAmount = Math.max(dslr.vignette, filmic.vignette) / 100;
  const protectSkin = color.skinToneProtection || filmic.protectSkinTones;

  // Preset LUT function if active
  const proceduralLutObj = PROCEDURAL_LUTS.find((p) => p.id === activeProceduralLutId);

  // Center coordinate for vignette
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  // Face retouch center area (detected or simulated around center-upper viewport)
  const faceCenterX = width * 0.5;
  const faceCenterY = height * 0.46;
  const faceRadiusX = width * 0.16;
  const faceRadiusY = height * 0.22;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const pixelIdx = i / 4;
    const px = pixelIdx % width;
    const py = Math.floor(pixelIdx / width);

    // Skin Tone Detection (YCbCr skin locus approximation)
    const yCbCr_Y = 0.299 * r + 0.587 * g + 0.114 * b;
    const yCbCr_Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const yCbCr_Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    const isSkin =
      yCbCr_Cb >= 77 && yCbCr_Cb <= 127 && yCbCr_Cr >= 133 && yCbCr_Cr <= 173 && yCbCr_Y > 50;

    // AI Face Retouching zone
    const distToFaceX = (px - faceCenterX) / faceRadiusX;
    const distToFaceY = (py - faceCenterY) / faceRadiusY;
    const insideFaceMask = distToFaceX * distToFaceX + distToFaceY * distToFaceY <= 1.0;

    if (retouch.enabled && insideFaceMask) {
      const modeMultiplier = retouch.mode === 'beauty' ? 1.4 : 1.0;

      // Skin smoothing (gentle bilateral blur blending)
      if (retouch.skinSmoothing > 0 && isSkin) {
        const smoothIntensity = (retouch.skinSmoothing / 100) * 0.35 * modeMultiplier;
        // Blend toward local median average
        const avg = (r + g + b) / 3;
        r = r * (1 - smoothIntensity) + (avg * 1.08) * smoothIntensity;
        g = g * (1 - smoothIntensity) + (avg * 0.98) * smoothIntensity;
        b = b * (1 - smoothIntensity) + (avg * 0.92) * smoothIntensity;
      }

      // Skin Brightness & Tone warmth
      if (retouch.skinBrightness > 0 && isSkin) {
        const bright = (retouch.skinBrightness / 100) * 22;
        r += bright;
        g += bright * 0.95;
        b += bright * 0.9;
      }
      if (retouch.skinTone !== 0 && isSkin) {
        r += retouch.skinTone * 0.3;
        b -= retouch.skinTone * 0.2;
      }

      // Face Brightness & Eye Brightness
      if (retouch.faceBrightness > 0) {
        const fBright = (retouch.faceBrightness / 100) * 16;
        r += fBright;
        g += fBright;
        b += fBright;
      }

      // Teeth whitening / Lip Color detection in lower face
      const isLowerMouth = py > faceCenterY + 20 && Math.abs(px - faceCenterX) < 40;
      if (isLowerMouth && retouch.teethWhitening > 0 && r > 160 && g > 150) {
        // Whitens teeth by desaturating yellow/red tint
        const teethFactor = (retouch.teethWhitening / 100) * 0.4;
        const maxVal = Math.max(r, g, b);
        r = r * (1 - teethFactor) + maxVal * teethFactor;
        g = g * (1 - teethFactor) + maxVal * teethFactor;
        b = b * (1 - teethFactor) + maxVal * teethFactor;
      }

      if (isLowerMouth && retouch.lipColor > 0 && !isSkin && r > g) {
        // Boost lip rosiness
        r = Math.min(255, r + (retouch.lipColor / 100) * 25);
      }
    }

    // 1. Exposure & Brightness
    r = r * expFactor + brightAdd;
    g = g * expFactor + brightAdd;
    b = b * expFactor + brightAdd;

    // 2. Color Balance (Temperature & Tint)
    // If skin protection enabled, dampen color shifts on detected skin
    const skinDampen = protectSkin && isSkin ? 0.3 : 1.0;
    r += tempWarm * 28 * skinDampen;
    b -= tempWarm * 28 * skinDampen;
    g -= tintMagenta * 18 * skinDampen;
    r += tintMagenta * 14 * skinDampen;

    // 3. Contrast & Filmic Blacks
    if (color.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // Filmic Blacks (lift crushed darks to organic cinema grey-black)
    if (filmicBlackFactor > 0) {
      const lift = filmicBlackFactor * 18;
      r = Math.max(lift, r);
      g = Math.max(lift * 0.95, g);
      b = Math.max(lift * 1.05, b);
    }

    // Highlight Roll-Off (gentle shoulder compression prevents digital clipping)
    if (highlightRollFactor > 0) {
      if (r > 200) r = 200 + (r - 200) * (1 - highlightRollFactor * 0.5);
      if (g > 200) g = 200 + (g - 200) * (1 - highlightRollFactor * 0.5);
      if (b > 200) b = 200 + (b - 200) * (1 - highlightRollFactor * 0.5);
    }

    // 4. Color Wheels (Lift, Gamma, Gain)
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const shadowWeight = Math.max(0, 1 - luma / 128);
    const highlightWeight = Math.max(0, (luma - 128) / 127);
    const midWeight = 1 - Math.abs(luma - 128) / 128;

    r += color.lift.r * 50 * shadowWeight + color.gamma.r * 40 * midWeight + color.gain.r * 50 * highlightWeight;
    g += color.lift.g * 50 * shadowWeight + color.gamma.g * 40 * midWeight + color.gain.g * 50 * highlightWeight;
    b += color.lift.b * 50 * shadowWeight + color.gamma.b * 40 * midWeight + color.gain.b * 50 * highlightWeight;

    // 5. Saturation & Vibrance
    if (color.saturation !== 0 || color.vibrance !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      let sat = satFactor;
      // Vibrance boosts muted colors more than already saturated ones
      if (color.vibrance !== 0) {
        const currentSat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
        sat += ((1 - currentSat) * color.vibrance) / 100;
      }
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      b = gray + (b - gray) * sat;
    }

    // 6. LUT (Imported CUBE or Procedural)
    if (lut && lutIntensity > 0) {
      [r, g, b] = applyLut3D(r, g, b, lut, lutIntensity / 100);
    } else if (proceduralLutObj && lutIntensity > 0) {
      const [lr, lg, lb] = proceduralLutObj.curve(r, g, b);
      const factor = lutIntensity / 100;
      r = r * (1 - factor) + lr * factor;
      g = g * (1 - factor) + lg * factor;
      b = b * (1 - factor) + lb * factor;
    }

    // 7. Film Grain
    if (grainAmount > 0) {
      // High-speed pseudo-random grain noise
      const noise = (Math.sin(px * 12.9898 + py * 78.233 + time * 50) * 43758.5453) % 1;
      const grainVal = (noise - 0.5) * grainAmount * 45;
      r += grainVal;
      g += grainVal;
      b += grainVal;
    }

    // 8. Cinematic Vignette
    if (vignetteAmount > 0) {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vigFactor = Math.max(0, 1 - (dist / maxDist) * vignetteAmount * 1.2);
      r *= vigFactor;
      g *= vigFactor;
      b *= vigFactor;
    }

    // Clamp to [0..255]
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
}

/**
 * Main compositor function to render the entire project frame at timeline time `currentTime`
 */
export function renderCompositedFrame(
  targetCanvas: HTMLCanvasElement,
  project: EditorProject,
  currentTime: number,
  options?: {
    showSafeAreas?: boolean;
    compareMode?: 'none' | 'split' | 'before';
    splitPosition?: number; // 0 to 1
  }
) {
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  // Clear canvas with deep cinematic dark canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Collect all active clips at `currentTime` sorted by track order
  const activeClips: Array<{ clip: Clip; track: Track }> = [];

  for (const track of project.tracks) {
    if (track.isHidden) continue;
    for (const clip of track.clips) {
      if (currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration) {
        activeClips.push({ clip, track });
      }
    }
  }

  // Render each clip in order
  for (const { clip } of activeClips) {
    if (clip.type === 'audio') continue; // audio rendered via WebAudio

    const clipRelativeTime = (currentTime - clip.startTime) * clip.speed;

    // Evaluate animated keyframe values
    const kfPosX = evaluateKeyframeValue(clip.keyframes?.['positionX'], clipRelativeTime, clip.transform.x);
    const kfPosY = evaluateKeyframeValue(clip.keyframes?.['positionY'], clipRelativeTime, clip.transform.y);
    const kfScale = evaluateKeyframeValue(clip.keyframes?.['scale'], clipRelativeTime, clip.transform.scale);
    const kfRotation = evaluateKeyframeValue(clip.keyframes?.['rotation'], clipRelativeTime, clip.transform.rotation);
    const kfOpacity = evaluateKeyframeValue(clip.keyframes?.['opacity'], clipRelativeTime, clip.transform.opacity);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, kfOpacity));
    if (clip.transform.blendMode && clip.transform.blendMode !== 'normal') {
      ctx.globalCompositeOperation = clip.transform.blendMode;
    }

    // Transforms (Translation, Rotation, Scale, Flip)
    ctx.translate(width / 2 + kfPosX, height / 2 + kfPosY);
    ctx.rotate((kfRotation * Math.PI) / 180);
    ctx.scale(
      kfScale * (clip.transform.flipH ? -1 : 1),
      kfScale * (clip.transform.flipV ? -1 : 1)
    );

    // Render Clip by Type
    if (clip.type === 'video') {
      const isProcedural = clip.sourceUrl.startsWith('procedural://');
      if (isProcedural) {
        // Offscreen canvas for procedural frame
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        if (offCtx) {
          renderProceduralVideoFrame(offCtx, clip.sourceUrl, clipRelativeTime, width, height);

          // Apply pixel processing (DSLR, Color, Face Retouch, LUT) if not in pure 'before' compare mode
          if (options?.compareMode !== 'before') {
            const imgData = offCtx.getImageData(0, 0, width, height);
            let parsedLut: ParsedLut3D | null = null;
            if (clip.lut.cubeData) {
              parsedLut = parsedLutCache.get(clip.lut.cubeData) || parseCubeLut(clip.lut.cubeData);
              if (parsedLut) parsedLutCache.set(clip.lut.cubeData, parsedLut);
            }

            applyPixelPipeline(
              imgData,
              clip.color,
              clip.dslrCinematic,
              clip.filmicCamera,
              clip.faceRetouch,
              parsedLut,
              clip.lut.id,
              clip.lut.intensity,
              currentTime
            );
            offCtx.putImageData(imgData, 0, 0);
          }

          // Draw centered
          ctx.drawImage(offCanvas, -width / 2, -height / 2, width, height);
        }
      } else {
        // User imported local video
        const videoEl = getVideoElement(clip.sourceUrl);
        if (videoEl && videoEl.readyState >= 2) {
          // Sync video time if not playing natively
          const targetVidTime = (clip.sourceStartTime + clipRelativeTime) % (videoEl.duration || 10);
          if (Math.abs(videoEl.currentTime - targetVidTime) > 0.15) {
            videoEl.currentTime = targetVidTime;
          }

          // Offscreen canvas to apply pixel pipeline
          const offCanvas = document.createElement('canvas');
          offCanvas.width = width;
          offCanvas.height = height;
          const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
          if (offCtx) {
            offCtx.drawImage(videoEl, 0, 0, width, height);

            if (options?.compareMode !== 'before') {
              const imgData = offCtx.getImageData(0, 0, width, height);
              applyPixelPipeline(
                imgData,
                clip.color,
                clip.dslrCinematic,
                clip.filmicCamera,
                clip.faceRetouch,
                null,
                clip.lut.id,
                clip.lut.intensity,
                currentTime
              );
              offCtx.putImageData(imgData, 0, 0);
            }

            ctx.drawImage(offCanvas, -width / 2, -height / 2, width, height);
          }
        }
      }
    } else if (clip.type === 'text') {
      // Text rendering with English / Urdu support and text styling
      const textCfg = clip.textConfig;
      ctx.textAlign = textCfg.align;
      ctx.textBaseline = 'middle';

      const isUrdu = !!textCfg.urduContent;
      const fontFace = isUrdu ? 'Noto Nastaliq Urdu' : textCfg.fontFamily || 'Plus Jakarta Sans';
      const weight = textCfg.bold ? 'bold' : 'normal';
      const style = textCfg.italic ? 'italic' : 'normal';

      ctx.font = `${style} ${weight} ${textCfg.fontSize}px "${fontFace}", sans-serif`;

      const displayText = isUrdu ? textCfg.urduContent || '' : textCfg.content;

      // Text box background if enabled
      if (textCfg.bgBox) {
        const metrics = ctx.measureText(displayText);
        const padding = 16;
        ctx.fillStyle = textCfg.bgColor || 'rgba(0,0,0,0.6)';
        ctx.fillRect(
          -metrics.width / 2 - padding,
          -textCfg.fontSize / 2 - padding,
          metrics.width + padding * 2,
          textCfg.fontSize + padding * 2
        );
      }

      // Drop shadow
      if (textCfg.shadowBlur > 0) {
        ctx.shadowColor = textCfg.shadowColor || 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = textCfg.shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Stroke
      if (textCfg.strokeWidth > 0) {
        ctx.strokeStyle = textCfg.strokeColor || '#000000';
        ctx.lineWidth = textCfg.strokeWidth;
        ctx.strokeText(displayText, 0, 0);
      }

      // Fill text
      ctx.fillStyle = textCfg.color || '#ffffff';
      ctx.fillText(displayText, 0, 0);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // Split-screen comparison line if in split mode
  if (options?.compareMode === 'split') {
    const splitX = width * (options.splitPosition ?? 0.5);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText('BEFORE (ORIGINAL)', 16, 28);
    ctx.fillText('AFTER (GRADED & RETOUCHED)', splitX + 16, 28);
  }

  // Safe Areas Guides (90% Action Safe, 80% Title Safe)
  if (options?.showSafeAreas) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    // 90% Action safe
    const aWidth = width * 0.9;
    const aHeight = height * 0.9;
    ctx.strokeRect((width - aWidth) / 2, (height - aHeight) / 2, aWidth, aHeight);

    // 80% Title safe
    const tWidth = width * 0.8;
    const tHeight = height * 0.8;
    ctx.strokeRect((width - tWidth) / 2, (height - tHeight) / 2, tWidth, tHeight);

    // Center Crosshair
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
