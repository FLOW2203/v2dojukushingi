import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASE_CONFIG: Record<Phase, { duration: number; label: string; instruction: string }> = {
  inhale: { duration: 4, label: 'Breathe In', instruction: 'Expand your lungs slowly...' },
  hold: { duration: 4, label: 'Hold', instruction: 'Keep steady...' },
  exhale: { duration: 6, label: 'Breathe Out', instruction: 'Release slowly...' },
};

const CYCLE_DURATION = 14; // 4 + 4 + 6

export default function ZenBreath() {
  const navigate = useNavigate();
  const { score, addScore, endGame, reset } = useGameEngine('zen-breath');
  const [mode, setMode] = useState<'scored' | 'relax' | null>(null);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [taps, setTaps] = useState(0);
  const [goodTaps, setGoodTaps] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const animRef = useRef<number>(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (!mode || gameOver) return;

    startTime.current = performance.now();
    let lastSecond = 0;

    const tick = (now: number) => {
      const elapsed = (now - startTime.current) / 1000;
      setTotalTime(elapsed);

      const cyclePos = elapsed % CYCLE_DURATION;
      let newPhase: Phase;
      let newPhaseTime: number;

      if (cyclePos < 4) {
        newPhase = 'inhale';
        newPhaseTime = cyclePos;
      } else if (cyclePos < 8) {
        newPhase = 'hold';
        newPhaseTime = cyclePos - 4;
      } else {
        newPhase = 'exhale';
        newPhaseTime = cyclePos - 8;
      }

      setPhase(newPhase);
      setPhaseTime(newPhaseTime);

      const currentSecond = Math.floor(elapsed);
      if (currentSecond > lastSecond) {
        lastSecond = currentSecond;
        setCycles(Math.floor(elapsed / CYCLE_DURATION));
      }

      if (mode === 'scored' && elapsed >= 60) {
        setGameOver(true);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [mode, gameOver]);

  useEffect(() => {
    if (gameOver && mode === 'scored') {
      const accuracy = taps > 0 ? Math.round((goodTaps / taps) * 100) : 0;
      const finalScore = accuracy + cycles * 10;
      // Add the final score via the hook
      addScore(finalScore);
      // Use a short delay to let state update before ending
      setTimeout(() => {
        endGame(accuracy);
      }, 50);
    }
  }, [gameOver, mode, taps, goodTaps, cycles, addScore, endGame]);

  const handleTap = useCallback(() => {
    if (mode !== 'scored' || gameOver) return;
    setTaps(p => p + 1);

    // Good tap = at phase transition points (within 0.5s of start/end)
    const config = PHASE_CONFIG[phase];
    if (phaseTime < 0.5 || phaseTime > config.duration - 0.5) {
      setGoodTaps(p => p + 1);
      Sound.correct();
    } else {
      Sound.tick();
    }
  }, [mode, gameOver, phase, phaseTime]);

  // Circle scale based on phase
  const getScale = () => {
    const config = PHASE_CONFIG[phase];
    const progress = phaseTime / config.duration;
    if (phase === 'inhale') return 0.5 + progress * 0.8;
    if (phase === 'hold') return 1.3;
    return 1.3 - progress * 0.8;
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🧘 Zen Breath</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Follow the breathing circle. Inhale 4s, hold 4s, exhale 6s.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => setMode('scored')} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            ⏱ Scored Mode (60s)
          </button>
          <button onClick={() => setMode('relax')} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-paper bg-white/10 min-h-[44px] hover:bg-white/20 transition-colors">
            🌿 Relaxation (no score)
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = taps > 0 ? Math.round((goodTaps / taps) * 100) : 0;
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h2 className="font-outfit text-2xl font-bold text-dojuku-paper">Session Complete</h2>
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center space-y-3">
          <p className="font-mono text-4xl font-bold text-dojuku-gold">{score}</p>
          <p className="font-dm text-sm text-dojuku-paper/60">{cycles} cycles | {accuracy}% timing accuracy</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { reset(); setMode(null); setGameOver(false); setTaps(0); setGoodTaps(0); setCycles(0); setTotalTime(0); }}
            className="rounded-lg px-6 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            Again
          </button>
          <button onClick={() => navigate('/games')}
            className="rounded-lg px-6 py-3 font-outfit font-semibold text-dojuku-paper bg-white/10 min-h-[44px]">
            Hub
          </button>
        </div>
      </div>
    );
  }

  const config = PHASE_CONFIG[phase];
  const scale = getScale();

  return (
    <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4" onClick={handleTap}>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        {mode === 'scored' && (
          <span className="font-mono text-sm text-dojuku-gold">{Math.max(0, 60 - Math.floor(totalTime))}s</span>
        )}
        <span className="font-mono text-sm text-dojuku-paper/40">{cycles} cycles</span>
        <button onClick={(e) => { e.stopPropagation(); navigate('/games'); }}
          className="text-dojuku-paper/40 hover:text-dojuku-paper min-h-[44px] min-w-[44px] flex items-center justify-center">
          ✕
        </button>
      </div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 250, height: 250 }}>
        <div
          className="absolute rounded-full transition-transform duration-300"
          style={{
            width: 200,
            height: 200,
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, rgba(212,160,23,0.3), rgba(212,160,23,0.05))`,
            boxShadow: '0 0 60px rgba(212,160,23,0.2)',
          }}
        />
        <div
          className="absolute rounded-full border-2 border-dojuku-gold/30"
          style={{ width: 200 * scale, height: 200 * scale, transition: 'width 0.3s, height 0.3s' }}
        />
      </div>

      <div className="text-center">
        <p className="font-outfit text-2xl font-bold text-dojuku-gold">{config.label}</p>
        <p className="font-dm text-sm text-dojuku-paper/50">{config.instruction}</p>
      </div>

      {mode === 'scored' && (
        <p className="font-dm text-xs text-dojuku-paper/30">Tap at phase transitions for bonus points</p>
      )}
    </div>
  );
}
