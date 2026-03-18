import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Culture } from '../../types/game';
import MasterAvatar from './MasterAvatar';
import BeltProgress from './BeltProgress';
import { toggleMute, isMuted } from './SoundManager';

interface GameShellProps {
  children: ReactNode;
  culture: Culture;
  gameName: string;
  score: number;
  honorPoints?: number;
  timeLeft?: number;
  maxTime?: number;
  masterMessage?: string;
  masterExpression?: 'neutral' | 'bravo' | 'correction' | 'celebration';
  onPause?: () => void;
}

export default function GameShell({
  children,
  culture,
  gameName,
  score,
  honorPoints = 0,
  timeLeft,
  maxTime,
  masterMessage,
  masterExpression = 'neutral',
  onPause,
}: GameShellProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(isMuted());
  const [paused, setPaused] = useState(false);

  const cultureClass = `culture-${culture}`;

  const handleMute = useCallback(() => {
    const m = toggleMute();
    setMuted(m);
  }, []);

  const handlePause = useCallback(() => {
    setPaused(p => !p);
    onPause?.();
  }, [onPause]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlePause();
      if (e.key === 'm') handleMute();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePause, handleMute]);

  const timerPercent = timeLeft != null && maxTime ? (timeLeft / maxTime) * 100 : 100;
  const timerColor = timerPercent > 30 ? '#D4A017' : '#C73032';

  return (
    <div className={`min-h-screen ${cultureClass} flex flex-col`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 backdrop-blur-sm bg-black/30">
        <MasterAvatar culture={culture} expression={masterExpression} message={masterMessage} size="sm" />
        <div className="flex flex-col items-center">
          <span className="font-outfit text-xs uppercase tracking-widest text-dojuku-paper/60">{gameName}</span>
          <span className="font-mono text-xl font-bold text-dojuku-gold">{score}</span>
        </div>
        {timeLeft != null && (
          <div className="relative h-10 w-10">
            <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke={timerColor}
                strokeWidth="2"
                strokeDasharray={`${timerPercent} ${100 - timerPercent}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-dojuku-paper">
              {timeLeft}
            </span>
          </div>
        )}
      </header>

      {/* Belt Progress */}
      <div className="px-4 py-1">
        <BeltProgress honorPoints={honorPoints} compact />
      </div>

      {/* Game Content */}
      <main className="flex-1 px-4 py-2 relative">
        {paused && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="font-outfit text-2xl font-bold text-dojuku-gold mb-4">Paused</p>
              <button
                onClick={handlePause}
                className="rounded-lg bg-dojuku-gold/20 px-6 py-3 font-outfit font-semibold text-dojuku-gold border border-dojuku-gold/30 min-h-[44px]"
              >
                Resume
              </button>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-4 px-4 py-3 bg-black/30">
        <button
          onClick={handlePause}
          className="rounded-lg bg-white/5 px-4 py-2 font-dm text-sm text-dojuku-paper/70 min-h-[44px] min-w-[44px] hover:bg-white/10 transition-colors"
        >
          {paused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button
          onClick={handleMute}
          className="rounded-lg bg-white/5 px-4 py-2 font-dm text-sm text-dojuku-paper/70 min-h-[44px] min-w-[44px] hover:bg-white/10 transition-colors"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={() => navigate('/games')}
          className="rounded-lg bg-white/5 px-4 py-2 font-dm text-sm text-dojuku-paper/70 min-h-[44px] min-w-[44px] hover:bg-white/10 transition-colors"
        >
          ✕ Quit
        </button>
      </footer>
    </div>
  );
}
