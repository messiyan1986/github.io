import type { VoiceMode } from '../types';

interface Props {
  mode: VoiceMode;
  onChange: (mode: VoiceMode) => void;
}

export default function VoiceModeToggle({ mode, onChange }: Props) {
  return (
    <div className="voice-mode-toggle" role="radiogroup" aria-label="计数模式">
      <button
        type="button"
        className={mode === 'counting' ? 'active' : ''}
        onClick={() => onChange('counting')}
        role="radio"
        aria-checked={mode === 'counting'}
      >
        1 e + a
      </button>
      <button
        type="button"
        className={mode === 'takadimi' ? 'active' : ''}
        onClick={() => onChange('takadimi')}
        role="radio"
        aria-checked={mode === 'takadimi'}
      >
        Ta ka di mi
      </button>
    </div>
  );
}
