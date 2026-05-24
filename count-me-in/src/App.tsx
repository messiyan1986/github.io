import { useState, useCallback, useRef, useEffect } from 'react';
import { getAudioEngine } from './audio/AudioEngine';
import type { MetronomeConfig, TimeSignature, SubdivisionLevel, VoiceMode, Volumes } from './types';
import BPMControl from './components/BPMControl';
import TimeSignatureControl from './components/TimeSignatureControl';
import MixerPanel from './components/MixerPanel';
import BeatDisplay from './components/BeatDisplay';
import SoundToggles from './components/SoundToggles';
import VoiceModeToggle from './components/VoiceModeToggle';
import { parseUrlState, updateUrl, hasUrlState } from './utils/urlState';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/localStorage';
import './App.css';

const DEFAULT_CONFIG: MetronomeConfig = {
  bpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  subdivisionLevel: 2,
  voiceMode: 'counting',
  volumes: { accent: 1, quarter: 0.8, eighth: 0.6, sixteenth: 0 },
  voiceGain: 1,
  clickGain: 0.5,
  drumGain: 0,
  channelVoiceMutes: new Set(),
  channelClickMutes: new Set(),
  channelDrumMutes: new Set(),
  perBeatVolumes: [],
};

function getInitialConfig(): MetronomeConfig {
  const urlState = parseUrlState();
  const localState = loadFromLocalStorage();
  
  return {
    ...DEFAULT_CONFIG,
    ...(hasUrlState() ? {} : localState),
    ...urlState,
  } as MetronomeConfig;
}

