import { useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

const DOJO_ELEMENTS = [
  { name: 'Tatami Floor', icon: '🟫', unlockAt: 1 },
  { name: 'Torii Gate', icon: '⛩️', unlockAt: 2 },
  { name: 'Weapon Rack', icon: '🗡️', unlockAt: 3 },
  { name: 'Calligraphy Scroll', icon: '📜', unlockAt: 4 },
  { name: 'Incense Burner', icon: '🪔', unlockAt: 5 },
  { name: 'Training Dummy', icon: '🎯', unlockAt: 6 },
  { name: 'Meditation Garden', icon: '🌿', unlockAt: 7 },
  { name: 'Master Painting', icon: '🖼️', unlockAt: 8 },
  { name: 'Dragon Statue', icon: '🐉', unlockAt: 9 },
  { name: 'Bell of Harmony', icon: '🔔', unlockAt: 10 },
];

const QUESTIONS = [
  { q: 'Which martial art means "empty hand"?', choices: ['Karate', 'Judo', 'Kendo', 'Aikido'], correct: 0 },
  { q: 'Capoeira originated in which country?', choices: ['Portugal', 'Brazil', 'Angola', 'Mexico'], correct: 1 },
  { q: 'What does "Dojo" mean?', choices: ['Fighting ring', 'Place of the way', 'House of strength', 'School of war'], correct: 1 },
  { q: 'Taekwondo is the national sport of...', choices: ['Japan', 'China', 'South Korea', 'Thailand'], correct: 2 },
  { q: 'What instrument is used in Capoeira?', choices: ['Drum', 'Flute', 'Berimbau', 'Gong'], correct: 2 },
  { q: 'Who created Judo?', choices: ['Funakoshi', 'Ueshiba', 'Kano', 'Oyama'], correct: 2 },
  { q: 'Vovinam originates from...', choices: ['Thailand', 'Vietnam', 'Laos', 'Cambodia'], correct: 1 },
  { q: 'What is "Ki" in martial arts?', choices: ['Speed', 'Inner energy', 'Technique', 'Strength'], correct: 1 },
  { q: 'BJJ stands for...', choices: ['Big Judo Japan', 'Brazilian Jiu-Jitsu', 'Basic Joint Jabs', 'Belt Junior Jutsu'], correct: 1 },
  { q: 'What is a "Kata"?', choices: ['A weapon', 'A belt', 'A form/pattern', 'A punch'], correct: 2 },
];

export default function DojoBuild() {
  const { score, honorEarned, isGameOver, addScore, endGame, reset } = useGameEngine('dojo-build');
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const question = QUESTIONS[qIndex];

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(idx);
    const correct = idx === question.correct;

    if (correct) {
      Sound.correct();
      setCorrectCount(p => p + 1);
      addScore(15);
      setPopupScore(15);
      setShowPopup(true);
    } else {
      Sound.wrong();
    }

    setTimeout(() => {
      const next = qIndex + 1;
      if (next >= QUESTIONS.length) {
        const finalCorrect = correctCount + (correct ? 1 : 0);
        const accuracy = Math.round((finalCorrect / QUESTIONS.length) * 100);
        endGame(accuracy);
      } else {
        setQIndex(next);
        setAnswered(false);
        setSelected(null);
      }
    }, 1000);
  }, [answered, question, qIndex, correctCount, addScore, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">🏯 Dojo Build</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Answer quiz questions to build your dojo element by element. Complete your dojo!
        </p>
        <button onClick={() => setStarted(true)} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Building
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={correctCount >= 8 ? 3 : correctCount >= 5 ? 2 : 1} gameName="Dojo Build" gameSlug="dojo-build"
        onReplay={() => { reset(); setStarted(false); setCorrectCount(0); setQIndex(0); setAnswered(false); setSelected(null); }}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Dojo Build" score={score} honorPoints={honorEarned}>
      <div className="flex flex-col items-center gap-4">
        {/* Dojo visualization */}
        <div className="flex flex-wrap justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 w-full max-w-sm">
          {DOJO_ELEMENTS.map((el, i) => (
            <div key={el.name} className={`text-2xl p-1 transition-opacity ${i < correctCount ? 'opacity-100' : 'opacity-10'}`} title={el.name}>
              {el.icon}
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-dojuku-gold">{correctCount}/10 elements</p>

        {/* Question */}
        <div className="w-full max-w-sm">
          <p className="font-outfit text-lg text-dojuku-paper text-center mb-3">{question.q}</p>
          <div className="grid grid-cols-2 gap-2">
            {question.choices.map((c, i) => {
              let bg = 'bg-white/10 hover:bg-white/20';
              if (answered) {
                if (i === question.correct) bg = 'bg-green-600/40';
                else if (i === selected) bg = 'bg-red-600/40';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`rounded-lg px-3 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] transition-colors ${bg}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <p className="font-dm text-xs text-dojuku-paper/40">{qIndex + 1}/{QUESTIONS.length}</p>
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
