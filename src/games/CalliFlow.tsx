import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type Culture, CULTURE_CONFIG } from '../types/game';
import { useGameEngine } from '../hooks/useGameEngine';

const TECHNIQUES = [
  { english: 'Kick', japan: '蹴', china: '踢', korea: '차기', vietnam: 'đá', brazil: 'meia-lua' },
  { english: 'Punch', japan: '拳', china: '拳', korea: '지르기', vietnam: 'đấm', brazil: 'soco' },
  { english: 'Block', japan: '受', china: '挡', korea: '막기', vietnam: 'đỡ', brazil: 'esquiva' },
  { english: 'Throw', japan: '投', china: '推', korea: '던지기', vietnam: 'vật', brazil: 'rasteira' },
  { english: 'Form', japan: '型', china: '拳', korea: '품새', vietnam: 'quyền', brazil: 'ginga' },
];

const CULTURES: Culture[] = ['japan', 'china', 'korea', 'vietnam', 'brazil'];
const GRID_MAP: Record<Culture, 'genkou' | 'tiange' | 'simple' | 'ruled'> = {
  japan: 'genkou', china: 'tiange', korea: 'simple', vietnam: 'ruled', brazil: 'simple',
};

export default function CalliFlow() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('calli-flow');

  const [started, setStarted] = useState(false);
  const [techIndex, setTechIndex] = useState(0);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [completedCultures, setCompletedCultures] = useState<Set<Culture>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [masterMsg, setMasterMsg] = useState('');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction' | 'celebration'>('neutral');

  const tech = TECHNIQUES[techIndex % TECHNIQUES.length];

  const handleStroke = useCallback((accuracy: number) => {
    if (!selectedCulture) return;
    const points = Math.round(accuracy * 1.5);

    if (accuracy >= 70) {
      Sound.correct();
      addScore(points);
      setMasterMsg('Beautiful flow across cultures!');
      setMasterExpr('bravo');
    } else {
      Sound.wrong();
      breakCombo();
      setMasterExpr('correction');
    }

    const newCompleted = new Set(completedCultures);
    newCompleted.add(selectedCulture);
    setCompletedCultures(newCompleted);

    let bonusPts = 0;
    if (newCompleted.size === 5) {
      bonusPts = 50;
      addScore(bonusPts);
      setMasterMsg('Master of the Five Ways! +50 bonus!');
      setMasterExpr('celebration');
      Sound.levelUp();
    }

    setPopupScore(points + bonusPts);
    setShowPopup(true);

    setTimeout(() => {
      if (newCompleted.size === 5) {
        setCompletedCultures(new Set());
        const next = techIndex + 1;
        if (next >= TECHNIQUES.length) {
          endGame();
          return;
        }
        setTechIndex(next);
      }
      setSelectedCulture(null);
      setMasterExpr('neutral');
    }, 1000);
  }, [selectedCulture, completedCultures, techIndex, addScore, breakCombo, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-4xl font-bold text-dojuku-gold">CalliFlow</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          One technique, five writing systems. Trace across all cultures for the ultimate bonus!
        </p>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Flow
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 500 ? 3 : score >= 250 ? 2 : 1} gameName="CalliFlow" gameSlug="calli-flow"
        onReplay={() => { reset(); setStarted(false); setTechIndex(0); setSelectedCulture(null); setCompletedCultures(new Set()); }}
      />
    );
  }

  return (
    <GameShell culture={selectedCulture || 'japan'} gameName="CalliFlow" score={score} honorPoints={honorEarned} masterMessage={masterMsg} masterExpression={masterExpr}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-outfit text-2xl font-bold text-dojuku-paper">{tech.english}</p>
          <p className="font-dm text-xs text-dojuku-paper/40">Choose a culture, then trace</p>
        </div>

        {/* Culture progress */}
        <div className="flex gap-2">
          {CULTURES.map(c => (
            <button
              key={c}
              onClick={() => !completedCultures.has(c) && setSelectedCulture(c)}
              disabled={completedCultures.has(c)}
              className={`rounded-lg px-3 py-2 text-xl min-h-[44px] min-w-[44px] transition-all ${
                completedCultures.has(c) ? 'opacity-30' : selectedCulture === c ? 'ring-2 ring-dojuku-gold scale-110' : 'hover:scale-105'
              } bg-white/5`}
            >
              {CULTURE_CONFIG[c].flag}
            </button>
          ))}
        </div>

        {selectedCulture && (
          <div className="animate-paper-unfold">
            <p className={`text-center text-3xl mb-3 ${CULTURE_CONFIG[selectedCulture].font} text-dojuku-paper`}>
              {tech[selectedCulture as keyof typeof tech]}
            </p>
            <CalligraphyCanvas gridType={GRID_MAP[selectedCulture]} onStrokeComplete={handleStroke} />
          </div>
        )}

        {completedCultures.size > 0 && (
          <p className="font-mono text-xs text-dojuku-gold">{completedCultures.size}/5 cultures completed</p>
        )}
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
