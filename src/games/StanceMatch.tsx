import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { CULTURE_CONFIG, type Culture } from '../types/game';
import { saveGameScore, addHonor } from '../lib/supabase';

interface Card {
  id: number;
  content: string;
  type: 'image' | 'name';
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

const PAIRS = [
  { name: 'Karate', original: '空手', culture: 'japan' as Culture },
  { name: 'Judo', original: '柔道', culture: 'japan' as Culture },
  { name: 'Taekwondo', original: '태권도', culture: 'korea' as Culture },
  { name: 'Wushu', original: '武术', culture: 'china' as Culture },
  { name: 'Vovinam', original: 'Việt Võ Đạo', culture: 'vietnam' as Culture },
  { name: 'Capoeira', original: 'Capoeira', culture: 'brazil' as Culture },
  { name: 'Aikido', original: '合気道', culture: 'japan' as Culture },
  { name: 'Kung Fu', original: '功夫', culture: 'china' as Culture },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StanceMatch() {
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);

  const initGame = () => {
    const selected = shuffle(PAIRS).slice(0, 6);
    const cardList: Card[] = [];
    selected.forEach((p, i) => {
      cardList.push({ id: i * 2, content: `${CULTURE_CONFIG[p.culture].flag} ${p.original}`, type: 'image', pairId: i, flipped: false, matched: false });
      cardList.push({ id: i * 2 + 1, content: p.name, type: 'name', pairId: i, flipped: false, matched: false });
    });
    setCards(shuffle(cardList));
    setStarted(true);
    setTimeLeft(90);
    setScore(0);
    setHonor(0);
    setPairs(0);
    setFlipped([]);
    setGameOver(false);
  };

  useEffect(() => {
    if (!started || gameOver) return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, gameOver]);

  const endGame = useCallback(() => {
    const finalScore = score + (timeLeft * 2);
    setScore(finalScore);
    setGameOver(true);
    saveGameScore({ game_slug: 'stance-match', score: finalScore, honor_earned: honor, max_combo: pairs, stars: pairs >= 6 ? 3 : pairs >= 4 ? 2 : 1, culture: 'japan', duration_seconds: 90 - timeLeft });
    addHonor(honor, 'game', 'stance-match');
  }, [score, honor, pairs, timeLeft]);

  const handleCardClick = useCallback((id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched || flipped.length >= 2) return;

    Sound.select();
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped.map(fid => newCards.find(c => c.id === fid)!);
      if (first.pairId === second.pairId) {
        Sound.correct();
        setTimeout(() => {
          setCards(prev => prev.map(c => c.pairId === first.pairId ? { ...c, matched: true } : c));
          setFlipped([]);
          const newPairs = pairs + 1;
          setPairs(newPairs);
          setScore(p => p + 20);
          setHonor(p => p + 10);
          if (newPairs >= 6) endGame();
        }, 500);
      } else {
        Sound.wrong();
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 800);
      }
    }
  }, [cards, flipped, pairs, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🃏 Stance Match</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Memory game: match technique names to their original scripts. Find all 6 pairs!
        </p>
        <button onClick={initGame} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Match
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={pairs >= 6 ? 3 : pairs >= 4 ? 2 : 1} gameName="Stance Match" gameSlug="stance-match"
        onReplay={initGame}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Stance Match" score={score} honorPoints={honor} timeLeft={timeLeft} maxTime={90}>
      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-sm text-dojuku-gold">{pairs}/6 pairs found</p>
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-lg flex items-center justify-center p-2 text-center font-dm text-sm min-h-[44px] transition-all duration-300 ${
                card.matched ? 'bg-green-600/20 border border-green-500/30' :
                card.flipped ? 'bg-dojuku-gold/20 border border-dojuku-gold/40' :
                'bg-white/10 hover:bg-white/15 border border-white/10'
              }`}
            >
              {card.flipped || card.matched ? (
                <span className="text-dojuku-paper text-xs">{card.content}</span>
              ) : (
                <span className="text-2xl opacity-30">?</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
