import { useState } from 'react';
import type { TimeSignature } from '../types';

interface Props {
  timeSignature: TimeSignature;
  beatGrouping?: string;
  onChange: (ts: TimeSignature, bg?: string) => void;
}

const PRESETS = [
  { label: '4/4', ts: { numerator: 4, denominator: 4 } },
  { label: '3/4', ts: { numerator: 3, denominator: 4 } },
  { label: '2/4', ts: { numerator: 2, denominator: 4 } },
  { label: '6/8', ts: { numerator: 6, denominator: 8 } },
  { label: '9/8', ts: { numerator: 9, denominator: 8 } },
  { label: '12/8', ts: { numerator: 12, denominator: 8 } },
  { label: '7/8', ts: { numerator: 7, denominator: 8 }, grouping: '2+2+3' },
  { label: '5/8', ts: { numerator: 5, denominator: 8 }, grouping: '3+2' },
  { label: '8/8', ts: { numerator: 8, denominator: 8 }, grouping: '3+3+2' },
];

export default function TimeSignatureControl({ timeSignature, beatGrouping, onChange }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customNumerator, setCustomNumerator] = useState(timeSignature.numerator);
  const [customDenominator, setCustomDenominator] = useState(timeSignature.denominator);
  const [customGrouping, setCustomGrouping] = useState(beatGrouping || '');

  const handleCustomChange = () => {
    onChange(
      { numerator: customNumerator, denominator: customDenominator },
      customGrouping || undefined
    );
  };

  return (
    <div className="time-signature-control">
      <div className="ts-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`ts-preset ${
              timeSignature.numerator === preset.ts.numerator && 
              timeSignature.denominator === preset.ts.denominator ? 'active' : ''
            }`}
            onClick={() => onChange(preset.ts, preset.grouping)}
          >
            {preset.label}
            {preset.grouping && <span className="grouping">({preset.grouping})</span>}
          </button>
        ))}
      </div>
      
      <button 
        className="custom-toggle"
        onClick={() => setCustomMode(!customMode)}
      >
        {customMode ? '← 返回预设' : '自定义拍号 →'}
      </button>
      
      {customMode && (
        <div className="ts-custom">
          <div className="ts-input-row">
            <input
              type="number"
              min="1"
              max="32"
              value={customNumerator}
              onChange={(e) => {
                setCustomNumerator(Number(e.target.value));
                handleCustomChange();
              }}
            />
            <span className="divider">/</span>
            <select
              value={customDenominator}
              onChange={(e) => {
                setCustomDenominator(Number(e.target.value));
                handleCustomChange();
              }}
            >
              <option value="4">4</option>
              <option value="8">8</option>
            </select>
          </div>
          
          <div className="grouping-input">
            <label>拍组 (如 3+3+2)</label>
            <input
              type="text"
              placeholder="可选"
              value={customGrouping}
              onChange={(e) => {
                setCustomGrouping(e.target.value);
                handleCustomChange();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
