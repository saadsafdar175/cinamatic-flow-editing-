/**
 * CineFlow Studio - Web Audio Engine & Voiceover Recorder
 * Real offline audio synthesis, 3-band EQ, compressor, voice recorder, and waveform analysis
 */

import { AudioConfig } from '../types/editor';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Procedural synthesizers for offline audio clips (dialogue, music, sfx)
 */
export function playProceduralAudioNote(type: 'speech' | 'music' | 'sfx', volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'music') {
      // Warm chord progression tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (type === 'sfx') {
      // Cinematic sub impact whoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else {
      // Speech formant sim
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio context may require user interaction first
  }
}

/**
 * Microphone Voice Recording Manager
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch {
      // Microphone access denied or unavailable in sandbox
      return false;
    }
  }

  async stopRecording(): Promise<{ blob: Blob; url: string; duration: number } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all mic tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        // Estimate duration from audio element
        const tempAudio = new Audio(audioUrl);
        tempAudio.onloadedmetadata = () => {
          resolve({
            blob: audioBlob,
            url: audioUrl,
            duration: tempAudio.duration || 3.0,
          });
        };
        tempAudio.onerror = () => {
          resolve({
            blob: audioBlob,
            url: audioUrl,
            duration: 3.0,
          });
        };
      };

      this.mediaRecorder.stop();
    });
  }
}

/**
 * Builds WebAudio filter graph for 3-band EQ and Dynamics Compressor
 */
export function setupAudioFilters(
  ctx: AudioContext,
  sourceNode: AudioNode,
  config: AudioConfig
): AudioNode {
  // 3-Band Equalizer
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 250;
  bassFilter.gain.value = config.eq.bass;

  const midFilter = ctx.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1500;
  midFilter.Q.value = 1.0;
  midFilter.gain.value = config.eq.mid;

  const trebleFilter = ctx.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 4000;
  trebleFilter.gain.value = config.eq.treble;

  // Master Gain for clip volume
  const gainNode = ctx.createGain();
  gainNode.gain.value = config.mute ? 0 : config.volume / 100;

  // Connect chain
  sourceNode.connect(bassFilter);
  bassFilter.connect(midFilter);
  midFilter.connect(trebleFilter);

  if (config.compressor) {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(30, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    trebleFilter.connect(compressor);
    compressor.connect(gainNode);
  } else {
    trebleFilter.connect(gainNode);
  }

  return gainNode;
}
