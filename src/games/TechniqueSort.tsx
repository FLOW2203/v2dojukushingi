import { useState, useCallback, useRef } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { CULTURE_CONFIG, type Culture } from '../types/game';
import { saveGameScore, addHonor } from '../lib/supabase';

interface SortItem {
  id: number;
  name: string;
  culture: Culture;
  difficulty: number;
}

const ITEMS: SortItem[] = [
  { id: 1, name: 'Front Punch', culture: 'japan', difficulty: 1 },
  { id: 2, name: 'Roundhouse Kick', culture: 'korea', difficulty: 3 },
  { id: 3, name: 'Ginga', culture: 'brazil', difficulty: 2 },
  { id: 4, name: 'Tai Chi Push', culture: 'china', difficulty: 2 },
  { id: 5, name: 'Flying Kick', culture: 'korea', difficulty: 5 },
  { id: 6, name: 'Vovinam Scissors', culture: 'vietnam', difficulty: 5 },
  { id: 7, name: 'Judo Throw', culture: 'japan', difficulty: 3 },
  { id: 8, name: 'Capoeira Au', culture: 'brazil', difficulty: 2 },
  { id: 9, name: 'Palm Strike', culture: 'china', difficulty: 1 },
  { id: 10, name: 'Back Kick', culture: 'vietnam', difficulty: 4 },
];

type SortMode = 'difficulty' | 'culture';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TechniqueSort() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<SortMode>('difficulty');
  const [items, setItems] = useState<SortItem[]>([]);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const start = (m: SortMode) => {
    setMode(m);
    setItems(shuffle(ITEMS.slice(0, 8)));
    setStarted(true);
    setScore(0);
    setHonor(0);
    setGameOver(false);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOver.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const newItems = [...items];
    const draggedItem = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOver.current, 0, draggedItem);
    setItems(newItems);
    dragItem.current = null;
    dragOver.current = null;
  };

  const handleTouchMove = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(items.length - 1, index + 1);
    if (newIndex === index) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    Sound.select();
  }, [items]);

  const checkOrder = useCallback(() => {
    let correct = 0;
    const sorted = [...items];
    if (mode === 'difficulty') {
      sorted.sort((a, b) => a.difficulty - b.difficulty);
    } else {
      const order: Culture[] = ['japan', 'china', 'korea', 'vietnam', 'brazil'];
      sorted.sort((a, b) => order.indexOf(a.culture) - order.indexOf(b.culture));
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].id === sorted[i].id) correct++;
    }

    const points = correct * 15;
    const honorPts = correct * 5;
    setScore(points);
    setHonor(honorPts);
    setPopupScore(points);
    setShowPopup(true);

    if (correct === items.length) {
      Sound.levelUp();
    } else {
      Sound.correct();
    }

    setTimeout(() => {
      setGameOver(true);
      saveGameScore({ game_slug: 'technique-sort', score: points, honor_earned: honorPts, max_combo: correct, stars: correct >= 7 ? 3 : correct >= 5 ? 2 : 1, culture: 'japan', duration_seconds: 60 });
      addHonor(honorPts, 'game', 'technique-sort');
    }, 800);
  }, [items, mode]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">↕️ Technique Sort</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Drag & drop to sort 8 techniques. Choose your sorting criterion.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => start('difficulty')} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            Sort by Difficulty (1→5)
          </button>
          <button onClick={() => start('culture')} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            Sort by Culture (🇯🇵→🇧🇷)
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={score >= 105 ? 3 : score >= 75 ? 2 : 1} gameName="Technique Sort" gameSlug="technique-sort"
        onReplay={() => setStarted(false)}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Technique Sort" score={score} honorPoints={honor}>
      <div className="flex flex-col items-center gap-4">
        <p className="font-dm text-sm text-dojuku-paper/60">
          Sort by {mode === 'difficulty' ? 'difficulty (easy → hard)' : 'culture (🇯🇵→🇨🇳→🇰🇷→🇻🇳→🇧🇷)'}
        </p>

        <div className="w-full max-w-sm space-y-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10 cursor-move select-none"
            >
              <span className="text-dojuku-paper/30 font-mono text-xs w-4">{index + 1}</span>
              <span>{CULTURE_CONFIG[item.culture].flag}</span>
              <span className="font-dm text-sm text-dojuku-paper flex-1">{item.name}</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < item.difficulty ? 'bg-dojuku-gold' : 'bg-white/10'}`} />
                ))}
              </div>
              <div className="flex flex-col gap-0.5 ml-1">
                <button onClick={() => handleTouchMove(index, 'up')} className="text-xs text-dojuku-paper/40 hover:text-dojuku-gold min-h-[22px]">▲</button>
                <button onClick={() => handleTouchMove(index, 'down')} className="text-xs text-dojuku-paper/40 hover:text-dojuku-gold min-h-[22px]">▼</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={checkOrder} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Check Order
        </button>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
