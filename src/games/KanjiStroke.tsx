import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { saveGameScore, addHonor } from '../lib/supabase';

const KANJI_SET = [
  { char: '空手', romanized: 'karate', english: 'empty hand' },
  { char: '柔道', romanized: 'judo', english: 'gentle way' },
  { char: '合気道', romanized: 'aikido', english: 'harmony way' },
  { char: '剣道', romanized: 'kendo', english: 'way of sword' },
  { char: '武道', romanized: 'budo', english: 'martial way' },
  { char: '道場', romanized: 'dojo', english: 'training hall' },
  { char: '型', romanized: 'kata', english: 'form' },
  { char: '技', romanized: 'waza', english: 'technique' },
  { char: '気', romanized: 'ki', english: 'spirit' },
  { char: '力', romanized: 'chikara', english: 'power' },
  { char: '拳', romanized: 'ken', english: 'fist' },
  { char: '蹴', romanized: 'keri', english: 'kick' },
  { char: '受', romanized: 'uke', english: 'block' },
  { char: '投', romanized: 'nage', english: 'throw' },
  { char: '極', romanized: 'kime', english: 'focus' },
  { char: '打', romanized: 'uchi', english: 'strike' },
  { char: '突', romanized: 'tsuki', english: 'punch' },
  { char: '防', romanized: 'bo', english: 'defense' },
  { char: '構', romanized: 'kamae', english: 'stance' },
  { char: '心', romanized: 'kokoro', english: 'heart' },
];

type Mode = 'guided' | 'timed' | 'freestyle';

export default function KanjiStroke() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [masterMsg, setMasterMsg] = useState('Choose your path, student.');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction' | 'celebration'>('neutral');

  const kanji = KANJI_SET[currentIndex % KANJI_SET.length];

  useEffect(() => {
    if (mode !== 'timed' || gameOver) return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, mode, gameOver]);

  const endGame = useCallback(() => {
    setGameOver(true);
    saveGameScore({
      game_slug: 'kanji-stroke',
      score,
      honor_earned: honor,
      max_combo: maxCombo,
      stars: score >= 200 ? 3 : score >= 100 ? 2 : 1,
      culture: 'japan',
      duration_seconds: mode === 'timed' ? 30 : 60,
    });
    addHonor(honor, 'game', 'kanji-stroke');
  }, [score, honor, maxCombo, mode]);

  const handleStroke = useCallback((accuracy: number) => {
    const points = Math.round(accuracy * (mode === 'freestyle' ? 2 : 1));
    const honorPts = accuracy >= 70 ? (mode === 'freestyle' ? 20 : 10) : 0;

    if (accuracy >= 70) {
      Sound.correct();
      setCombo(p => {
        const next = p + 1;
        if (next > maxCombo) setMaxCombo(next);
        if (next >= 3) Sound.combo();
        return next;
      });
      setMasterMsg('Excellent stroke! 素晴らしい!');
      setMasterExpr('bravo');
    } else {
      Sound.wrong();
      setCombo(0);
      setMasterMsg('Focus your energy. Try again.');
      setMasterExpr('correction');
    }

    setScore(p => p + points);
    setHonor(p => p + honorPts);
    setPopupScore(points);
    setShowPopup(true);

    setTimeout(() => {
      setCurrentIndex(p => p + 1);
      setMasterExpr('neutral');
      if (mode === 'guided' && currentIndex >= 9) endGame();
    }, 800);
  }, [mode, maxCombo, currentIndex, endGame]);

  const startMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(m === 'timed' ? 30 : 999);
    setMasterMsg(m === 'guided' ? 'Follow the red guide carefully.' : m === 'timed' ? '30 seconds. Go!' : 'From memory. Show your mastery.');
  };

  if (!mode) {
    return (
      <div className="min-h-screen culture-japan flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-noto-jp text-4xl text-dojuku-paper">漢字</h1>
        <h2 className="font-outfit text-xl font-bold text-dojuku-gold">Kanji Stroke</h2>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Trace Japanese martial arts kanji with precision and speed.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {(['guided', 'timed', 'freestyle'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => startMode(m)}
              className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px] capitalize transition-transform hover:scale-[1.02]"
              style={{ background: 'var(--gradient-fire)' }}
            >
              {m === 'guided' ? '🎯 Guided' : m === 'timed' ? '⏱ Timed (30s)' : '🧠 Freestyle'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen
        score={score}
        honorEarned={honor}
        stars={score >= 200 ? 3 : score >= 100 ? 2 : 1}
        gameName="Kanji Stroke"
        gameSlug="kanji-stroke"
        onReplay={() => {
          setMode(null); setScore(0); setHonor(0); setCombo(0); setMaxCombo(0);
          setCurrentIndex(0); setGameOver(false); setTimeLeft(30);
        }}
      />
    );
  }

  return (
    <GameShell
      culture="japan"
      gameName="Kanji Stroke"
      score={score}
      honorPoints={honor}
      timeLeft={mode === 'timed' ? timeLeft : undefined}
      maxTime={30}
      masterMessage={masterMsg}
      masterExpression={masterExpr}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-noto-jp text-5xl text-dojuku-paper mb-1">{kanji.char}</p>
          <p className="font-dm text-sm text-dojuku-paper/60">{kanji.romanized} — {kanji.english}</p>
        </div>
        {combo >= 3 && (
          <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">
            COMBO ×{combo}
          </div>
        )}
        <CalligraphyCanvas
          gridType="genkou"
          showGuide={mode === 'guided'}
          onStrokeComplete={handleStroke}
        />
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
