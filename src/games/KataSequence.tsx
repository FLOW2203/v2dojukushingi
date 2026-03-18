import { useState, useCallback, useEffect } from 'react';
import GameShell from '../components/games/GameShell';
import ScorePopup from '../components/games/ScorePopup';
import GameOverScreen from '../components/games/GameOverScreen';
import { Sound } from '../components/games/SoundManager';
import { useGameEngine } from '../hooks/useGameEngine';

const MOVES = [
  { id: 1, name: 'Front Kick', jp: '前蹴り' },
  { id: 2, name: 'Punch', jp: '突き' },
  { id: 3, name: 'Block', jp: '受け' },
  { id: 4, name: 'Side Kick', jp: '横蹴り' },
  { id: 5, name: 'Elbow', jp: '肘打ち' },
  { id: 6, name: 'Knife Hand', jp: '手刀' },
  { id: 7, name: 'Back Fist', jp: '裏拳' },
  { id: 8, name: 'Knee Strike', jp: '膝蹴り' },
  { id: 9, name: 'Sweep', jp: '払い' },
  { id: 10, name: 'Throw', jp: '投げ' },
];

function getSequence(length: number) {
  const result: typeof MOVES[0][] = [];
  const pool = [...MOVES];
  for (let i = 0; i < length; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result;
}

export default function KataSequence() {
  const { score, combo, maxCombo, honorEarned, isGameOver, addScore, breakCombo, endGame, reset } = useGameEngine('kata-sequence');

  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<typeof MOVES[0][]>([]);
  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [showIndex, setShowIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const seqLength = round < 3 ? 3 : round < 6 ? 5 : 8;

  const startRound = useCallback(() => {
    const seq = getSequence(seqLength);
    setSequence(seq);
    setPhase('show');
    setShowIndex(0);
    setInputIndex(0);
    setFeedback('Watch carefully...');
  }, [seqLength]);

  useEffect(() => {
    if (started && !isGameOver && sequence.length === 0) startRound();
  }, [started, isGameOver, sequence.length, startRound]);

  useEffect(() => {
    if (phase !== 'show' || !sequence.length) return;
    if (showIndex >= sequence.length) {
      setTimeout(() => { setPhase('input'); setFeedback('Now reproduce!'); }, 500);
      return;
    }
    const t = setTimeout(() => setShowIndex(p => p + 1), 800);
    return () => clearTimeout(t);
  }, [phase, showIndex, sequence.length]);

  const handleInput = useCallback((move: typeof MOVES[0]) => {
    if (phase !== 'input') return;
    const expected = sequence[inputIndex];
    if (move.id === expected.id) {
      Sound.correct();
      const next = inputIndex + 1;
      setInputIndex(next);
      if (next >= sequence.length) {
        const pts = seqLength * 15;
        addScore(pts);
        setPopupScore(pts);
        setShowPopup(true);
        setFeedback('Perfect sequence!');

        setTimeout(() => {
          const nextRound = round + 1;
          if (nextRound >= 9) {
            endGame();
          } else {
            setRound(nextRound);
            setSequence([]);
          }
        }, 1000);
      }
    } else {
      Sound.wrong();
      breakCombo();
      setFeedback(`Wrong! Expected: ${expected.name}`);
      setTimeout(() => {
        endGame();
      }, 1000);
    }
  }, [phase, sequence, inputIndex, seqLength, round, addScore, breakCombo, endGame]);

  if (!started) {
    return (
      <div className="min-h-screen bg-dojuku-dark flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-outfit text-3xl font-bold text-dojuku-gold">📋 Kata Sequence</h1>
        <p className="font-dm text-sm text-dojuku-paper/60 text-center max-w-xs">
          Watch the sequence of techniques, then reproduce them in order. Sequences get longer!
        </p>
        <button onClick={() => { reset(); setStarted(true); setRound(0); setSequence([]); }} className="rounded-lg px-8 py-3 font-outfit font-semibold text-dojuku-dark min-h-[44px]" style={{ background: 'var(--gradient-fire)' }}>
          Start Kata
        </button>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameOverScreen score={score} honorEarned={honorEarned} stars={score >= 400 ? 3 : score >= 200 ? 2 : 1} gameName="Kata Sequence" gameSlug="kata-sequence"
        onReplay={() => { setStarted(false); reset(); setRound(0); setSequence([]); }}
      />
    );
  }

  return (
    <GameShell culture="japan" gameName="Kata Sequence" score={score} honorPoints={honorEarned}>
      <div className="flex flex-col items-center gap-4">
        <p className="font-mono text-sm text-dojuku-gold">Round {round + 1}/9 — Sequence of {seqLength}</p>
        <p className="font-dm text-sm text-dojuku-paper/60">{feedback}</p>

        {phase === 'show' && (
          <div className="h-24 flex items-center justify-center">
            {showIndex < sequence.length && (
              <div className="animate-stance-reveal text-center">
                <p className="font-noto-jp text-3xl text-dojuku-paper">{sequence[showIndex].jp}</p>
                <p className="font-outfit text-lg text-dojuku-gold">{sequence[showIndex].name}</p>
              </div>
            )}
          </div>
        )}

        {phase === 'input' && (
          <>
            <div className="flex gap-1 mb-2">
              {sequence.map((_, i) => (
                <div key={i} className={`h-2 w-6 rounded-full ${i < inputIndex ? 'bg-green-500' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {MOVES.slice(0, seqLength + 2).map(move => (
                <button
                  key={move.id}
                  onClick={() => handleInput(move)}
                  className="rounded-lg bg-white/10 px-3 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] hover:bg-white/20 transition-colors"
                >
                  <span className="font-noto-jp text-xs opacity-60">{move.jp}</span>
                  <br />
                  {move.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <ScorePopup score={popupScore} visible={showPopup} onDone={() => setShowPopup(false)} />
    </GameShell>
  );
}
