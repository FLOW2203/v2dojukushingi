import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

const TECHNIQUES = [
  'Roundhouse Kick', 'Front Punch', 'High Block', 'Side Kick',
  'Knife Hand Strike', 'Low Block', 'Back Fist', 'Crescent Kick',
  'Elbow Strike', 'Knee Strike', 'Palm Strike', 'Spinning Hook Kick',
];

interface Command {
  text: string;
  isSenseiSays: boolean;
  technique: string;
}

function generateCommands(count: number): Command[] {
  const cmds: Command[] = [];
  for (let i = 0; i < count; i++) {
    const tech = TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)];
    const isSensei = Math.random() > 0.3; // 30% traps
    cmds.push({
      text: isSensei ? `Sensei says: ${tech}` : tech,
      isSenseiSays: isSensei,
      technique: tech,
    });
  }
  return cmds;
}

export default function SenseiSays() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('sensei-says');

  const [started, setStarted] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction'>('neutral');

  const current = commands[currentIndex];

  useEffect(() => {
    if (!started || isGameOver || !current) return;
    if (timeLeft <= 0) {
      if (current.isSenseiSays) {
        handleAction(false);
      } else {
        handleAction(true); // correctly ignored trap
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, isGameOver, current]);

  const start = () => {
    reset();
    setCommands(generateCommands(20));
    setStarted(true);
    setCurrentIndex(0);
    setErrors(0);
    setTimeLeft(5);
  };

  const handleAction = useCallback((acted: boolean) => {
    if (!current || isGameOver) return;

    const correct = current.isSenseiSays ? acted : !acted;

    if (correct) {
      Sound.correct();
      addScore(10);
      setFeedback(acted ? 'Correct action!' : 'Good — trap avoided!');
      setMasterExpr('bravo');
      setPopupScore(10);
      setShowPopup(true);
    } else {
      Sound.wrong();
      breakCombo();
      const newErrors = errors + 1;
      setErrors(newErrors);
      setFeedback(acted ? 'Trap! Sensei didn\'t say!' : 'You should have acted!');
      setMasterExpr('correction');

      if (newErrors >= 3) {
        endGame();
        return;
      }
    }

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= commands.length) {
        endGame();
      } else {
        setCurrentIndex(next);
        setTimeLeft(5);
        setMasterExpr('neutral');
        setFeedback('');
      }
    }, 1000);
  }, [current, isGameOver, errors, currentIndex, commands.length, addScore, breakCombo, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🗣 Sensei Says</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Follow commands that start with "Sensei says". Don't fall for traps! 3 errors = game over.
        </p>
        <button onClick={start} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Begin
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 150 ? 3 : score >= 80 ? 2 : 1} gameName="Sensei Says" gameSlug="sensei-says"
        onReplay={start}
      />
    );
  }

  if (!current) return null;

  return (
    <GameShell culture="japan" gameName="Sensei Says" score={score} honorPoints={honorEarned} timeLeft={timeLeft} maxTime={5} masterMessage={feedback} masterExpression={masterExpr}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-xl ${i < errors ? 'opacity-100' : 'opacity-20'}`}>❌</span>
          ))}
        </div>

        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">COMBO ×{combo}</div>}

        <div className={`rounded-xl p-6 text-center max-w-sm ${current.isSenseiSays ? 'bg-dojuku-gold/10 border border-dojuku-gold/20' : 'bg-dojuku-red/10 border border-dojuku-red/20'}`}>
          <p className="font-outfit text-xl font-bold text-dojuku-paper">{current.text}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleAction(true)}
            className="rounded-lg px-8 py-3 font-outfit font-semibold text-white min-h-[44px] bg-green-600 hover:bg-green-500 transition-colors"
          >
            Do It!
          </button>
          <button
            onClick={() => handleAction(false)}
            className="rounded-lg px-8 py-3 font-outfit font-semibold text-white min-h-[44px] bg-red-600 hover:bg-red-500 transition-colors"
          >
            Skip
          </button>
        </div>

        <p className="font-dm text-xs text-dojuku-paper/40">{currentIndex + 1}/{commands.length}</p>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
