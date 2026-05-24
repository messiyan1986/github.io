// 拍号
export interface TimeSignature {
  numerator: number;    // 分子：每小节拍数
  denominator: number;  // 分母：音符类型 (4 或 8)
}

// 细分级数
export type SubdivisionLevel = 1 | 2 | 3 | 4 | 'swing8';

// 语音模式
export type VoiceMode = 'counting' | 'takadimi';

// 音量设置
export interface Volumes {
  accent: number;     // 重音音量 (0-1)
  quarter: number;    // 四分音符音量
  eighth: number;     // 八分音符音量
  sixteenth: number;  // 十六分音符音量
}

// 节拍器配置
export interface MetronomeConfig {
  bpm: number;
  timeSignature: TimeSignature;
  subdivisionLevel: SubdivisionLevel;
  voiceMode: VoiceMode;
  beatGrouping?: string;  // 如 "3+3+2"
  volumes: Volumes;
  voiceGain: number;      // 语音通道音量
  clickGain: number;      // 咔嗒声通道音量
  drumGain: number;       // 鼓声通道音量
  channelVoiceMutes: Set<string>;
  channelClickMutes: Set<string>;
  channelDrumMutes: Set<string>;
  perBeatVolumes: number[];
}

// 音频样本类型
export interface AudioSample {
  name: string;
  buffer: AudioBuffer;
}

// 语音包
export interface VoicePack {
  getSample: (name: string) => AudioBuffer | null;
}

// 预设配置
export interface Profile {
  id?: number;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  subdivisionLevel: SubdivisionLevel;
  voiceMode: VoiceMode;
  beatGrouping?: string;
  volumes: Volumes;
  voiceGain: number;
  clickGain: number;
  drumGain: number;
  createdAt?: string;
  updatedAt?: string;
}
