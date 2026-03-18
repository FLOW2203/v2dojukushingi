import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { saveGameScore, addHonor } from '../lib/supabase';

const VN_TERMS = [
  'Việt Võ Đạo', 'Vovinam', 'đấm', 'đá', 'chặt', 'gạt', 'đỡ', 'né', 'thế', 'quyền',
  'chiến lược', 'song đấu', 'tự vệ', 'vật', 'khóa', 'đòn', 'thủ', 'công', 'bước', 'thở',
];

const SPECIAL_CHARS = ['ă', 'â', 'đ', 'ê', 'ô', 'ơ', 'ư'];
const TONES = [
  { label: 'sắc ́', char: '\u0301' },
  { label: 'huyền ̀', char: '\u0300' },
  { label: 'hỏi ̉', char: '\u0309' },
  { label: 'ngã ̃', char: '\u0303' },
  { label: 'nặng ̣', char: '\u0323' },
  { label: 'none', char: '' },
];

export default function ChuVo() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [masterMsg, setMasterMsg] = useState('');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction'>('neutral');

  const term = VN_TERMS[currentIndex % VN_TERMS.length];

  const checkAnswer = useCallback(() => {
    const correct = input.trim().toLowerCase() === term.toLowerCase();
    const points = correct ? 100 : 0;
    const honorPts = correct ? 12 : 0;

    if (correct) {
      Sound.correct();
      setCombo(p => { const n = p + 1; if (n > maxCombo) setMaxCombo(n); return n; });
      setMasterMsg('Xuất sắc! Excellent!');
      setMasterExpr('bravo');
    } else {
      Sound.wrong();
      setCombo(0);
      setMasterMsg(`Correct: ${term}`);
      setMasterExpr('correction');
    }

    setScore(p => p + points);
    setHonor(p => p + honorPts);
    setPopupScore(points);
    setShowPopup(true);

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= 10) {
        setGameOver(true);
        saveGameScore({ game_slug: 'chu-vo', score: score + points, honor_earned: honor + honorPts, max_combo: Math.max(maxCombo, combo + (correct ? 1 : 0)), stars: (score + points) >= 800 ? 3 : (score + points) >= 400 ? 2 : 1, culture: 'vietnam', duration_seconds: 90 });
        addHonor(honor + honorPts, 'game', 'chu-vo');
      } else {
        setCurrentIndex(next);
        setInput('');
        setMasterExpr('neutral');
      }
    }, 1200);
  }, [input, term, currentIndex, score, honor, combo, maxCombo]);

  const addChar = (c: string) => setInput(p => p + c);
  const addTone = (t: string) => {
    if (!t || !input) return;
    setInput(p => p + t);
  };

  if (!started) {
    return (
      <div className="min-h-screen culture-vietnam flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-4xl font-bold text-dojuku-paper">Chữ Võ</h1>
        <h2 className="font-outfit text-xl text-dojuku-gold">Vietnamese Martial Terms</h2>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Type Vietnamese terms with proper diacritics. Use the special keyboard for tones.
        </p>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Begin Training
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={score >= 800 ? 3 : score >= 400 ? 2 : 1} gameName="Chữ Võ" gameSlug="chu-vo"
        onReplay={() => { setStarted(false); setScore(0); setHonor(0); setCombo(0); setMaxCombo(0); setCurrentIndex(0); setGameOver(false); setInput(''); }}
      />
    );
  }

  return (
    <GameShell culture="vietnam" gameName="Chữ Võ" score={score} honorPoints={honor} masterMessage={masterMsg} masterExpression={masterExpr}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-dm text-sm text-dojuku-paper/40 mb-1">Type this term:</p>
          <p className="font-outfit text-3xl font-bold text-dojuku-paper">{term}</p>
          <p className="font-dm text-xs text-dojuku-paper/40 mt-1">{currentIndex + 1}/10</p>
        </div>

        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>}

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') checkAnswer(); }}
          className="w-full max-w-xs rounded-lg bg-dojuku-paper px-4 py-3 text-center font-outfit text-xl text-dojuku-ink outline-none min-h-[44px]"
          placeholder="Type here..."
          autoFocus
        />

        <button onClick={checkAnswer} className="rounded-lg px-6 py-2 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Submit
        </button>

        {/* Special chars keyboard */}
        <div className="w-full max-w-xs">
          <p className="font-dm text-xs text-dojuku-paper/40 mb-2 text-center">Special Characters</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SPECIAL_CHARS.map(c => (
              <button key={c} onClick={() => addChar(c)} className="rounded bg-white/10 px-3 py-2 font-dm text-sm text-dojuku-paper min-h-[44px] min-w-[44px] hover:bg-white/20 transition-colors">
                {c}
              </button>
            ))}
          </div>
          <p className="font-dm text-xs text-dojuku-paper/40 mb-2 mt-3 text-center">Tones</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {TONES.filter(t => t.char).map(t => (
              <button key={t.label} onClick={() => addTone(t.char)} className="rounded bg-white/10 px-3 py-2 font-dm text-xs text-dojuku-paper min-h-[44px] min-w-[44px] hover:bg-white/20 transition-colors">
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
