import type { TimeSignature, SubdivisionLevel } from '../types';

// 解析拍组字符串 (如 "3+3+2" -> [3, 3, 2])
export function parseBeatGrouping(grouping: string | undefined, ts: TimeSignature): number[] {
  if (!grouping) {
    // 默认拍组
    if (ts.denominator === 8) {
      return [ts.numerator];
    }
    return Array(ts.numerator).fill(1);
  }
  return grouping.split('+').map(Number).filter(n => !isNaN(n) && n > 0);
}

// 计算每小节总拍数
export function getBeatsPerMeasure(ts: TimeSignature, subdivision: SubdivisionLevel): number {
  const multiplier = subdivision === 'swing8' ? 3 : subdivision;
  return ts.numerator * multiplier;
}

// 获取细分时长
export function getSubdivisionDuration(beatDuration: number, level: SubdivisionLevel): number {
  switch (level) {
    case 1: return beatDuration;
    case 2: return beatDuration / 2;
    case 3: return beatDuration / 3;
    case 4: return beatDuration / 4;
    case 'swing8': return beatDuration / 3;
  }
}

// 获取当前拍在拍组中的索引
export function getBeatIndex(currentBeat: number, beatGrouping: number[]): number {
  let sum = 0;
  for (let i = 0; i < beatGrouping.length; i++) {
    sum += beatGrouping[i];
    if (currentBeat < sum) {
      return i;
    }
  }
  return 0;
}

// 检查是否为重拍
export function isAccentBeat(currentBeat: number, beatGrouping: number[]): boolean {
  let sum = 0;
  for (const group of beatGrouping) {
    if (currentBeat === sum) return true;
    sum += group;
  }
  return false;
}

// 获取标准计数样本名
export function getCountingSampleName(beatIndex: number, subdivisionIndex: number, subdivision: SubdivisionLevel): string {
  // 主拍数字
  const mainBeat = (beatIndex % 16) + 1;
  
  if (subdivisionIndex === 0) {
    return String(mainBeat);
  }
  
  // 根据细分级别返回对应音节
  if (subdivision === 2) {
    return subdivisionIndex === 1 ? 'and' : '';
  }
  
  if (subdivision === 3 || subdivision === 'swing8') {
    const syllables = ['', 'ta', 'ka'];
    return syllables[subdivisionIndex] || '';
  }
  
  if (subdivision === 4) {
    const syllables = ['', 'e', 'and', 'a'];
    return syllables[subdivisionIndex] || '';
  }
  
  return '';
}

// 获取Takadimi样本名
export function getTakadimiSampleName(subdivisionIndex: number): string {
  const syllables = ['ta', 'ka', 'di', 'mi'];
  return syllables[subdivisionIndex % 4];
}
