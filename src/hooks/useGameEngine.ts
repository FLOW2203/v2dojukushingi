import { useState, useCallback, useRef } from 'react';
import { saveGameScore, addHonor } from '../lib/supabase';
import { Sound } from '../components/games/SoundManager';

interface UseGameEngineOptions {
  gameSlug: string;
  culture: string;
  starThresholds: [number, number]; // [2-star min, 3-star min]
  maxDuration?: number;
}

export function useGameEngine({ gameSlug, culture, starThresholds, maxDuration = 60 }: UseGameEngineOptions) {
  const [score, setScore] = useState(0);
  const [honor, setHonor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupScore, setPopupScore] = useState(0);
  const [masterMsg, setMasterMsg] = useState('');
  const [masterExpr, setMasterExpr] = useState<'neutral' | 'bravo' | 'correction' | 'celebration'>('neutral');
  const startTime = useRef(Date.now());
  const savedRef = useRef(false);

  const getStars = useCallback((s: number) => {
    if (s >= starThresholds[1]) return 3;
    if (s >= starThresholds[0]) return 2;
    return 1;
  }, [starThresholds]);

  const addPoints = useCallback((points: number, honorPts: number) => {
    setScore(p => p + points);
    setHonor(p => p + honorPts);
    if (points > 0) {
      setPopupScore(points);
      setShowPopup(true);
    }
  }, []);

  const handleCorrect = useCallback((points: number, honorPts: number, message?: string) => {
    Sound.correct();
    setCombo(p => {
      const next = p + 1;
      if (next > maxCombo) setMaxCombo(next);
      if (next >= 3) Sound.combo();
      return next;
    });
    setMasterMsg(message || 'Excellent!');
    setMasterExpr('bravo');
    addPoints(points, honorPts);
  }, [maxCombo, addPoints]);

  const handleWrong = useCallback((message?: string) => {
    Sound.wrong();
    setCombo(0);
    setMasterMsg(message || 'Try again.');
    setMasterExpr('correction');
  }, []);

  const endGame = useCallback(async (finalScore?: number, finalHonor?: number, finalMaxCombo?: number) => {
    if (savedRef.current) return;
    savedRef.current = true;

    const s = finalScore ?? score;
    const h = finalHonor ?? honor;
    const mc = finalMaxCombo ?? maxCombo;
    const duration = Math.round((Date.now() - startTime.current) / 1000);

    setScore(s);
    setHonor(h);
    setGameOver(true);

    await saveGameScore({
      game_slug: gameSlug,
      score: s,
      honor_earned: h,
      max_combo: mc,
      stars: getStars(s),
      culture,
      duration_seconds: Math.min(duration, maxDuration),
    });

    if (h > 0) {
      await addHonor(h, 'game', gameSlug);
    }
  }, [score, honor, maxCombo, gameSlug, culture, maxDuration, getStars]);

  const reset = useCallback(() => {
    setScore(0);
    setHonor(0);
    setCombo(0);
    setMaxCombo(0);
    setGameOver(false);
    setShowPopup(false);
    setMasterMsg('');
    setMasterExpr('neutral');
    startTime.current = Date.now();
    savedRef.current = false;
  }, []);

  return {
    score,
    honor,
    combo,
    maxCombo,
    gameOver,
    showPopup,
    popupScore,
    masterMsg,
    masterExpr,
    setScore,
    setHonor,
    setShowPopup,
    setMasterMsg,
    setMasterExpr,
    addPoints,
    handleCorrect,
    handleWrong,
    endGame,
    reset,
    getStars,
  };
}
