import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

const HANGUL_SET = [
  { char: '태권도', romanized: 'taekwondo', english: 'way of fist and foot' },
  { char: '합기도', romanized: 'hapkido', english: 'coordinated power' },
  { char: '검도', romanized: 'kumdo', english: 'way of sword' },
  { char: '차기', romanized: 'chagi', english: 'kick' },
  { char: '막기', romanized: 'makgi', english: 'block' },
  { char: '지르기', romanized: 'jireugi', english: 'punch' },
  { char: '품새', romanized: 'poomsae', english: 'form' },
  { char: '겨루기', romanized: 'gyeorugi', english: 'sparring' },
  { char: '격파', romanized: 'gyeokpa', english: 'breaking' },
  { char: '단', romanized: 'dan', english: 'rank' },
  { char: '관', romanized: 'gwan', english: 'school' },
  { char: '도장', romanized: 'dojang', english: 'training hall' },
  { char: '띠', romanized: 'tti', english: 'belt' },
  { char: '발차기', romanized: 'balchagi', english: 'foot kick' },
  { char: '손기술', romanized: 'songisul', english: 'hand technique' },
  { char: '무릎', romanized: 'mureup', english: 'knee' },
  { char: '팔꿈치', romanized: 'palkkumchi', english: 'elbow' },
  { char: '머리', romanized: 'meori', english: 'head' },
  { char: '몸', romanized: 'mom', english: 'body' },
  { char: '기합', romanized: 'kihap', english: 'spirit shout' },
];

export default function HangulDojo() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('hangul-dojo');

  const [started, setStarted] = useState(false);
  const [speedRun, setSpeedRun] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [masterMsg, setMasterMsg] = useState('');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction'>('neutral');

  useEffect(() => {
    if (!started || isGameOver) return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, isGameOver, endGame]);

  const handleStroke = useCallback((accuracy: number) => {
    const points = Math.round(accuracy * (speedRun ? 1.5 : 1));

    if (accuracy >= 60) {
      Sound.correct();
      addScore(points);
      setMasterMsg('잘했어요! Well done!');
      setMasterExpr('bravo');
    } else {
      Sound.wrong();
      breakCombo();
      setMasterMsg('다시 해보세요. Try again.');
      setMasterExpr('correction');
    }

    setPopupScore(points);
    setShowPopup(true);

    setTimeout(() => {
      const next = currentIndex + 1;
      if (!speedRun && next >= 10) endGame();
      else setCurrentIndex(next);
      setMasterExpr('neutral');
    }, speedRun ? 500 : 800);
  }, [speedRun, currentIndex, addScore, breakCombo, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen culture-korea flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-noto-kr text-4xl text-dojuku-paper">한글</h1>
        <h2 className="font-outfit text-xl font-bold text-dojuku-gold">Hangul Dojo</h2>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Write Korean martial arts terms. Hangul is an alphabet — go fast!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => { setStarted(true); setSpeedRun(false); }} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            🎯 Standard Mode
          </button>
          <button onClick={() => { setStarted(true); setSpeedRun(true); }} className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
            ⚡ Speed Run (60s)
          </button>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 160 ? 3 : score >= 80 ? 2 : 1} gameName="Hangul Dojo" gameSlug="hangul-dojo"
        onReplay={() => { reset(); setStarted(false); setCurrentIndex(0); setTimeLeft(60); }}
      />
    );
  }

  const hangul = HANGUL_SET[currentIndex % HANGUL_SET.length];

  return (
    <GameShell culture="korea" gameName="Hangul Dojo" score={score} honorPoints={honorEarned}
      timeLeft={speedRun ? timeLeft : undefined} maxTime={60} masterMessage={masterMsg} masterExpression={masterExpr}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-noto-kr text-5xl text-dojuku-paper mb-1">{hangul.char}</p>
          <p className="font-dm text-sm text-dojuku-paper/60">{hangul.romanized} — {hangul.english}</p>
        </div>
        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>}
        <CalligraphyCanvas gridType="simple" onStrokeComplete={handleStroke} />
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
