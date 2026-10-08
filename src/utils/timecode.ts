/**
 * CineFlow Studio - Professional Timecode and Frame Utilities
 */

export function secondsToTimecode(seconds: number, fps = 30): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  
  const totalFrames = Math.floor(seconds * fps);
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(seconds);
  const secs = totalSeconds % 60;
  const mins = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');

  return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export function timecodeToSeconds(timecode: string, fps = 30): number {
  const parts = timecode.trim().split(':').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return 0;
  }
  const [hours, mins, secs, frames] = parts;
  return hours * 3600 + mins * 60 + secs + frames / fps;
}

export function formatTimeSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const ms = Math.floor((seconds % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
}

export function stepFrame(currentTime: number, step: number, fps = 30): number {
  const frameDuration = 1 / fps;
  const newTime = Math.max(0, currentTime + step * frameDuration);
  // snap to nearest exact frame boundary
  return Math.round(newTime * fps) / fps;
}
