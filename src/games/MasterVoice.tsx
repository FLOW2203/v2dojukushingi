import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type Culture, CULTURE_CONFIG } from '../types/game';
import { useGameEngine } from '../hooks/useGameEngine';

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
  const { score, combo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('master-voice');
  const [started, setStarted] = useState(false);
  const [quotes] = useState(() => shuffle(QUOTES).slice(0, 15));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<Culture | null>(null);

  const quote = quotes[currentIndex];

  const handleAnswer = useCallback((culture: Culture) => {
    if (answered) return;
    setAnswered(true);
    setSelected(culture);
    const correct = culture === quote.culture;

    if (correct) {
      Sound.correct();
      addScore(15);
      setPopupScore(15);
      setShowPopup(true);
    } else {
      Sound.wrong();
      breakCombo();
    }

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= quotes.length) {
        endGame();
      } else {
        setCurrentIndex(next);
        setAnswered(false);
        setSelected(null);
      }
    }, 1200);
  }, [answered, quote, currentIndex, quotes.length, addScore, breakCombo, endGame]);

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

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 180 ? 3 : score >= 90 ? 2 : 1} gameName="Master Voice" gameSlug="master-voice"
        onReplay={() => { reset(); setStarted(false); setCurrentIndex(0); setAnswered(false); setSelected(null); }}
      />
    );
  }

  return (
    <GameShell culture={quote.culture} gameName="Master Voice" score={score} honorPoints={honorEarned}>
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
