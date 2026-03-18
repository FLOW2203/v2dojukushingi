import { useState, useCallback, useRef } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { saveGameScore, addHonor } from '../lib/supabase';

interface TimelineItem {
  id: number;
  name: string;
  year: number;
  detail: string;
}

const ITEMS: TimelineItem[] = [
  { id: 1, name: 'Shaolin Kung Fu', year: 527, detail: 'Founded at Shaolin Temple' },
  { id: 2, name: 'Judo', year: 1882, detail: 'Created by Jigoro Kano' },
  { id: 3, name: 'Karate (modern)', year: 1922, detail: 'Introduced to mainland Japan' },
  { id: 4, name: 'Vovinam', year: 1938, detail: 'Founded by Nguyen Loc' },
  { id: 5, name: 'Aikido', year: 1942, detail: 'Named by Morihei Ueshiba' },
  { id: 6, name: 'Taekwondo', year: 1955, detail: 'Officially named in Korea' },
  { id: 7, name: 'Capoeira (legal)', year: 1937, detail: 'Legalized in Brazil' },
  { id: 8, name: 'BJJ (Gracie)', year: 1925, detail: 'Gracie family adaptation' },
  { id: 9, name: 'Krav Maga', year: 1948, detail: 'Adopted by Israeli forces' },
  { id: 10, name: 'MMA (UFC 1)', year: 1993, detail: 'First UFC event' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TimelineWarrior() {
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const start = () => {
    setItems(shuffle(ITEMS));
    setStarted(true);
    setScore(0);
    setHonor(0);
    setGameOver(false);
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOver.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const newItems = [...items];
    const dragged = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOver.current, 0, dragged);
    setItems(newItems);
    dragItem.current = null;
    dragOver.current = null;
  };

  const handleMove = useCallback((index: number, dir: 'up' | 'down') => {
    const newIndex = dir === 'up' ? Math.max(0, index - 1) : Math.min(items.length - 1, index + 1);
    if (newIndex === index) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    Sound.select();
  }, [items]);

  const checkOrder = useCallback(() => {
    const sorted = [...ITEMS].sort((a, b) => a.year - b.year);
    let correct = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === sorted[i].id) correct++;
    }

    const pts = correct * 15;
    const honorPts = correct * 5;
    setScore(pts);
    setHonor(honorPts);
    setPopupScore(pts);
    setShowPopup(true);

    if (correct === items.length) Sound.levelUp();
    else Sound.correct();

    setTimeout(() => {
      setGameOver(true);
      saveGameScore({ game_slug: 'timeline-warrior', score: pts, honor_earned: honorPts, max_combo: correct, stars: correct >= 9 ? 3 : correct >= 6 ? 2 : 1, culture: 'japan', duration_seconds: 90 });
      addHonor(honorPts, 'game', 'timeline-warrior');
    }, 800);
  }, [items]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">📅 Timeline Warrior</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Drag & drop martial arts in chronological order. From ancient to modern!
        </p>
        <button onClick={start} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Timeline
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={score >= 135 ? 3 : score >= 90 ? 2 : 1} gameName="Timeline Warrior" gameSlug="timeline-warrior"
        onReplay={start}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Timeline Warrior" score={score} honorPoints={honor}>
      <div className="flex flex-col items-center gap-3">
        <p className="font-dm text-sm text-dojuku-paper/60">Sort from oldest to newest</p>

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
              <div className="flex-1">
                <p className="font-outfit text-sm text-dojuku-paper">{item.name}</p>
                <p className="font-dm text-xs text-dojuku-paper/40">{item.detail}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMove(index, 'up')} className="text-xs text-dojuku-paper/40 hover:text-dojuku-gold min-h-[22px]">▲</button>
                <button onClick={() => handleMove(index, 'down')} className="text-xs text-dojuku-paper/40 hover:text-dojuku-gold min-h-[22px]">▼</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={checkOrder} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Check Timeline
        </button>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
