import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

const HANZI_SET = [
  { char: '武术', pinyin: 'wushu', english: 'martial art', kanjiEquiv: '武術' },
  { char: '太极', pinyin: 'taiji', english: 'supreme ultimate', kanjiEquiv: '太極' },
  { char: '功夫', pinyin: 'gongfu', english: 'skill/effort', kanjiEquiv: null },
  { char: '气功', pinyin: 'qigong', english: 'breath work', kanjiEquiv: '気功' },
  { char: '拳', pinyin: 'quan', english: 'fist', kanjiEquiv: '拳' },
  { char: '掌', pinyin: 'zhang', english: 'palm', kanjiEquiv: '掌' },
  { char: '腿', pinyin: 'tui', english: 'leg', kanjiEquiv: null },
  { char: '踢', pinyin: 'ti', english: 'kick', kanjiEquiv: null },
  { char: '挡', pinyin: 'dang', english: 'block', kanjiEquiv: null },
  { char: '推', pinyin: 'tui', english: 'push', kanjiEquiv: '推' },
  { char: '拉', pinyin: 'la', english: 'pull', kanjiEquiv: '拉' },
  { char: '劈', pinyin: 'pi', english: 'chop', kanjiEquiv: null },
  { char: '刺', pinyin: 'ci', english: 'pierce', kanjiEquiv: '刺' },
  { char: '勾', pinyin: 'gou', english: 'hook', kanjiEquiv: null },
  { char: '扫', pinyin: 'sao', english: 'sweep', kanjiEquiv: null },
  { char: '弹', pinyin: 'tan', english: 'flick', kanjiEquiv: null },
  { char: '架', pinyin: 'jia', english: 'frame', kanjiEquiv: '架' },
  { char: '闪', pinyin: 'shan', english: 'dodge', kanjiEquiv: null },
  { char: '步', pinyin: 'bu', english: 'step', kanjiEquiv: '歩' },
  { char: '桩', pinyin: 'zhuang', english: 'post', kanjiEquiv: null },
];

export default function HanziMaster() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('hanzi-master');

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [masterMsg, setMasterMsg] = useState('Master Chen awaits your brushwork.');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction' | 'celebration'>('neutral');

  const hanzi = HANZI_SET[currentIndex % HANZI_SET.length];

  const handleStroke = useCallback((accuracy: number) => {
    const points = Math.round(accuracy);
    const bonusPoints = hanzi.kanjiEquiv ? 5 : 0;

    if (accuracy >= 70) {
      Sound.correct();
      addScore(points + bonusPoints);
      setMasterMsg('Very good. Your ink flows well.');
      setMasterExpr('bravo');

      if (hanzi.kanjiEquiv) {
        setShowComparison(true);
        setTimeout(() => setShowComparison(false), 2000);
      }
    } else {
      Sound.wrong();
      breakCombo();
      setMasterMsg('Steady your hand. Focus.');
      setMasterExpr('correction');
    }

    setPopupScore(points + bonusPoints);
    setShowPopup(true);

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= 10) endGame();
      else setCurrentIndex(next);
      setMasterExpr('neutral');
    }, hanzi.kanjiEquiv ? 2500 : 800);
  }, [currentIndex, hanzi, addScore, breakCombo, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen culture-china flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-noto-cn text-4xl text-dojuku-paper">汉字</h1>
        <h2 className="font-outfit text-xl font-bold text-dojuku-gold">Hanzi Master</h2>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Trace Chinese martial arts characters on the tian ge grid.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px] transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--gradient-fire)' }}
        >
          Begin Training
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen
        score={score} honorEarned={honorEarned}
        stars={score >= 200 ? 3 : score >= 100 ? 2 : 1}
        gameName="Hanzi Master" gameSlug="hanzi-master"
        onReplay={() => { reset(); setStarted(false); setCurrentIndex(0); }}
      />
    );
  }

  return (
    <GameShell culture="china" gameName="Hanzi Master" score={score} honorPoints={honorEarned} masterMessage={masterMsg} masterExpression={masterExpr}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-noto-cn text-5xl text-dojuku-paper mb-1">{hanzi.char}</p>
          <p className="font-dm text-sm text-dojuku-paper/60">{hanzi.pinyin} — {hanzi.english}</p>
        </div>

        {showComparison && hanzi.kanjiEquiv && (
          <div className="animate-paper-unfold rounded-lg bg-white/5 border border-dojuku-gold/20 px-4 py-2 text-center">
            <p className="font-dm text-xs text-dojuku-gold mb-1">Kanji ↔ Hanzi comparison</p>
            <div className="flex items-center justify-center gap-4">
              <span className="font-noto-cn text-2xl text-dojuku-paper">{hanzi.char}</span>
              <span className="text-dojuku-gold">↔</span>
              <span className="font-noto-jp text-2xl text-dojuku-paper">{hanzi.kanjiEquiv}</span>
            </div>
            <p className="font-mono text-xs text-dojuku-gold mt-1">+5 bonus 名誉</p>
          </div>
        )}

        {combo >= 3 && (
          <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>
        )}

        <CalligraphyCanvas gridType="tiange" onStrokeComplete={handleStroke} />
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
