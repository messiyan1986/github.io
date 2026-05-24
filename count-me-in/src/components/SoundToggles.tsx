interface Props {
  voiceGain: number;
  clickGain: number;
  drumGain: number;
  onVoiceChange: (gain: number) => void;
  onClickChange: (gain: number) => void;
  onDrumChange: (gain: number) => void;
}

export default function SoundToggles({ 
  voiceGain, 
  clickGain, 
  drumGain, 
  onVoiceChange, 
  onClickChange, 
  onDrumChange 
}: Props) {
  return (
    <div className="sound-toggles">
      <button 
        type="button"
        className={`toggle ${voiceGain > 0 ? 'active' : ''}`}
        onClick={() => onVoiceChange(voiceGain > 0 ? 0 : 1)}
      >
        VOICE: {voiceGain > 0 ? 'ON' : 'OFF'}
      </button>
      <button 
        type="button"
        className={`toggle ${clickGain > 0 ? 'active' : ''}`}
        onClick={() => onClickChange(clickGain > 0 ? 0 : 0.5)}
      >
        CLICK: {clickGain > 0 ? 'ON' : 'OFF'}
      </button>
      <button 
        type="button"
        className={`toggle ${drumGain > 0 ? 'active' : ''}`}
        onClick={() => onDrumChange(drumGain > 0 ? 0 : 0.7)}
      >
        DRUM: {drumGain > 0 ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}
