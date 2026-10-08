/**
 * CineFlow Studio - Real Offline Video Rendering & Export Pipeline
 * Renders multi-track timeline frame-by-frame with MediaRecorder / Canvas Stream
 */

import { EditorProject } from '../types/editor';
import { renderCompositedFrame } from './videoCompositor';

export interface ExportSettings {
  filename: string;
  format: 'mp4' | 'webm' | 'mov';
  resolutionPreset: '720p' | '1080p' | '1440p' | '4k';
  width: number;
  height: number;
  fps: number;
  bitrateMbps: number;
  audioCodec: 'aac' | 'wav';
}

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  currentTimeSeconds: number;
  fpsRenderRate: number;
  estimatedSecondsRemaining: number;
  status: 'rendering' | 'encoding' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

export class OfflineVideoRenderer {
  private isCancelled = false;

  cancel() {
    this.isCancelled = true;
  }

  async renderProject(
    project: EditorProject,
    settings: ExportSettings,
    onProgress: (progress: RenderProgress) => void
  ): Promise<Blob | null> {
    this.isCancelled = false;

    // Create render canvas at target resolution
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;

    const totalSeconds = project.settings.duration;
    const totalFrames = Math.max(1, Math.floor(totalSeconds * settings.fps));
    const frameInterval = 1 / settings.fps;

    // Determine supported mime type
    let mimeType = 'video/webm;codecs=vp9';
    if (settings.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')) {
      mimeType = 'video/mp4;codecs=avc1.42E01E';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      mimeType = 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    const stream = canvas.captureStream(settings.fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : '',
      videoBitsPerSecond: settings.bitrateMbps * 1000 * 1000,
    });

    const recordedChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.start();

    const startTime = performance.now();

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        mediaRecorder.stop();
        return null;
      }

      const currentTime = frameIndex * frameInterval;

      // Render composited frame at time
      renderCompositedFrame(canvas, project, currentTime, {
        showSafeAreas: false,
        compareMode: 'none',
      });

      // Update progress
      const elapsed = (performance.now() - startTime) / 1000;
      const progressRatio = (frameIndex + 1) / totalFrames;
      const fpsRate = elapsed > 0 ? (frameIndex + 1) / elapsed : 30;
      const remainingFrames = totalFrames - (frameIndex + 1);
      const estRemaining = fpsRate > 0 ? remainingFrames / fpsRate : 0;

      onProgress({
        currentFrame: frameIndex + 1,
        totalFrames,
        percentage: Math.min(99, Math.round(progressRatio * 100)),
        currentTimeSeconds: currentTime,
        fpsRenderRate: Math.round(fpsRate),
        estimatedSecondsRemaining: Math.ceil(estRemaining),
        status: 'rendering',
      });

      // Yield event loop slightly for UI responsiveness
      await new Promise((resolve) => setTimeout(resolve, 8));
    }

    onProgress({
      currentFrame: totalFrames,
      totalFrames,
      percentage: 99,
      currentTimeSeconds: totalSeconds,
      fpsRenderRate: settings.fps,
      estimatedSecondsRemaining: 0,
      status: 'encoding',
    });

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const outputBlob = new Blob(recordedChunks, {
          type: settings.format === 'mp4' ? 'video/mp4' : 'video/webm',
        });
        onProgress({
          currentFrame: totalFrames,
          totalFrames,
          percentage: 100,
          currentTimeSeconds: totalSeconds,
          fpsRenderRate: settings.fps,
          estimatedSecondsRemaining: 0,
          status: 'completed',
        });
        resolve(outputBlob);
      };

      mediaRecorder.stop();
    });
  }
}
