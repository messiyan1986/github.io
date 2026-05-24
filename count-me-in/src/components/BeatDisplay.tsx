import type { TimeSignature } from '../types';

interface Props {
  currentBeat: number | null;
  timeSignature: TimeSignature;
  beatGrouping?: string;
  playing: boolean;
}

export default function BeatDisplay({ currentBeat, timeSignature, beatGrouping, playing }: Props) {
  const beats = Array.from({ length: timeSignature.numerator }, (_, i) => i);
  
  // 解析拍组用于显示
  const groupings = beatGrouping ? beatGrouping.split('+').map(Number) : [timeSignature.numerator];
  
  return (
    <div className="beat-display">
      <div className="beats-container">
        {beats.map((beat) => {
          const isActive = playing && currentBeat === beat;
          
          // 计算是否为拍组边界
          let groupIndex = 0;
          let sum = 0;
          for (let i = 0; i < groupings.length; i++) {
            sum += groupings[i];
            if (beat < sum) {
              groupIndex = i;
              break;
            }
          }
          const isGroupStart = beat === 0 || groupings.slice(0, groupIndex).reduce((a, b) => a + b, 0) === beat;
          
          return (
            <div 
              key={beat} 
              className={`beat ${isActive ? 'active' : ''} ${isGroupStart ? 'group-start' : ''}`}
            >
              <span className="beat-number">{beat + 1}</span>
            </div>
          );
        })}
      </div>
      
      {beatGrouping && (
        <div className="grouping-display">
          拍组: {beatGrouping}
        </div>
      )}
    </div>
  );
}