function App() {
  const initConfig = useRef(getInitialConfig()).current;

  // 状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  const [bpm, setBpm] = useState(initConfig.bpm);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(initConfig.timeSignature);
  const [subdivision, setSubdivision] = useState<SubdivisionLevel>(initConfig.subdivisionLevel);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(initConfig.voiceMode);
  const [beatGrouping, setBeatGrouping] = useState<string | undefined>(initConfig.beatGrouping);
  const [volumes, setVolumes] = useState<Volumes>(initConfig.volumes);
  const [voiceGain, setVoiceGain] = useState(initConfig.voiceGain);
  const [clickGain, setClickGain] = useState(initConfig.clickGain);
  const [drumGain, setDrumGain] = useState(initConfig.drumGain);

  const audioEngine = useRef(getAudioEngine());

  // 更新URL和localStorage
  useEffect(() => {
    const config = {
      bpm,
      timeSignature,
      subdivisionLevel: subdivision,
      voiceMode,
      beatGrouping,
      volumes,
      voiceGain,
      clickGain,
      drumGain,
      channelVoiceMutes: new Set<string>(),
      channelClickMutes: new Set<string>(),
      channelDrumMutes: new Set<string>(),
      perBeatVolumes: [],
    };
    updateUrl(config);
    saveToLocalStorage({
      bpm,
      timeSignature,
      volumes,
      beatGrouping,
    });
  }, [bpm, timeSignature, subdivision, voiceMode, beatGrouping, volumes, voiceGain, clickGain, drumGain]);

  // 节拍回调
  useEffect(() => {
    audioEngine.current.onBeat((beat) => {
      setCurrentBeat(beat);
    });
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, bpm, timeSignature, subdivision, voiceMode, beatGrouping, volumes, voiceGain, clickGain, drumGain]);

  // 播放/停止
  const togglePlay = useCallback(async () => {
    const engine = audioEngine.current;

    if (isPlaying) {
      engine.stop();
      setIsPlaying(false);
      setCurrentBeat(null);
    } else {
      await engine.init();
      engine.start({
        bpm,
        timeSignature,
        subdivisionLevel: subdivision,
        voiceMode,
        beatGrouping,
        volumes,
        voiceGain,
        clickGain,
        drumGain,
        channelVoiceMutes: new Set<string>(),
        channelClickMutes: new Set<string>(),
        channelDrumMutes: new Set<string>(),
        perBeatVolumes: [],
      });
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, timeSignature, subdivision, voiceMode, beatGrouping, volumes, voiceGain, clickGain, drumGain]);

  // 处理拍号变化
  const handleTimeSignatureChange = useCallback((ts: TimeSignature, bg?: string) => {
    setTimeSignature(ts);
    setBeatGrouping(bg);
    
    if (isPlaying) {
      audioEngine.current.setTimeSignature(ts, bg);
    }
  }, [isPlaying]);

  // 处理BPM变化
  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
    if (isPlaying) {
      audioEngine.current.setTempo(newBpm);
    }
  }, [isPlaying]);

  // 处理细分变化
  const handleSubdivisionChange = useCallback((sub: SubdivisionLevel) => {
    setSubdivision(sub);
    if (isPlaying) {
      audioEngine.current.setSubdivisionLevel(sub);
    }
  }, [isPlaying]);

  // 处理音量变化
  const handleVolumesChange = useCallback((vols: Volumes) => {
    setVolumes(vols);
    if (isPlaying) {
      audioEngine.current.setSubdivisionVolumes(vols);
    }
  }, [isPlaying]);

  // 处理语音模式变化
  const handleVoiceModeChange = useCallback((mode: VoiceMode) => {
    setVoiceMode(mode);
    if (isPlaying) {
      audioEngine.current.setVoiceMode(mode);
    }
  }, [isPlaying]);

  // 处理通道音量变化
  const handleVoiceGainChange = useCallback((gain: number) => {
    setVoiceGain(gain);
    if (isPlaying) {
      audioEngine.current.setVoiceGain(gain);
    }
  }, [isPlaying]);

  const handleClickGainChange = useCallback((gain: number) => {
    setClickGain(gain);
    if (isPlaying) {
      audioEngine.current.setClickGain(gain);
    }
  }, [isPlaying]);

  const handleDrumGainChange = useCallback((gain: number) => {
    setDrumGain(gain);
    if (isPlaying) {
      audioEngine.current.setDrumGain(gain);
    }
  }, [isPlaying]);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <button onClick={togglePlay} className={isPlaying ? 'playing' : ''}>
            {'COUNT ME IN'.split('').map((char, i) => (
              <span key={i} className="title-letter" style={{ animationDelay: `${i * 50}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </button>
        </h1>
      </header>

      <main className="main">
        <div className="top-row">
          <BPMControl bpm={bpm} onChange={handleBpmChange} />
          
          <div className="center-controls">
            <button 
              className={`play-btn ${isPlaying ? 'active' : ''}`} 
              onClick={togglePlay}
              aria-label={isPlaying ? '停止' : '播放'}
            >
              {isPlaying ? 'STOP' : 'PLAY'}
            </button>
            
            <BeatDisplay 
              currentBeat={currentBeat} 
              timeSignature={timeSignature}
              beatGrouping={beatGrouping}
              playing={isPlaying}
            />
            
            <SoundToggles 
              voiceGain={voiceGain}
              clickGain={clickGain}
              drumGain={drumGain}
              onVoiceChange={handleVoiceGainChange}
              onClickChange={handleClickGainChange}
              onDrumChange={handleDrumGainChange}
            />
            
            <VoiceModeToggle 
              mode={voiceMode} 
              onChange={handleVoiceModeChange} 
            />
          </div>
          
          <TimeSignatureControl 
            timeSignature={timeSignature}
            beatGrouping={beatGrouping}
            onChange={handleTimeSignatureChange}
          />
        </div>
        
        <MixerPanel 
          volumes={volumes}
          subdivision={subdivision}
          onVolumesChange={handleVolumesChange}
          onSubdivisionChange={handleSubdivisionChange}
        />
      </main>

      <footer className="footer">
        <p>按空格键播放/停止 | 支持URL分享配置</p>
      </footer>
    </div>
  );
}

export default App;
