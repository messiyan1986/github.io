import type { MetronomeConfig, TimeSignature, SubdivisionLevel, VoiceMode, Volumes } from '../types';
import { 
  getBeatsPerMeasure, 
  getSubdivisionDuration,
  getCountingSampleName,
  getTakadimiSampleName
} from '../utils/timeSignature';
import { SampleGenerator } from './SampleGenerator';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private clickGain: GainNode | null = null;
  private drumGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentBeat: number = 0;
  private schedulerTimer: number | null = null;
  private config: MetronomeConfig | null = null;
  private onBeatCallback: ((beat: number) => void) | null = null;
  private sampleGenerator: SampleGenerator | null = null;
  
  private voiceSamples: Map<string, AudioBuffer> = new Map();
  private clickSamples: Map<string, AudioBuffer> = new Map();
  private drumSamples: Map<string, AudioBuffer> = new Map();
  private isLoaded: boolean = false;

  async init(): Promise<void> {
    if (this.ctx) return;
    
    this.ctx = new AudioContext();
    this.sampleGenerator = new SampleGenerator(this.ctx);
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    this.voiceGain = this.ctx.createGain();
    this.clickGain = this.ctx.createGain();
    this.drumGain = this.ctx.createGain();
    
    this.voiceGain.connect(this.masterGain);
    this.clickGain.connect(this.masterGain);
    this.drumGain.connect(this.masterGain);
    
    if (!this.isLoaded) {
      await this.generateSamples();
    }
  }

  private async generateSamples(): Promise<void> {
    if (this.isLoaded || !this.sampleGenerator) return;
    
    const voiceFiles = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
      'e', 'and', 'a',
      'ta', 'ka', 'di', 'mi'
    ];
    
    this.clickSamples.set('click-high', this.sampleGenerator.generateClickSample(true));
    this.clickSamples.set('click-low', this.sampleGenerator.generateClickSample(false));
    
    this.drumSamples.set('kick', this.sampleGenerator.generateDrumSample('kick'));
    this.drumSamples.set('snare', this.sampleGenerator.generateDrumSample('snare'));
    this.drumSamples.set('hihat', this.sampleGenerator.generateDrumSample('hihat'));
    
    for (const name of voiceFiles) {
      this.voiceSamples.set(name, this.sampleGenerator.generateVoiceSample(name));
    }
    
    this.isLoaded = true;
  }

  onBeat(callback: (beat: number) => void) {
    this.onBeatCallback = callback;
  }

  start(config: MetronomeConfig): void {
    if (!this.ctx || this.isPlaying) return;
    
    this.config = config;
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx.currentTime;
    
    this.voiceGain!.gain.value = config.voiceGain;
    this.clickGain!.gain.value = config.clickGain;
    this.drumGain!.gain.value = config.drumGain;
    
    this.scheduler();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.currentBeat = 0;
    
    if (this.ctx) {
      this.ctx.suspend();
      this.ctx.resume();
    }
  }

  private scheduler(): void {
    const scheduleAhead = 0.1;
    const lookahead = 25;
    
    this.schedulerTimer = window.setInterval(() => {
      while (this.ctx && this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
        this.scheduleNote();
        this.advanceBeat();
      }
    }, lookahead);
  }

  private scheduleNote(): void {
    if (!this.config || !this.ctx) return;
    
    const { timeSignature, subdivisionLevel, volumes, voiceMode } = this.config;
    
    const subdivisionIndex = this.currentBeat % (subdivisionLevel === 'swing8' ? 3 : subdivisionLevel);
    const beatIndex = Math.floor(this.currentBeat / (subdivisionLevel === 'swing8' ? 3 : subdivisionLevel));
    
    if (this.onBeatCallback && subdivisionIndex === 0) {
      this.onBeatCallback(beatIndex % timeSignature.numerator);
    }
    
    if (this.config.voiceGain > 0) {
      this.playVoice(beatIndex, subdivisionIndex, subdivisionLevel, voiceMode, volumes.accent);
    }
    
    if (this.config.clickGain > 0) {
      this.playClick(subdivisionIndex, volumes);
    }
    
    if (this.config.drumGain > 0) {
      this.playDrum(subdivisionIndex, volumes);
    }
  }

  private playVoice(beatIndex: number, subdivisionIndex: number, subdivision: SubdivisionLevel, mode: VoiceMode, volume: number): void {
    if (!this.ctx) return;
    
    const sampleName = mode === 'counting' 
      ? getCountingSampleName(beatIndex, subdivisionIndex, subdivision)
      : getTakadimiSampleName(subdivisionIndex);
    
    if (!sampleName) return;
    
    const buffer = this.voiceSamples.get(sampleName);
    if (!buffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.voiceGain!);
    source.start(this.nextNoteTime);
  }

  private playClick(subdivisionIndex: number, volumes: Volumes): void {
    if (!this.ctx || subdivisionIndex !== 0) return;
    
    const buffer = this.clickSamples.get('click-high');
    if (!buffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volumes.accent;
    
    source.connect(gainNode);
    gainNode.connect(this.clickGain!);
    source.start(this.nextNoteTime);
  }

  private playDrum(subdivisionIndex: number, volumes: Volumes): void {
    if (!this.ctx) return;
    
    const sampleName = subdivisionIndex === 0 ? 'kick' : 'hihat';
    const buffer = this.drumSamples.get(sampleName);
    if (!buffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volumes.quarter;
    
    source.connect(gainNode);
    gainNode.connect(this.drumGain!);
    source.start(this.nextNoteTime);
  }

  private advanceBeat(): void {
    if (!this.config) return;
    
    const beatDuration = 60 / this.config.bpm;
    const subdivisionDuration = getSubdivisionDuration(beatDuration, this.config.subdivisionLevel);
    
    this.nextNoteTime += subdivisionDuration;
    this.currentBeat++;
    
    const beatsPerMeasure = getBeatsPerMeasure(this.config.timeSignature, this.config.subdivisionLevel);
    if (this.currentBeat >= beatsPerMeasure) {
      this.currentBeat = 0;
    }
  }

  setTempo(bpm: number): void {
    if (this.config) {
      this.config.bpm = bpm;
    }
  }

  setTimeSignature(ts: TimeSignature, beatGrouping?: string): void {
    if (this.config) {
      this.config.timeSignature = ts;
      this.config.beatGrouping = beatGrouping;
    }
  }

  setSubdivisionLevel(level: SubdivisionLevel): void {
    if (this.config) {
      this.config.subdivisionLevel = level;
    }
  }

  setVoiceGain(gain: number): void {
    if (this.voiceGain) {
      this.voiceGain.gain.value = gain;
    }
    if (this.config) {
      this.config.voiceGain = gain;
    }
  }

  setClickGain(gain: number): void {
    if (this.clickGain) {
      this.clickGain.gain.value = gain;
    }
    if (this.config) {
      this.config.clickGain = gain;
    }
  }

  setDrumGain(gain: number): void {
    if (this.drumGain) {
      this.drumGain.gain.value = gain;
    }
    if (this.config) {
      this.config.drumGain = gain;
    }
  }

  setSubdivisionVolumes(volumes: Volumes): void {
    if (this.config) {
      this.config.volumes = volumes;
    }
  }

  setVoiceMode(mode: VoiceMode): void {
    if (this.config) {
      this.config.voiceMode = mode;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
