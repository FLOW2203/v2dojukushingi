import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type Culture, CULTURE_CONFIG } from '../types/game';
import { useGameEngine } from '../hooks/useGameEngine';

interface RaceChar {
  char: string;
  culture: Culture;
  points: number;
  grid: 'genkou' | 'tiange' | 'simple' | 'ruled';
}

const CHARS: RaceChar[] = [
  { char: '拳', culture: 'japan', points: 10, grid: 'genkou' },
  { char: '蹴', culture: 'japan', points: 10, grid: 'genkou' },
  { char: '型', culture: 'japan', points: 10, grid: 'genkou' },
  { char: '気', culture: 'japan', points: 10, grid: 'genkou' },
  { char: '踢', culture: 'china', points: 10, grid: 'tiange' },
  { char: '拳', culture: 'china', points: 10, grid: 'tiange' },
  { char: '步', culture: 'china', points: 10, grid: 'tiange' },
  { char: '桩', culture: 'china', points: 10, grid: 'tiange' },
  { char: '차기', culture: 'korea', points: 8, grid: 'simple' },
  { char: '막기', culture: 'korea', points: 8, grid: 'simple' },
  { char: '품새', culture: 'korea', points: 8, grid: 'simple' },
  { char: '단', culture: 'korea', points: 8, grid: 'simple' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StrokeRace() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('stroke-race');

  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<RaceChar[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);

  useEffect(() => {
    if (!started || isGameOver) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, isGameOver, endGame]);

  const start = () => {
    setQueue(shuffle(CHARS));
    setStarted(true);
    setTimeLeft(60);
  };

  const handleStroke = useCallback((accuracy: number) => {
    if (!queue.length) return;
    const current = queue[0];
    const points = accuracy >= 50 ? current.points : 0;

    if (points > 0) {
      Sound.correct();
      addScore(points);
    } else {
      Sound.wrong();
      breakCombo();
    }

    setPopupScore(points);
    setShowPopup(true);

    setTimeout(() => {
      setQueue(prev => {
        const next = prev.slice(1);
        if (!next.length) return shuffle(CHARS);
        return next;
      });
    }, 400);
  }, [queue, addScore, breakCombo]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-4xl font-bold text-dojuku-gold">⚡ Stroke Race</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          60 seconds. Random characters from all writing systems. How many can you trace?
        </p>
        <button onClick={start} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Race!
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 100 ? 3 : score >= 50 ? 2 : 1} gameName="Stroke Race" gameSlug="stroke-race"
        onReplay={() => { reset(); setStarted(false); setTimeLeft(60); }}
      />
    );
  }

  const current = queue[0];
  if (!current) return null;

  return (
    <GameShell culture={current.culture} gameName="Stroke Race" score={score} honorPoints={honorEarned} timeLeft={timeLeft} maxTime={60}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{CULTURE_CONFIG[current.culture].flag}</span>
          <span className={`text-5xl ${CULTURE_CONFIG[current.culture].font} text-dojuku-paper`}>{current.char}</span>
          <span className="font-mono text-sm text-dojuku-gold">+{current.points}</span>
        </div>
        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>}
        <CalligraphyCanvas gridType={current.grid} onStrokeComplete={handleStroke} width={280} height={280} />
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
