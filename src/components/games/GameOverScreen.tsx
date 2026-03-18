import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sound } from './SoundManager';

interface GameOverScreenProps {
  score: number;
  honorEarned: number;
  stars: number;
  gameName: string;
  gameSlug: string;
  onReplay: () => void;
}

function Confetti() {
  const colors = ['#D4A017', '#C73032', '#16A34A', '#2563EB', '#EAB308'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-3 w-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function GameOverScreen({ score, honorEarned, stars, gameName, gameSlug, onReplay }: GameOverScreenProps) {
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    Sound.gameOver();
    const step = Math.max(1, Math.floor(score / 30));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {stars >= 2 && <Confetti />}

      <div className="relative z-50 flex flex-col items-center gap-6 rounded-2xl bg-dojuku-dark border border-dojuku-gold/20 p-8 animate-paper-unfold max-w-sm w-full mx-4">
        <h2 className="font-outfit text-2xl font-bold text-dojuku-paper">{gameName}</h2>

        {/* Stars */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <span key={s} className={`text-3xl ${s <= stars ? 'opacity-100' : 'opacity-20'}`}>
              ★
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="text-center">
          <p className="font-mono text-5xl font-bold text-dojuku-gold">{displayScore}</p>
          <p className="font-dm text-sm text-dojuku-paper/50 mt-1">points</p>
        </div>

        {/* Honor earned */}
        <div
          className="rounded-lg px-4 py-2 text-center"
          style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}
        >
          <span className="font-mono text-lg font-bold text-dojuku-gold">+{honorEarned} 名誉</span>
          <p className="font-dm text-xs text-dojuku-paper/50">Honor Points</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onReplay}
            className="w-full rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px] transition-transform hover:scale-[1.02]"
            style={{ background: 'var(--gradient-fire)' }}
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/games')}
            className="w-full rounded-lg bg-white/5 py-3 font-outfit font-semibold text-dojuku-paper/70 min-h-[44px] hover:bg-white/10 transition-colors"
          >
            Back to Hub
          </button>
        </div>
      </div>
    </div>
  );
}
