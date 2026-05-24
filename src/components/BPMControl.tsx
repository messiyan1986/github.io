import { useState, useRef, useCallback } from 'react';

interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
}

export default function BPMControl({ bpm, onChange }: Props) {
  const [, setTapTimes] = useState<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    setTapTimes(prev => {
      const newTimes = [...prev, now].slice(-5);
      
      if (newTimes.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < newTimes.length; i++) {
          intervals.push(newTimes[i] - newTimes[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        
        if (calculatedBpm >= 20 && calculatedBpm <= 300) {
          onChange(calculatedBpm);
        }
      }
      
      return newTimes;
    });
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = window.setTimeout(() => {
      setTapTimes([]);
    }, 2000);
  }, [onChange]);

  return (
    <div className="bpm-control">
      <div className="bpm-display">
        <span className="bpm-value">{bpm}</span>
        <span className="bpm-label">BPM</span>
      </div>
      
      <input
        type="range"
        min="20"
        max="300"
        value={bpm}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bpm-slider"
      />
      
      <div className="bpm-buttons">
        <button onClick={() => onChange(Math.max(20, bpm - 5))}>-5</button>
        <button onClick={() => onChange(Math.max(20, bpm - 1))}>-1</button>
        <button onClick={handleTap} className="tap-btn">TAP</button>
        <button onClick={() => onChange(Math.min(300, bpm + 1))}>+1</button>
        <button onClick={() => onChange(Math.min(300, bpm + 5))}>+5</button>
      </div>
    </div>
  );
}
