import type { MetronomeConfig, SubdivisionLevel, VoiceMode } from '../types';

// 从URL解析状态
export function parseUrlState(): Partial<MetronomeConfig> | null {
  const params = new URLSearchParams(window.location.search);
  const result: Partial<MetronomeConfig> = {};

  // BPM
  const bpm = params.get('bpm');
  if (bpm) {
    const num = Number(bpm);
    if (num >= 20 && num <= 300) result.bpm = num;
  }

  // 拍号
  const ts = params.get('ts');
  if (ts) {
    const match = ts.match(/^(\d{1,2})-(\d{1,2})$/);
    if (match) {
      result.timeSignature = {
        numerator: Number(match[1]),
        denominator: Number(match[2])
      };
    }
  }

  // 细分
  const sub = params.get('sub');
  if (sub) {
    if (sub === 'swing8') {
      result.subdivisionLevel = 'swing8';
    } else {
      const num = Number(sub);
      if ([1, 2, 3, 4].includes(num)) {
        result.subdivisionLevel = num as SubdivisionLevel;
      }
    }
  }

  // 语音模式
  const vm = params.get('vm');
  if (vm && ['counting', 'takadimi'].includes(vm)) {
    result.voiceMode = vm as VoiceMode;
  }

  // 拍组
  const bg = params.get('bg');
  if (bg) {
    result.beatGrouping = bg.replace(/\./g, '+');
  }

  // 从hash解析音量设置
  const hash = window.location.hash.slice(1);
  if (hash) {
    const volumeSettings = parseHashVolumes(hash);
    Object.assign(result, volumeSettings);
  }

  return Object.keys(result).length > 0 ? result : null;
}

// 解析hash中的音量设置
function parseHashVolumes(hash: string): Partial<MetronomeConfig> {
  const result: Partial<MetronomeConfig> = {};
  const parts = hash.split('.');

  for (const part of parts) {
    const match = part.match(/^([a-z]+)(.*)$/);
    if (!match) continue;

    const [, key, values] = match;
    const nums = values.split('-').map(Number);

    if (key === 'g' && nums.length === 3) {
      result.voiceGain = nums[0] / 100;
      result.clickGain = nums[1] / 100;
      result.drumGain = nums[2] / 100;
    }

    if (key === 'v' && nums.length === 4) {
      result.volumes = {
        accent: nums[0] / 100,
        quarter: nums[1] / 100,
        eighth: nums[2] / 100,
        sixteenth: nums[3] / 100
      };
    }
  }

  return result;
}

// 更新URL
export function updateUrl(config: Partial<MetronomeConfig>) {
  const params = new URLSearchParams();

  if (config.bpm) params.set('bpm', String(config.bpm));
  
  if (config.timeSignature) {
    params.set('ts', `${config.timeSignature.numerator}-${config.timeSignature.denominator}`);
  }
  
  if (config.subdivisionLevel) {
    params.set('sub', String(config.subdivisionLevel));
  }
  
  if (config.voiceMode) {
    params.set('vm', config.voiceMode);
  }
  
  if (config.beatGrouping) {
    params.set('bg', config.beatGrouping.replace(/\+/g, '.'));
  }

  // 构建hash
  const hashParts: string[] = [];
  
  if (config.voiceGain !== undefined || config.clickGain !== undefined || config.drumGain !== undefined) {
    hashParts.push(`g${Math.round((config.voiceGain ?? 1) * 100)}-${Math.round((config.clickGain ?? 0.5) * 100)}-${Math.round((config.drumGain ?? 0) * 100)}`);
  }
  
  if (config.volumes) {
    hashParts.push(`v${Math.round(config.volumes.accent * 100)}-${Math.round(config.volumes.quarter * 100)}-${Math.round(config.volumes.eighth * 100)}-${Math.round(config.volumes.sixteenth * 100)}`);
  }

  const newUrl = `${window.location.pathname}?${params.toString()}${hashParts.length > 0 ? '#' + hashParts.join('.') : ''}`;
  window.history.replaceState(null, '', newUrl);
}

// 检查URL是否包含状态
export function hasUrlState(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('bpm') || params.has('ts') || params.has('sub');
}
