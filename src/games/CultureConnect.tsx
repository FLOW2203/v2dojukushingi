import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { saveGameScore, addHonor } from '../lib/supabase';

interface Row {
  technique: string;
  country: string;
  master: string;
  character: string;
}

const DATA: Row[] = [
  { technique: 'Karate', country: '🇯🇵 Japan', master: 'Sensei Diadi', character: '空手' },
  { technique: 'Wushu', country: '🇨🇳 China', master: 'Master Chen', character: '武术' },
  { technique: 'Taekwondo', country: '🇰🇷 Korea', master: 'GM Hwan', character: '태권도' },
  { technique: 'Vovinam', country: '🇻🇳 Vietnam', master: 'Master Linh', character: 'Võ' },
  { technique: 'Capoeira', country: '🇧🇷 Brazil', master: 'Mestre Bahia', character: 'Cap' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Column = 'technique' | 'country' | 'master' | 'character';

export default function CultureConnect() {
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<{ col: Column; idx: number } | null>(null);
  const [connections, setConnections] = useState<Map<string, number>>(new Map());
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [shuffled] = useState(() => ({
    technique: DATA.map((d, i) => ({ value: d.technique, row: i })),
    country: shuffle(DATA.map((d, i) => ({ value: d.country, row: i }))),
    master: shuffle(DATA.map((d, i) => ({ value: d.master, row: i }))),
    character: shuffle(DATA.map((d, i) => ({ value: d.character, row: i }))),
  }));

  const handleSelect = useCallback((col: Column, idx: number, row: number) => {
    if (gameOver) return;

    if (!selected) {
      setSelected({ col, idx });
      Sound.select();
      return;
    }

    if (selected.col === col) {
      setSelected({ col, idx });
      return;
    }

    const selectedRow = (shuffled[selected.col] as { value: string; row: number }[])[selected.idx].row;

    if (selectedRow === row) {
      Sound.correct();
      const key1 = `${selected.col}-${selected.idx}`;
      const key2 = `${col}-${idx}`;
      setConnections(prev => {
        const next = new Map(prev);
        next.set(key1, row);
        next.set(key2, row);
        return next;
      });
      setScore(p => p + 20);
      setHonor(p => p + 10);
      setPopupScore(20);
      setShowPopup(true);

      const totalConnected = connections.size / 2 + 1;
      if (totalConnected >= DATA.length * 3) {
        setTimeout(() => {
          setGameOver(true);
          const finalScore = score + 20 + (errors === 0 ? 50 : 0);
          saveGameScore({ game_slug: 'culture-connect', score: finalScore, honor_earned: honor + 10 + (errors === 0 ? 25 : 0), max_combo: 0, stars: errors === 0 ? 3 : errors <= 2 ? 2 : 1, culture: 'japan', duration_seconds: 120 });
          addHonor(honor + 10 + (errors === 0 ? 25 : 0), 'game', 'culture-connect');
        }, 500);
      }
    } else {
      Sound.wrong();
      setErrors(p => p + 1);
    }

    setSelected(null);
  }, [selected, shuffled, connections, gameOver, score, honor, errors]);

  const isConnected = (col: Column, idx: number) => connections.has(`${col}-${idx}`);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🔗 Culture Connect</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Connect techniques to their countries, masters, and characters. Match all 4 columns!
        </p>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Connecting
        </button>
      </div>
    );
  }

  if (gameOver) {
    const finalScore = score + (errors === 0 ? 50 : 0);
    return (
      <GameOverScreen score={finalScore} honorEarned={honor} stars={errors === 0 ? 3 : errors <= 2 ? 2 : 1} gameName="Culture Connect" gameSlug="culture-connect"
        onReplay={() => { setStarted(false); setScore(0); setHonor(0); setErrors(0); setGameOver(false); setConnections(new Map()); setSelected(null); }}
      />
    );
  }

  const columns: { key: Column; label: string }[] = [
    { key: 'technique', label: 'Technique' },
    { key: 'country', label: 'Country' },
    { key: 'master', label: 'Master' },
    { key: 'character', label: 'Character' },
  ];

  return (
    <GameShell culture="japan" gameName="Culture Connect" score={score} honorPoints={honor}>
      <div className="flex flex-col items-center gap-3">
        <p className="font-dm text-xs text-dojuku-paper/40">Tap two items from different columns to connect</p>
        {errors > 0 && <p className="font-mono text-xs text-dojuku-red">{errors} errors</p>}

        <div className="grid grid-cols-4 gap-1 w-full max-w-md overflow-x-auto">
          {columns.map(col => (
            <div key={col.key} className="flex flex-col gap-1">
              <p className="font-outfit text-[10px] uppercase text-dojuku-gold text-center">{col.label}</p>
              {(shuffled[col.key] as { value: string; row: number }[]).map((item, idx) => {
                const connected = isConnected(col.key, idx);
                const isSelected = selected?.col === col.key && selected?.idx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(col.key, idx, item.row)}
                    disabled={connected}
                    className={`rounded px-1.5 py-2 font-dm text-xs text-dojuku-paper min-h-[40px] transition-all ${
                      connected ? 'bg-green-600/20 border border-green-500/30 opacity-60' :
                      isSelected ? 'bg-dojuku-gold/20 border border-dojuku-gold/40 scale-105' :
                      'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {item.value}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
