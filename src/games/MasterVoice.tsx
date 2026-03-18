import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type Culture, CULTURE_CONFIG } from '../types/game';
import { saveGameScore, addHonor } from '../lib/supabase';

interface Quote {
  text: string;
  culture: Culture;
  master: string;
}

const QUOTES: Quote[] = [
  { text: 'In the way of the empty hand, there is no first attack. Begin with defense, end with compassion.', culture: 'japan', master: 'Sensei Diadi' },
  { text: 'The bamboo that bends in the wind is stronger than the oak that breaks. Yield to overcome.', culture: 'japan', master: 'Sensei Diadi' },
  { text: 'True strength flows like water — formless yet unstoppable. Shape your qi like a river.', culture: 'china', master: 'Master Chen' },
  { text: 'The crane stands on one leg not from effort, but from perfect balance. Find your center.', culture: 'china', master: 'Master Chen' },
  { text: 'Your kick must reach the sky before it reaches your opponent. Spirit before technique.', culture: 'korea', master: 'Grand Master Hwan' },
  { text: 'The breaking board does not resist — you break through your own doubt.', culture: 'korea', master: 'Grand Master Hwan' },
  { text: 'In Vovinam, we fight with the whole body — hands as soft as silk, legs as hard as iron.', culture: 'vietnam', master: 'Master Linh' },
  { text: 'The warrior who breathes with the cosmos needs no weapon but his spirit.', culture: 'vietnam', master: 'Master Linh' },
  { text: 'In the roda, life and combat are the same dance. Move with joy, strike with rhythm.', culture: 'brazil', master: 'Mestre Bahia' },
  { text: 'Capoeira is freedom made visible. Every ginga tells the story of our ancestors.', culture: 'brazil', master: 'Mestre Bahia' },
  { text: 'Seven times you fall, eight times you rise. This is the path of the warrior.', culture: 'japan', master: 'Sensei Diadi' },
  { text: 'A thousand-li journey begins beneath your feet. Step with intention.', culture: 'china', master: 'Master Chen' },
  { text: 'The belt only covers two inches of your body. The rest is your responsibility.', culture: 'korea', master: 'Grand Master Hwan' },
  { text: 'In self-defense, the strongest technique is the one that avoids combat entirely.', culture: 'vietnam', master: 'Master Linh' },
  { text: 'When the berimbau plays, even the earth sways. Respect the rhythm.', culture: 'brazil', master: 'Mestre Bahia' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CULTURES: Culture[] = ['japan', 'china', 'korea', 'vietnam', 'brazil'];

export default function MasterVoice() {
  const [started, setStarted] = useState(false);
  const [quotes] = useState(() => shuffle(QUOTES).slice(0, 15));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<Culture | null>(null);

  const quote = quotes[currentIndex];

  const handleAnswer = useCallback((culture: Culture) => {
    if (answered) return;
    setAnswered(true);
    setSelected(culture);
    const correct = culture === quote.culture;
    const pts = correct ? 15 : 0;
    const honorPts = correct ? 10 : 0;

    if (correct) {
      Sound.correct();
      setCombo(p => { const n = p + 1; if (n > maxCombo) setMaxCombo(n); return n; });
    } else {
      Sound.wrong();
      setCombo(0);
    }

    setScore(p => p + pts);
    setHonor(p => p + honorPts);
    if (pts > 0) { setPopupScore(pts); setShowPopup(true); }

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= quotes.length) {
        setGameOver(true);
        saveGameScore({ game_slug: 'master-voice', score: score + pts, honor_earned: honor + honorPts, max_combo: Math.max(maxCombo, combo + (correct ? 1 : 0)), stars: (score + pts) >= 180 ? 3 : (score + pts) >= 90 ? 2 : 1, culture: 'japan', duration_seconds: 120 });
        addHonor(honor + honorPts, 'game', 'master-voice');
      } else {
        setCurrentIndex(next);
        setAnswered(false);
        setSelected(null);
      }
    }, 1200);
  }, [answered, quote, currentIndex, combo, maxCombo, quotes.length, score, honor]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">👴 Master Voice</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Read the master's words and identify which culture they belong to.
        </p>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Listen to the Masters
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={score >= 180 ? 3 : score >= 90 ? 2 : 1} gameName="Master Voice" gameSlug="master-voice"
        onReplay={() => { setStarted(false); setScore(0); setHonor(0); setCombo(0); setMaxCombo(0); setCurrentIndex(0); setGameOver(false); setAnswered(false); setSelected(null); }}
      />
    );
  }

  return (
    <GameShell culture={quote.culture} gameName="Master Voice" score={score} honorPoints={honor}>
      <div className="flex flex-col items-center gap-5">
        <p className="font-mono text-sm text-dojuku-gold">{currentIndex + 1}/{quotes.length}</p>
        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">STREAK ×{combo}</div>}

        <div className="rounded-xl bg-white/5 border border-white/10 p-5 max-w-sm">
          <p className="font-dm text-base italic text-dojuku-paper leading-relaxed">"{quote.text}"</p>
        </div>

        {answered && (
          <p className="font-dm text-sm text-dojuku-paper/60">— {quote.master} ({CULTURE_CONFIG[quote.culture].flag})</p>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {CULTURES.map(c => {
            let bg = 'bg-white/10 hover:bg-white/20';
            if (answered) {
              if (c === quote.culture) bg = 'bg-green-600/40';
              else if (c === selected) bg = 'bg-red-600/40';
            }
            return (
              <button key={c} onClick={() => handleAnswer(c)} disabled={answered}
                className={`rounded-lg px-4 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] transition-colors ${bg}`}>
                {CULTURE_CONFIG[c].flag} {CULTURE_CONFIG[c].name}
              </button>
            );
          })}
        </div>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
