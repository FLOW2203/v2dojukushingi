import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import StanceViewer from '../components/games/StanceViewer';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type Technique, type Culture } from '../types/game';
import { saveGameScore, addHonor, getTechniques } from '../lib/supabase';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fallback data if Supabase is not seeded
const FALLBACK: Technique[] = [
  { id: '1', culture: 'japan', discipline: 'karate', name_original: '空手', name_romanized: 'karate', name_english: 'empty hand', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '2', culture: 'japan', discipline: 'judo', name_original: '柔道', name_romanized: 'judo', name_english: 'gentle way', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '3', culture: 'china', discipline: 'wushu', name_original: '武术', name_romanized: 'wushu', name_english: 'martial art', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '4', culture: 'china', discipline: 'taichi', name_original: '太极', name_romanized: 'taiji', name_english: 'supreme ultimate', difficulty: 4, type: 'kata', stroke_data: null, position_description: '' },
  { id: '5', culture: 'korea', discipline: 'taekwondo', name_original: '태권도', name_romanized: 'taekwondo', name_english: 'way of fist and foot', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '6', culture: 'korea', discipline: 'hapkido', name_original: '합기도', name_romanized: 'hapkido', name_english: 'coordinated power', difficulty: 4, type: 'kata', stroke_data: null, position_description: '' },
  { id: '7', culture: 'vietnam', discipline: 'vovinam', name_original: 'Vovinam', name_romanized: 'vovinam', name_english: 'Vietnamese martial arts', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '8', culture: 'brazil', discipline: 'capoeira', name_original: 'Capoeira', name_romanized: 'capoeira', name_english: 'capoeira', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
  { id: '9', culture: 'brazil', discipline: 'bjj', name_original: 'Jiu-Jitsu', name_romanized: 'jiu-jitsu', name_english: 'Brazilian jiu-jitsu', difficulty: 4, type: 'kata', stroke_data: null, position_description: '' },
  { id: '10', culture: 'japan', discipline: 'aikido', name_original: '合気道', name_romanized: 'aikido', name_english: 'way of harmony', difficulty: 4, type: 'kata', stroke_data: null, position_description: '' },
  { id: '11', culture: 'japan', discipline: 'karate', name_original: '拳', name_romanized: 'ken', name_english: 'fist', difficulty: 1, type: 'strike', stroke_data: null, position_description: '' },
  { id: '12', culture: 'china', discipline: 'kungfu', name_original: '功夫', name_romanized: 'gongfu', name_english: 'skill/effort', difficulty: 3, type: 'kata', stroke_data: null, position_description: '' },
];

export default function StanceName() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [current, setCurrent] = useState<Technique | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    getTechniques().then(data => {
      setTechniques(data.length > 4 ? data : FALLBACK);
    });
  }, []);

  const setupQuestion = useCallback((techs: Technique[], idx: number) => {
    const pool = shuffle(techs);
    const q = pool[idx % pool.length];
    setCurrent(q);
    setTimeLeft(8);
    setAnswered(false);
    setSelectedAnswer(null);

    const wrongChoices = shuffle(pool.filter(t => t.id !== q.id)).slice(0, 3);
    const allChoices = shuffle([
      level >= 3 ? q.name_original : q.name_romanized,
      ...wrongChoices.map(t => level >= 3 ? t.name_original : t.name_romanized),
    ]);
    setChoices(allChoices);
  }, [level]);

  useEffect(() => {
    if (started && techniques.length > 4) {
      setupQuestion(techniques, questionIndex);
    }
  }, [started, techniques, questionIndex, setupQuestion]);

  useEffect(() => {
    if (!started || gameOver || answered) return;
    if (timeLeft <= 0) { handleAnswer(''); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, gameOver, answered]);

  const handleAnswer = useCallback((answer: string) => {
    if (answered || !current) return;
    setAnswered(true);
    setSelectedAnswer(answer);

    const correctAnswer = level >= 3 ? current.name_original : current.name_romanized;
    const correct = answer === correctAnswer;
    const points = correct ? 10 * (1 + Math.min(combo, 4)) : 0;
    const honorPts = correct ? 10 : 0;

    if (correct) {
      Sound.correct();
      setCombo(p => { const n = p + 1; if (n > maxCombo) setMaxCombo(n); if (n >= 3) Sound.combo(); return n; });
    } else {
      Sound.wrong();
      setCombo(0);
    }

    setScore(p => p + points);
    setHonor(p => p + honorPts);
    setPopupScore(points);
    if (points > 0) setShowPopup(true);

    setTimeout(() => {
      const next = questionIndex + 1;
      if (next >= 10) {
        setGameOver(true);
        saveGameScore({ game_slug: 'stance-name', score: score + points, honor_earned: honor + honorPts, max_combo: Math.max(maxCombo, combo + (correct ? 1 : 0)), stars: (score + points) >= 80 ? 3 : (score + points) >= 40 ? 2 : 1, culture: 'japan', duration_seconds: 80 });
        addHonor(honor + honorPts, 'game', 'stance-name');
      } else {
        setQuestionIndex(next);
      }
    }, 1000);
  }, [answered, current, level, combo, maxCombo, questionIndex, score, honor]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🥋 Stance Name</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          See a technique — pick the right name. 10 questions, 8 seconds each.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {[1, 2, 3].map(l => (
            <button key={l} onClick={() => { setLevel(l); setStarted(true); }}
              className="rounded-lg py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]"
              style={{ background: 'var(--gradient-fire)' }}>
              {l === 1 ? 'L1: Same Culture' : l === 2 ? 'L2: Mixed Cultures' : 'L3: Original Script'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honor} stars={score >= 80 ? 3 : score >= 40 ? 2 : 1} gameName="Stance Name" gameSlug="stance-name"
        onReplay={() => { setStarted(false); setScore(0); setHonor(0); setCombo(0); setMaxCombo(0); setQuestionIndex(0); setGameOver(false); }}
      />
    );
  }

  if (!current) return null;

  const correctAnswer = level >= 3 ? current.name_original : current.name_romanized;

  return (
    <GameShell culture={current.culture as Culture} gameName="Stance Name" score={score} honorPoints={honor} timeLeft={timeLeft} maxTime={8}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="font-dm text-xs text-dojuku-paper/40">{questionIndex + 1}/10</p>
        </div>

        <StanceViewer technique={current} showName={false} showOriginal={level < 3} />

        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>}

        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {choices.map(c => {
            let bg = 'bg-white/10 hover:bg-white/20';
            if (answered) {
              if (c === correctAnswer) bg = 'bg-green-600/40';
              else if (c === selectedAnswer) bg = 'bg-red-600/40';
            }
            return (
              <button
                key={c}
                onClick={() => handleAnswer(c)}
                disabled={answered}
                className={`rounded-lg px-3 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] transition-colors ${bg}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
