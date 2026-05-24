import type { Volumes, SubdivisionLevel } from '../types';
import SubdivisionControl from './SubdivisionControl';

interface Props {
  volumes: Volumes;
  subdivision: SubdivisionLevel;
  onVolumesChange: (volumes: Volumes) => void;
  onSubdivisionChange: (sub: SubdivisionLevel) => void;
}

const SLIDERS = [
  { key: 'accent' as const, label: '重音' },
  { key: 'quarter' as const, label: '四分' },
  { key: 'eighth' as const, label: '八分' },
  { key: 'sixteenth' as const, label: '十六分' },
];

export default function MixerPanel({ volumes, subdivision, onVolumesChange, onSubdivisionChange }: Props) {
  const updateVolume = (key: keyof Volumes, value: number) => {
    onVolumesChange({ ...volumes, [key]: value });
  };

  return (
    <div className="mixer-panel">
      <SubdivisionControl 
        subdivision={subdivision} 
        onChange={onSubdivisionChange} 
      />
      
      <div className="volume-sliders">
        {SLIDERS.map(({ key, label }) => (
          <div key={key} className="slider-group">
            <label>{label}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volumes[key] * 100)}
              onChange={(e) => updateVolume(key, Number(e.target.value) / 100)}
            />
            <span>{Math.round(volumes[key] * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
