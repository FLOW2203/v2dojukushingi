import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import CalligraphyCanvas from '../components/games/CalligraphyCanvas';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { BELT_NAMES, BELT_COLORS, type BeltLevel } from '../types/game';
import { useGameEngine } from '../hooks/useGameEngine';

interface Stage {
  type: 'quiz' | 'write' | 'position';
  question?: string;
  choices?: string[];
  correct?: number;
  writeChar?: string;
  positionName?: string;
  positionChoices?: string[];
  positionCorrect?: number;
}

const STAGES: Stage[] = [
  { type: 'quiz', question: 'What color is the first belt?', choices: ['White', 'Yellow', 'Red', 'Black'], correct: 0 },
  { type: 'write', writeChar: '道' },
  { type: 'position', positionName: 'Front Stance', positionChoices: ['Zenkutsu-dachi', 'Kiba-dachi', 'Kokutsu-dachi', 'Neko-ashi-dachi'], positionCorrect: 0 },
  { type: 'quiz', question: 'Which art uses the berimbau?', choices: ['Karate', 'Capoeira', 'Taekwondo', 'Kung Fu'], correct: 1 },
  { type: 'write', writeChar: '武' },
  { type: 'position', positionName: 'Horse Stance', positionChoices: ['Neko-ashi-dachi', 'Zenkutsu-dachi', 'Kiba-dachi', 'Sanchin-dachi'], positionCorrect: 2 },
  { type: 'quiz', question: '"Judo" means...', choices: ['Hard way', 'Gentle way', 'Fast way', 'Empty way'], correct: 1 },
];

export default function BeltPath() {
  const { score, honorEarned, isGameOver, addScore, endGame, reset } = useGameEngine('belt-path');
  const [started, setStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [beltLevel, setBeltLevel] = useState<BeltLevel>(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const stage = STAGES[stageIndex];

  const advance = useCallback((pts: number) => {
    if (pts > 0) {
      addScore(pts);
      setPopupScore(pts);
      setShowPopup(true);
    }

    setTimeout(() => {
      const next = stageIndex + 1;
      if (next >= STAGES.length) {
        const newBelt = Math.min(6, beltLevel + 1) as BeltLevel;
        setBeltLevel(newBelt);
        endGame();
        Sound.levelUp();
      } else {
        setStageIndex(next);
        setAnswered(false);
      }
    }, 800);
  }, [stageIndex, beltLevel, addScore, endGame]);

  const handleQuizAnswer = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = idx === stage.correct;
    if (correct) { Sound.correct(); advance(20); }
    else { Sound.wrong(); advance(0); }
  };

  const handlePositionAnswer = (idx: number) => {
    if (answered) return;
    setAnswered(true);
    const correct = idx === stage.positionCorrect;
    if (correct) { Sound.correct(); advance(20); }
    else { Sound.wrong(); advance(0); }
  };

  const handleStroke = (accuracy: number) => {
    if (accuracy >= 50) { Sound.correct(); advance(15); }
    else { Sound.wrong(); advance(5); }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🛤 Belt Path</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          RPG-style journey: answer quizzes, trace characters, identify positions. Earn your next belt!
        </p>
        <div className="flex items-center gap-2">
          <div className="h-6 w-12 rounded" style={{ backgroundColor: BELT_COLORS[beltLevel] }} />
          <span className="font-outfit text-sm text-dojuku-paper">{BELT_NAMES[beltLevel]} Belt</span>
        </div>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Begin Journey
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 100 ? 3 : score >= 50 ? 2 : 1} gameName="Belt Path" gameSlug="belt-path"
        onReplay={() => { reset(); setStarted(false); setStageIndex(0); setAnswered(false); }}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Belt Path" score={score} honorPoints={honorEarned}>
      <div className="flex flex-col items-center gap-4">
        {/* Path visualization */}
        <div className="flex gap-1 mb-2">
          {STAGES.map((_, i) => (
            <div key={i} className={`h-2 w-6 rounded-full ${i < stageIndex ? 'bg-dojuku-gold' : i === stageIndex ? 'bg-dojuku-red' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="font-mono text-xs text-dojuku-gold">Stage {stageIndex + 1}/{STAGES.length}</p>

        {stage.type === 'quiz' && (
          <div className="w-full max-w-sm">
            <p className="font-outfit text-lg text-dojuku-paper text-center mb-4">{stage.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {stage.choices!.map((c, i) => (
                <button key={i} onClick={() => handleQuizAnswer(i)} disabled={answered}
                  className="rounded-lg bg-white/10 px-3 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] hover:bg-white/20 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage.type === 'write' && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-dm text-sm text-dojuku-paper/60">Trace this character:</p>
            <p className="font-noto-jp text-5xl text-dojuku-paper">{stage.writeChar}</p>
            <CalligraphyCanvas gridType="genkou" onStrokeComplete={handleStroke} width={250} height={250} />
          </div>
        )}

        {stage.type === 'position' && (
          <div className="w-full max-w-sm">
            <p className="font-outfit text-lg text-dojuku-paper text-center mb-2">Identify this stance:</p>
            <p className="font-outfit text-2xl font-bold text-dojuku-gold text-center mb-4">{stage.positionName}</p>
            <div className="grid grid-cols-2 gap-2">
              {stage.positionChoices!.map((c, i) => (
                <button key={i} onClick={() => handlePositionAnswer(i)} disabled={answered}
                  className="rounded-lg bg-white/10 px-3 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] hover:bg-white/20 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
