// 使用 Web Audio API 合成音频样本
// 这样就不需要外部音频文件

export class SampleGenerator {
  private ctx: AudioContext;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  // 生成语音样本（使用振荡器模拟）
  generateVoiceSample(name: string): AudioBuffer {
    const duration = 0.3;
    const sampleRate = this.ctx.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const baseFreq = this.getFrequencyForName(name);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = this.getEnvelope(t);
      const tone = Math.sin(2 * Math.PI * baseFreq * t) * envelope;
      const harmonic = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.3 * envelope;
      data[i] = (tone + harmonic) * 0.5;
    }

    return buffer;
  }

  // 生成咔嗒声
  generateClickSample(high: boolean): AudioBuffer {
    const duration = high ? 0.05 : 0.03;
    const sampleRate = this.ctx.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const freq = high ? 1000 : 800;
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * (high ? 80 : 100));
      const noise = (Math.random() * 2 - 1) * 0.3;
      const tone = Math.sin(2 * Math.PI * freq * t);
      data[i] = (tone * 0.7 + noise) * envelope * 0.8;
    }

    return buffer;
  }

  // 生成鼓声
  generateDrumSample(type: 'kick' | 'snare' | 'hihat'): AudioBuffer {
    const duration = type === 'hihat' ? 0.1 : 0.3;
    const sampleRate = this.ctx.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'kick':
        this.generateKick(data, sampleRate);
        break;
      case 'snare':
        this.generateSnare(data, sampleRate);
        break;
      case 'hihat':
        this.generateHihat(data, sampleRate);
        break;
    }

    return buffer;
  }

  private generateKick(data: Float32Array, sampleRate: number) {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const freq = 150 * Math.exp(-t * 15);
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.8;
    }
  }

  private generateSnare(data: Float32Array, sampleRate: number) {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 20);
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.5;
      const noise = (Math.random() * 2 - 1) * 0.5;
      data[i] = (tone + noise) * envelope * 0.7;
    }
  }

  private generateHihat(data: Float32Array, sampleRate: number) {
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 80);
      const noise = (Math.random() * 2 - 1);
      if (i > 0) {
        data[i] = (noise * 0.5 + data[i - 1] * 0.5) * envelope * 0.5;
      } else {
        data[i] = noise * envelope * 0.5;
      }
    }
  }

  private getFrequencyForName(name: string): number {
    const numMatch = name.match(/^\d+$/);
    if (numMatch) {
      const num = parseInt(name);
      const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
      return notes[(num - 1) % notes.length];
    }

    const syllableFreqs: Record<string, number> = {
      'e': 329.63,
      'and': 392.00,
      'a': 440.00,
      'ta': 261.63,
      'ka': 293.66,
      'di': 329.63,
      'mi': 349.23,
    };

    return syllableFreqs[name] || 440;
  }

  private getEnvelope(t: number): number {
    const attack = 0.01;
    const decay = 0.1;
    
    if (t < attack) {
      return t / attack;
    } else if (t < attack + decay) {
      return 1 - (t - attack) / decay * 0.3;
    } else {
      return 0.7 * Math.exp(-(t - attack - decay) * 5);
    }
  }
}
