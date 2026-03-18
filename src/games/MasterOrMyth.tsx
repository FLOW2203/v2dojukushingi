import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { type QuizQuestion } from '../types/game';
import { getQuizQuestions } from '../lib/supabase';
import { useGameEngine } from '../hooks/useGameEngine';

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  { id: '1', statement_en: 'Karate originated in Okinawa, Japan.', is_true: true, category: 'history', culture: 'japan' },
  { id: '2', statement_en: 'A black belt means you have mastered the art.', is_true: false, category: 'general', culture: null },
  { id: '3', statement_en: 'Judo was created by Jigoro Kano in 1882.', is_true: true, category: 'history', culture: 'japan' },
  { id: '4', statement_en: 'Capoeira was developed by enslaved Africans in Brazil.', is_true: true, category: 'history', culture: 'brazil' },
  { id: '5', statement_en: 'Kung Fu is a single martial art style.', is_true: false, category: 'general', culture: 'china' },
  { id: '6', statement_en: 'Tai Chi was originally developed as a martial art.', is_true: true, category: 'history', culture: 'china' },
  { id: '7', statement_en: 'Brazilian Jiu-Jitsu focuses primarily on striking.', is_true: false, category: 'general', culture: 'brazil' },
  { id: '8', statement_en: 'Vovinam was founded in 1938 in Hanoi, Vietnam.', is_true: true, category: 'history', culture: 'vietnam' },
  { id: '9', statement_en: 'Taekwondo means "the way of the hand and foot".', is_true: true, category: 'language', culture: 'korea' },
  { id: '10', statement_en: 'Kendo practitioners use real swords for training.', is_true: false, category: 'general', culture: 'japan' },
  { id: '11', statement_en: 'Aikido emphasizes redirecting an attacker\'s energy.', is_true: true, category: 'technique', culture: 'japan' },
  { id: '12', statement_en: 'All martial arts originated in East Asia.', is_true: false, category: 'general', culture: null },
  { id: '13', statement_en: 'The ginga is the fundamental movement in Capoeira.', is_true: true, category: 'technique', culture: 'brazil' },
  { id: '14', statement_en: 'Meditation is an important part of many martial arts.', is_true: true, category: 'general', culture: null },
  { id: '15', statement_en: 'Sumo is a form of Taekwondo.', is_true: false, category: 'general', culture: 'japan' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MasterOrMyth() {
  const { score, combo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('master-or-myth');

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    getQuizQuestions().then(data => {
      if (data.length >= 10) setQuestions(shuffle(data).slice(0, 15));
      else setQuestions(shuffle(FALLBACK_QUESTIONS));
    });
  }, []);

  useEffect(() => {
    if (!started || isGameOver || answered) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, isGameOver, answered]);

  const handleAnswer = useCallback((answer: boolean | null) => {
    if (answered) return;
    setAnswered(true);
    const q = questions[currentIndex];
    const correct = answer === q.is_true;
    setLastCorrect(correct);

    if (correct) {
      Sound.correct();
      addScore(10);
      setPopupScore(10);
      setShowPopup(true);
    } else {
      Sound.wrong();
      breakCombo();
    }

    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= questions.length) {
        endGame();
      } else {
        setCurrentIndex(next);
        setTimeLeft(10);
        setAnswered(false);
        setLastCorrect(null);
      }
    }, 1200);
  }, [answered, questions, currentIndex, addScore, breakCombo, endGame]);

  if (!started || !questions.length) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">❓ Master or Myth</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          True or false? Test your martial arts knowledge! 10 seconds per question.
        </p>
        <button onClick={() => { reset(); setStarted(true); }} disabled={!questions.length}
          className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px] disabled:opacity-50"
          style={{ background: 'var(--gradient-fire)' }}>
          Start Quiz
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 120 ? 3 : score >= 60 ? 2 : 1} gameName="Master or Myth" gameSlug="master-or-myth"
        onReplay={() => { reset(); setStarted(false); setCurrentIndex(0); setQuestions(shuffle(questions)); }}
      />
    );
  }

  const q = questions[currentIndex];

  return (
    <GameShell culture="japan" gameName="Master or Myth" score={score} honorPoints={honorEarned} timeLeft={timeLeft} maxTime={10}>
      <div className="flex flex-col items-center gap-6">
        <p className="font-mono text-sm text-dojuku-gold">{currentIndex + 1}/{questions.length}</p>
        {combo >= 3 && <div className="animate-ki-energy rounded-full px-3 py-1 font-mono text-xs text-dojuku-gold">STREAK x{combo}</div>}

        <div className={`rounded-xl p-6 text-center max-w-sm transition-colors ${
          lastCorrect === true ? 'bg-green-600/10 border border-green-500/30' :
          lastCorrect === false ? 'bg-red-600/10 border border-red-500/30' :
          'bg-white/5 border border-white/10'
        }`}>
          <p className="font-outfit text-lg text-dojuku-paper">{q.statement_en}</p>
        </div>

        {!answered ? (
          <div className="flex gap-4">
            <button onClick={() => handleAnswer(true)}
              className="rounded-lg px-8 py-3 font-outfit font-semibold text-white min-h-[44px] bg-green-600 hover:bg-green-500 transition-colors">
              ✓ True
            </button>
            <button onClick={() => handleAnswer(false)}
              className="rounded-lg px-8 py-3 font-outfit font-semibold text-white min-h-[44px] bg-red-600 hover:bg-red-500 transition-colors">
              ✕ False
            </button>
          </div>
        ) : (
          <p className={`font-outfit text-lg ${lastCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {lastCorrect ? 'Correct!' : `Wrong - the answer is ${q.is_true ? 'True' : 'False'}`}
          </p>
        )}
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
