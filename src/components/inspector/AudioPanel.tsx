/**
 * CineFlow Studio - Audio Editing & Voiceover Recording Inspector Panel
 * Volume, fade in/out, 3-band EQ, compressor, noise reduction, voice enhancement, pitch,
 * and live microphone voice recording directly to the timeline.
 */

import React, { useState } from 'react';
import {
  Music,
  Mic,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { AudioConfig } from '../../types/editor';
import { VoiceRecorder } from '../../services/audioEngine';
import { MediaAsset } from '../../services/sampleMedia';

const recorderInstance = new VoiceRecorder();

export const AudioPanel: React.FC = () => {
  const { selectedClip, updateClip, addClipToTrack, playhead } = useEditor();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  if (!selectedClip) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500">
        Select an audio or video clip to edit audio settings.
      </div>
    );
  }

  const { audio } = selectedClip;

  const handleChange = (key: keyof AudioConfig, val: unknown) => {
    updateClip(selectedClip.id, (c) => ({
      audio: {
        ...c.audio,
        [key]: val,
      },
    }));
  };

  const handleEqChange = (band: 'bass' | 'mid' | 'treble', val: number) => {
    updateClip(selectedClip.id, (c) => ({
      audio: {
        ...c.audio,
        eq: {
          ...c.audio.eq,
          [band]: val,
        },
      },
    }));
  };

  // Live microphone recording
  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop
      const result = await recorderInstance.stopRecording();
      setIsRecording(false);
      setRecordSeconds(0);

      if (result) {
        // Create voice clip and add to Voice Track
        const voiceAsset: MediaAsset = {
          id: `voice_rec_${Date.now()}`,
          name: `Voiceover_Take_${Math.floor(Date.now() / 1000)}.wav`,
          type: 'audio',
          duration: Math.max(1.0, result.duration),
          thumbnailUrl: '',
          sourceUrl: result.url,
          category: 'Audio',
        };
        addClipToTrack('track_voice', voiceAsset, playhead);
      }
    } else {
      // Start
      const started = await recorderInstance.startRecording();
      if (started) {
        setIsRecording(true);
        // Interval for seconds counter
        const interval = setInterval(() => {
          setRecordSeconds((prev) => prev + 1);
        }, 1000);
        // Clean up interval on stop
        setTimeout(() => clearInterval(interval), 60000);
      } else {
        alert('Could not access microphone. Please grant permission or check audio device.');
      }
    }
  };

  return (
    <div className="p-4 space-y-4 text-xs text-neutral-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2430]">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-neutral-100 text-sm">Audio & Sound FX</h3>
        </div>
      </div>

      {/* Voice Recorder Action Box */}
      <div className="p-3 bg-[#141720] rounded-lg border border-[#232938] flex items-center justify-between">
        <div>
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-rose-500" />
            <span>Voiceover Recorder</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">
            {isRecording ? `Recording... (${recordSeconds}s)` : 'Record live voice to Voice Track'}
          </div>
        </div>

        <button
          onClick={handleToggleVoiceRecording}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-all ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-[#1e2330] hover:bg-[#282f42] text-neutral-200 border border-[#2e374d]'
          }`}
        >
          {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
          <span>{isRecording ? 'Stop' : 'Record'}</span>
        </button>
      </div>

      {/* Volume & Mute */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-neutral-400 font-medium">Volume & Level</label>
          <div className="flex items-center gap-2">
            <span className="font-mono-numbers text-amber-400">{audio.volume}%</span>
            <button
              onClick={() => handleChange('mute', !audio.mute)}
              className={`p-1 rounded ${audio.mute ? 'text-rose-400' : 'text-neutral-400 hover:text-white'}`}
            >
              {audio.mute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={audio.volume}
          onChange={(e) => handleChange('volume', parseInt(e.target.value, 10))}
          className="w-full"
        />
      </div>

      {/* Fade In & Fade Out */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400 text-[11px]">Fade In</span>
            <span className="font-mono-numbers">{audio.fadeIn.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.2"
            value={audio.fadeIn}
            onChange={(e) => handleChange('fadeIn', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400 text-[11px]">Fade Out</span>
            <span className="font-mono-numbers">{audio.fadeOut.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.2"
            value={audio.fadeOut}
            onChange={(e) => handleChange('fadeOut', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* 3-Band Equalizer (Bass, Mid, Treble) */}
      <div className="space-y-2 pt-2 border-t border-[#1f2430]">
        <label className="text-neutral-300 font-medium flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>3-Band Studio Equalizer (dB)</span>
        </label>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div>
            <span className="text-neutral-400">Bass {audio.eq.bass}dB</span>
            <input
              type="range"
              min="-12"
              max="12"
              value={audio.eq.bass}
              onChange={(e) => handleEqChange('bass', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <span className="text-neutral-400">Mid {audio.eq.mid}dB</span>
            <input
              type="range"
              min="-12"
              max="12"
              value={audio.eq.mid}
              onChange={(e) => handleEqChange('mid', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <span className="text-neutral-400">Treble {audio.eq.treble}dB</span>
            <input
              type="range"
              min="-12"
              max="12"
              value={audio.eq.treble}
              onChange={(e) => handleEqChange('treble', parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Dynamics & Enhancements */}
      <div className="space-y-3 pt-2 border-t border-[#1f2430]">
        {/* Dynamics Compressor Toggle */}
        <div className="flex items-center justify-between p-2 rounded bg-[#131620] border border-[#202533]">
          <span className="text-neutral-200">Broadcast Dynamics Compressor</span>
          <input
            type="checkbox"
            checked={audio.compressor}
            onChange={(e) => handleChange('compressor', e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Noise Reduction */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Noise Reduction</span>
            <span className="font-mono-numbers text-neutral-200">{audio.noiseReduction}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={audio.noiseReduction}
            onChange={(e) => handleChange('noiseReduction', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Voice Enhancement */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Voice Presence Enhancement</span>
            </span>
            <span className="font-mono-numbers text-neutral-200">{audio.voiceEnhancement}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={audio.voiceEnhancement}
            onChange={(e) => handleChange('voiceEnhancement', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Pitch Shift */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-neutral-400">Pitch Shift</span>
            <span className="font-mono-numbers text-neutral-200">
              {audio.pitch > 0 ? `+${audio.pitch}` : audio.pitch} st
            </span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            value={audio.pitch}
            onChange={(e) => handleChange('pitch', parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
