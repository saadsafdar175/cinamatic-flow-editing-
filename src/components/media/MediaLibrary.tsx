/**
 * CineFlow Studio - Media Library
 * Offline media drawer: User file import, sample clips, drag-and-drop to timeline
 */

import React, { useState } from 'react';
import {
  Upload,
  Film,
  Music,
  Image as ImageIcon,
  Plus,
  Play,
  HardDrive,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { MediaAsset } from '../../services/sampleMedia';
import { formatTimeSeconds } from '../../utils/timecode';

export const MediaLibrary: React.FC = () => {
  const { mediaAssets, addClipToTrack, selectedTrackId, importMediaFiles } = useEditor();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Video' | 'Audio' | 'User'>('All');
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);

  const filteredAssets = mediaAssets.filter((asset) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Video') return asset.type === 'video' || asset.type === 'image';
    if (activeFilter === 'Audio') return asset.type === 'audio';
    if (activeFilter === 'User') return asset.category === 'User';
    return true;
  });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importMediaFiles(e.target.files);
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: MediaAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
  };

  const handleQuickAdd = (asset: MediaAsset) => {
    let targetTrack = selectedTrackId || 'track_vid_1';
    if (asset.type === 'audio') {
      targetTrack = 'track_music';
    }
    addClipToTrack(targetTrack, asset);
  };

  return (
    <div className="w-80 bg-[#101217] border-r border-[#1e222c] flex flex-col h-full select-none">
      {/* Top Header & Import Button */}
      <div className="p-3 border-b border-[#1c202a] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-neutral-200">Local Media Library</h2>
          </div>
          <span className="text-[10px] text-neutral-500">{filteredAssets.length} items</span>
        </div>

        {/* Local Import Dropzone Button */}
        <label className="flex items-center justify-center gap-2 py-2 px-3 bg-[#181c25] hover:bg-[#202533] border border-dashed border-[#2d3445] hover:border-amber-500/50 rounded-lg cursor-pointer transition-all text-xs font-medium text-neutral-300 hover:text-white group">
          <Upload className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span>Import Video / Audio / Image</span>
          <input
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#14171f] p-1 rounded-md border border-[#1e2330]">
          {(['All', 'Video', 'Audio', 'User'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                activeFilter === filter
                  ? 'bg-[#222735] text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start">
        {filteredAssets.map((asset) => {
          const isHovered = hoveredAssetId === asset.id;
          return (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              onMouseEnter={() => setHoveredAssetId(asset.id)}
              onMouseLeave={() => setHoveredAssetId(null)}
              className="group relative bg-[#151821] border border-[#202533] hover:border-amber-500/50 rounded-lg overflow-hidden flex flex-col transition-all cursor-grab active:cursor-grabbing hover:shadow-md"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-[#0a0c10] overflow-hidden">
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Duration Badge */}
                <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-neutral-300 font-mono-numbers px-1.5 py-0.5 rounded">
                  {formatTimeSeconds(asset.duration)}
                </div>

                {/* Media Type Icon */}
                <div className="absolute top-1 left-1 bg-black/70 p-1 rounded text-neutral-300">
                  {asset.type === 'video' ? (
                    <Film className="w-2.5 h-2.5" />
                  ) : asset.type === 'audio' ? (
                    <Music className="w-2.5 h-2.5 text-purple-400" />
                  ) : (
                    <ImageIcon className="w-2.5 h-2.5 text-blue-400" />
                  )}
                </div>

                {/* Quick Add Overlay Button */}
                {isHovered && (
                  <button
                    onClick={() => handleQuickAdd(asset)}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-1.5 text-white text-xs font-semibold hover:bg-black/60 transition-colors"
                    title="Add to timeline"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Asset Info */}
              <div className="p-1.5 flex flex-col">
                <span className="text-[11px] font-medium text-neutral-200 truncate" title={asset.name}>
                  {asset.name}
                </span>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono-numbers mt-0.5">
                  <span>{asset.resolution || 'Audio'}</span>
                  {asset.fileSize && <span>{asset.fileSize}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
