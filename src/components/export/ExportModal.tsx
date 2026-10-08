/**
 * CineFlow Studio - Professional Video Export Window
 * Multi-format rendering (MP4, MOV, WebM), 720p to 4K resolutions, custom FPS & bitrates,
 * live rendering progress, and instant local file download.
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Film,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { OfflineVideoRenderer, ExportSettings, RenderProgress } from '../../services/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useEditor();

  const [filename, setFilename] = useState(
    `${project.settings.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Master`
  );
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mov'>('mp4');
  const [resolutionPreset, setResolutionPreset] = useState<'720p' | '1080p' | '1440p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [bitrateLevel, setBitrateLevel] = useState<'low' | 'med' | 'high' | 'pro'>('high');
  const [audioCodec, setAudioCodec] = useState<'aac' | 'wav'>('aac');

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const rendererRef = useRef<OfflineVideoRenderer | null>(null);

  if (!isOpen) return null;

  const getDimensions = (): { width: number; height: number } => {
    const isVertical = project.settings.aspectRatio === '9:16';
    const isSquare = project.settings.aspectRatio === '1:1';
    const isCinema = project.settings.aspectRatio === '21:9';

    if (resolutionPreset === '720p') {
      return isVertical ? { width: 720, height: 1280 } : isSquare ? { width: 720, height: 720 } : { width: 1280, height: 720 };
    }
    if (resolutionPreset === '1440p') {
      return isVertical ? { width: 1440, height: 2560 } : isSquare ? { width: 1440, height: 1440 } : { width: 2560, height: 1440 };
    }
    if (resolutionPreset === '4k') {
      return isVertical ? { width: 2160, height: 3840 } : isSquare ? { width: 2160, height: 2160 } : { width: 3840, height: 2160 };
    }
    // 1080p
    return isVertical ? { width: 1080, height: 1920 } : isSquare ? { width: 1080, height: 1080 } : isCinema ? { width: 2560, height: 1080 } : { width: 1920, height: 1080 };
  };

  const getBitrateMbps = (): number => {
    if (bitrateLevel === 'low') return 8;
    if (bitrateLevel === 'med') return 16;
    if (bitrateLevel === 'high') return 32;
    return 60; // Pro ProRes/Cinema bitrate
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadUrl(null);
    setProgress({
      currentFrame: 0,
      totalFrames: Math.floor(project.settings.duration * fps),
      percentage: 0,
      currentTimeSeconds: 0,
      fpsRenderRate: 0,
      estimatedSecondsRemaining: 0,
      status: 'rendering',
    });

    const { width, height } = getDimensions();
    const exportSettings: ExportSettings = {
      filename,
      format,
      resolutionPreset,
      width,
      height,
      fps,
      bitrateMbps: getBitrateMbps(),
      audioCodec,
    };

    const renderer = new OfflineVideoRenderer();
    rendererRef.current = renderer;

    try {
      const blob = await renderer.renderProject(project, exportSettings, (prog) => {
        setProgress(prog);
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.${format === 'mov' ? 'mov' : format === 'mp4' ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export error', err);
      setProgress((prev) => (prev ? { ...prev, status: 'error', error: 'Render interrupted' } : null));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (rendererRef.current) {
      rendererRef.current.cancel();
    }
    setIsExporting(false);
    setProgress(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#111319] border border-[#232838] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-12 bg-[#0e1015] border-b border-[#1f2433] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-white">Export Video Master</h2>
          </div>
          {!isExporting && (
            <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-neutral-300">
          {!isExporting && !downloadUrl ? (
            <>
              {/* File Name */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-medium">Export File Name</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full bg-[#161a24] border border-[#262c3d] rounded px-3 py-2 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Format & Codec */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-medium">Container Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'mp4' | 'webm' | 'mov')}
                    className="w-full bg-[#161a24] border border-[#262c3d] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="mp4">MP4 (H.264 Universal)</option>
                    <option value="webm">WebM (VP9 High Quality)</option>
                    <option value="mov">QuickTime MOV</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-medium">Resolution</label>
                  <select
                    value={resolutionPreset}
                    onChange={(e) => setResolutionPreset(e.target.value as '720p' | '1080p' | '1440p' | '4k')}
                    className="w-full bg-[#161a24] border border-[#262c3d] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="720p">720p HD (Fast Draft)</option>
                    <option value="1080p">1080p Full HD (Recommended)</option>
                    <option value="1440p">1440p 2K QHD</option>
                    <option value="4k">2160p 4K Ultra HD</option>
                  </select>
                </div>
              </div>

              {/* Frame Rate & Bitrate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-medium">Frame Rate (FPS)</label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value, 10))}
                    className="w-full bg-[#161a24] border border-[#262c3d] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="24">24 FPS (Cinematic standard)</option>
                    <option value="25">25 FPS (PAL Broadcast)</option>
                    <option value="30">30 FPS (Online & Social)</option>
                    <option value="60">60 FPS (Ultra Smooth Motion)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-medium">Target Bitrate</label>
                  <select
                    value={bitrateLevel}
                    onChange={(e) => setBitrateLevel(e.target.value as 'low' | 'med' | 'high' | 'pro')}
                    className="w-full bg-[#161a24] border border-[#262c3d] rounded px-3 py-2 text-white outline-none cursor-pointer"
                  >
                    <option value="low">Low (8 Mbps - Compact)</option>
                    <option value="med">Medium (16 Mbps - Social)</option>
                    <option value="high">High (32 Mbps - Studio Master)</option>
                    <option value="pro">Pro Cinema (60 Mbps - Lossless)</option>
                  </select>
                </div>
              </div>

              {/* Offline Render Notice */}
              <div className="p-3 bg-[#141722] rounded-lg border border-[#232b3d] flex items-start gap-2.5 text-[11px] text-neutral-400">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Offline Rendering:</strong> CineFlow Studio renders your project locally using hardware acceleration. No files are uploaded to any external server.
                </span>
              </div>
            </>
          ) : isExporting ? (
            /* Render Progress View */
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-sm">Rendering Video...</h3>
                  <p className="text-[11px] text-neutral-400">
                    Frame {progress?.currentFrame} of {progress?.totalFrames} ({progress?.fpsRenderRate} FPS)
                  </p>
                </div>
                <span className="font-mono-numbers text-xl font-bold text-amber-400">
                  {progress?.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#181c26] rounded-full overflow-hidden border border-[#262d3e]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100"
                  style={{ width: `${progress?.percentage || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Est. remaining: ~{progress?.estimatedSecondsRemaining}s</span>
                </div>
                <span>Status: {progress?.status === 'encoding' ? 'Finalizing audio & muxing...' : 'Rendering frames'}</span>
              </div>
            </div>
          ) : (
            /* Render Complete View */
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white text-base">Export Completed Successfully!</h3>
              <p className="text-neutral-400 text-xs">
                Your video file was rendered locally and downloaded to your computer.
              </p>
              {downloadUrl && (
                <div className="pt-2">
                  <a
                    href={downloadUrl}
                    download={`${filename}.${format}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Again</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 bg-[#0e1015] border-t border-[#1f2433] px-5 flex items-center justify-between">
          {isExporting ? (
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 bg-[#1a1e28] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded border border-[#2d3448] transition-colors"
            >
              Cancel Render
            </button>
          ) : downloadUrl ? (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1a1e28] hover:bg-[#252a39] text-white rounded border border-[#2d3448] ml-auto transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleStartExport}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Render & Export Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
