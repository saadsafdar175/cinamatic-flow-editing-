/**
 * CineFlow Studio - Offline Media Generator & Sample Clips
 * Creates offline-ready video and audio clips and handles user file imports
 */

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  duration: number; // in seconds
  thumbnailUrl: string;
  sourceUrl: string;
  resolution?: string;
  fps?: number;
  fileSize?: string;
  category: 'Cinematic' | 'Portrait' | 'Action' | 'Audio' | 'User';
}

/**
 * Procedural generator for realistic video thumbnail and video canvas frame
 */
function createProceduralVideoThumbnail(
  theme: 'golden_hour' | 'portrait_face' | 'cyberpunk' | 'mountain_drone'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  if (theme === 'golden_hour') {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.4, '#ea580c');
    sky.addColorStop(0.7, '#fbbf24');
    sky.addColorStop(1, '#1e293b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Glowing sun
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.45, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#fffbeb';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ocean horizon
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Sun reflection
    const refl = ctx.createLinearGradient(w * 0.7, h * 0.65, w * 0.7, h);
    refl.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    refl.addColorStop(1, 'rgba(251, 191, 36, 0.05)');
    ctx.fillStyle = refl;
    ctx.fillRect(w * 0.6, h * 0.65, w * 0.2, h * 0.35);
  } else if (theme === 'portrait_face') {
    // Cinematic dark background with warm rim light
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, w, h);

    // Soft studio rim light gradient
    const rim = ctx.createRadialGradient(w * 0.75, h * 0.3, 10, w * 0.75, h * 0.3, 140);
    rim.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    rim.addColorStop(1, 'transparent');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, w, h);

    // Face silhouette & features for AI Face Retouch testing
    // Head / Face oval
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.45, 46, 60, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d99879'; // warm skin tone
    ctx.fill();

    // Neck
    ctx.fillStyle = '#c08064';
    ctx.fillRect(w * 0.44, h * 0.72, w * 0.12, h * 0.28);

    // Eyes
    ctx.fillStyle = '#3a2e2b';
    ctx.beginPath();
    ctx.ellipse(w * 0.43, h * 0.42, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.57, h * 0.42, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lips
    ctx.fillStyle = '#b94d58';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.6, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#2b1d19';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.37);
    ctx.quadraticCurveTo(w * 0.43, h * 0.35, w * 0.47, h * 0.38);
    ctx.moveTo(w * 0.53, h * 0.38);
    ctx.quadraticCurveTo(w * 0.57, h * 0.35, w * 0.62, h * 0.37);
    ctx.stroke();

    // Soft hair
    ctx.fillStyle = '#1c1514';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.35, 52, Math.PI, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'cyberpunk') {
    // Neon city night
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, w, h);

    // Skyscraper silhouettes
    ctx.fillStyle = '#0a0f1d';
    for (let x = 10; x < w; x += 35) {
      const bHeight = 50 + (x % 70) * 1.5;
      ctx.fillRect(x, h - bHeight, 28, bHeight);
    }

    // Cyan & Magenta light flares
    const cyanGrad = ctx.createRadialGradient(w * 0.2, h * 0.6, 5, w * 0.2, h * 0.6, 90);
    cyanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
    cyanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cyanGrad;
    ctx.fillRect(0, 0, w, h);

    const magGrad = ctx.createRadialGradient(w * 0.8, h * 0.5, 5, w * 0.8, h * 0.5, 110);
    magGrad.addColorStop(0, 'rgba(236, 72, 153, 0.6)');
    magGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = magGrad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Mountain Drone
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Mountain peaks
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.35, h * 0.3);
    ctx.lineTo(w * 0.6, h * 0.7);
    ctx.lineTo(w * 0.85, h * 0.25);
    ctx.lineTo(w, h);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.3);
    ctx.lineTo(w * 0.29, h * 0.42);
    ctx.lineTo(w * 0.41, h * 0.42);
    ctx.fill();
  }

  // Cinematic 2.39:1 / border overlay
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CINEMATIC 4K', 12, 24);

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Creates audio waveform thumbnail representation
 */
function createAudioWaveformThumbnail(type: 'speech' | 'music' | 'sfx'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#101319';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const color = type === 'speech' ? '#10b981' : type === 'music' ? '#8b5cf6' : '#f59e0b';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const mid = canvas.height / 2;
  const count = 60;
  const step = canvas.width / count;

  for (let i = 0; i < count; i++) {
    const x = i * step + 2;
    const heightFactor =
      type === 'speech'
        ? Math.abs(Math.sin(i * 0.4) * Math.cos(i * 0.8)) * 50 + (i % 5 === 0 ? 5 : 20)
        : Math.abs(Math.sin(i * 0.2)) * 60 + 10;

    ctx.fillStyle = color;
    ctx.fillRect(x, mid - heightFactor / 2, 3, heightFactor);
  }

  return canvas.toDataURL('image/png');
}

