import type { SubdivisionLevel } from '../types';

interface Props {
  subdivision: SubdivisionLevel;
  onChange: (sub: SubdivisionLevel) => void;
}

const OPTIONS = [
  { value: 1 as SubdivisionLevel, label: '四分' },
  { value: 2 as SubdivisionLevel, label: '八分' },
  { value: 3 as SubdivisionLevel, label: '三连音' },
  { value: 4 as SubdivisionLevel, label: '十六分' },
  { value: 'swing8' as SubdivisionLevel, label: 'Swing' },
];

export default function SubdivisionControl({ subdivision, onChange }: Props) {
  return (
    <div className="subdivision-control">
      <label className="control-label">细分级别</label>
      <div className="sub-buttons">
        {OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            className={subdivision === opt.value ? 'active' : ''}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