/**
 * High-definition sample assets included locally with CineFlow Studio
 */
export const INITIAL_SAMPLE_MEDIA: MediaAsset[] = [
  {
    id: 'media_sample_golden_hour',
    name: 'DSLR_Golden_Hour_Beach_4K.mp4',
    type: 'video',
    duration: 12.0,
    thumbnailUrl: createProceduralVideoThumbnail('golden_hour'),
    sourceUrl: 'procedural://golden_hour',
    resolution: '3840x2160',
    fps: 60,
    fileSize: '48.2 MB',
    category: 'Cinematic',
  },
  {
    id: 'media_sample_portrait_actor',
    name: 'Cinema_Portrait_Actor_Face_Retouch.mp4',
    type: 'video',
    duration: 10.0,
    thumbnailUrl: createProceduralVideoThumbnail('portrait_face'),
    sourceUrl: 'procedural://portrait_face',
    resolution: '1920x1080',
    fps: 30,
    fileSize: '31.5 MB',
    category: 'Portrait',
  },
  {
    id: 'media_sample_cyberpunk',
    name: 'Neon_Tokyo_Night_Bloom.mp4',
    type: 'video',
    duration: 15.0,
    thumbnailUrl: createProceduralVideoThumbnail('cyberpunk'),
    sourceUrl: 'procedural://cyberpunk',
    resolution: '3840x2160',
    fps: 24,
    fileSize: '62.0 MB',
    category: 'Cinematic',
  },
  {
    id: 'media_sample_drone',
    name: 'Alpine_Drone_SlowMo_60FPS.mp4',
    type: 'video',
    duration: 14.0,
    thumbnailUrl: createProceduralVideoThumbnail('mountain_drone'),
    sourceUrl: 'procedural://mountain_drone',
    resolution: '3840x2160',
    fps: 60,
    fileSize: '54.7 MB',
    category: 'Action',
  },
  {
    id: 'media_sample_speech',
    name: 'Studio_Voice_Dialogue_Clean.wav',
    type: 'audio',
    duration: 8.5,
    thumbnailUrl: createAudioWaveformThumbnail('speech'),
    sourceUrl: 'procedural_audio://speech',
    fileSize: '4.8 MB',
    category: 'Audio',
  },
  {
    id: 'media_sample_soundtrack',
    name: 'Cinematic_Film_Score_Orchestral.mp3',
    type: 'audio',
    duration: 22.0,
    thumbnailUrl: createAudioWaveformThumbnail('music'),
    sourceUrl: 'procedural_audio://music',
    fileSize: '12.3 MB',
    category: 'Audio',
  },
  {
    id: 'media_sample_sfx_impact',
    name: 'Cinematic_Sub_Impact_Whoosh.wav',
    type: 'audio',
    duration: 3.2,
    thumbnailUrl: createAudioWaveformThumbnail('sfx'),
    sourceUrl: 'procedural_audio://sfx',
    fileSize: '1.2 MB',
    category: 'Audio',
  },
];

/**
 * Handles local user file selection (video, image, audio) and extracts metadata
 */
export async function processUserMediaFile(file: File): Promise<MediaAsset> {
  const isVideo = file.type.startsWith('video');
  const isAudio = file.type.startsWith('audio');
  const isImage = file.type.startsWith('image');

  const fileUrl = URL.createObjectURL(file);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  let duration = 5.0; // default for images
  let resolution = '1920x1080';
  let thumbnailUrl = '';

  if (isVideo) {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        duration = Math.max(0.5, video.duration || 5.0);
        resolution = `${video.videoWidth || 1920}x${video.videoHeight || 1080}`;
        // Seek to 0.5s or start to grab thumbnail
        video.currentTime = Math.min(0.5, duration / 2);
      };
      video.onseeked = () => {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 180;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, c.width, c.height);
          thumbnailUrl = c.toDataURL('image/jpeg', 0.8);
        }
        resolve();
      };
      video.onerror = () => {
        thumbnailUrl = createProceduralVideoThumbnail('golden_hour');
        resolve();
      };
      // fallback timeout
      setTimeout(() => resolve(), 2500);
    });
  } else if (isAudio) {
    const audio = new Audio(fileUrl);
    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => {
        duration = Math.max(0.5, audio.duration || 10.0);
        resolve();
      };
      audio.onerror = () => resolve();
      setTimeout(() => resolve(), 2000);
    });
    thumbnailUrl = createAudioWaveformThumbnail('music');
  } else if (isImage) {
    thumbnailUrl = fileUrl;
    duration = 5.0;
  }

  return {
    id: `user_media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
    duration,
    thumbnailUrl: thumbnailUrl || createProceduralVideoThumbnail('golden_hour'),
    sourceUrl: fileUrl,
    resolution,
    fps: 30,
    fileSize: sizeMB,
    category: 'User',
  };
}
