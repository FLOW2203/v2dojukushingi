import { useState, useCallback, useRef } from 'react'
import { supabase, getLocalHonor } from '../lib/supabase'

interface GameState {
  score: number
  combo: number
  maxCombo: number
  accuracy: number
  honorEarned: number
  isPlaying: boolean
  isGameOver: boolean
}

const HONOR_PER_POINT = 0.1 // 1 honor per 10 points

export function useGameEngine(gameSlug: string) {
  const [state, setState] = useState<GameState>({
    score: 0, combo: 0, maxCombo: 0, accuracy: 0,
    honorEarned: 0, isPlaying: false, isGameOver: false
  })
  const savedRef = useRef(false)

  const addScore = useCallback((points: number) => {
    setState(prev => {
      const newCombo = prev.combo + 1
      const multiplier = Math.min(1 + (newCombo - 1) * 0.1, 3) // max 3x
      const earned = Math.round(points * multiplier)
      const newScore = prev.score + earned
      return {
        ...prev,
        score: newScore,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        honorEarned: Math.round(newScore * HONOR_PER_POINT)
      }
    })
  }, [])

  const breakCombo = useCallback(() => {
    setState(prev => ({ ...prev, combo: 0 }))
  }, [])

  const endGame = useCallback(async (finalAccuracy?: number) => {
    if (savedRef.current) return
    savedRef.current = true

    setState(prev => {
      const updated = {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        accuracy: finalAccuracy ?? prev.accuracy,
      }
      // Fire-and-forget save
      saveGameScore(gameSlug, updated)
      return updated
    })
  }, [gameSlug])

  const startGame = useCallback(() => {
    savedRef.current = false
    setState({
      score: 0, combo: 0, maxCombo: 0, accuracy: 0,
      honorEarned: 0, isPlaying: true, isGameOver: false
    })
  }, [])

  const reset = useCallback(() => {
    savedRef.current = false
    setState({
      score: 0, combo: 0, maxCombo: 0, accuracy: 0,
      honorEarned: 0, isPlaying: false, isGameOver: false
    })
  }, [])

  return {
    ...state,
    addScore,
    breakCombo,
    endGame,
    startGame,
    reset,
  }
}

async function saveGameScore(gameSlug: string, state: GameState) {
  const stars = state.score >= 200 ? 3 : state.score >= 100 ? 2 : 1

  // Update local best
  const key = `dojuku_best_${gameSlug}`
  const existing = JSON.parse(localStorage.getItem(key) || '{"score":0,"stars":0,"plays":0}')
  localStorage.setItem(key, JSON.stringify({
    score: Math.max(existing.score, state.score),
    stars: Math.max(existing.stars, stars),
    plays: (existing.plays || 0) + 1,
  }))

  // Track played games
  const played = JSON.parse(localStorage.getItem('dojuku_played_games') || '[]')
  if (!played.includes(gameSlug)) {
    played.push(gameSlug)
    localStorage.setItem('dojuku_played_games', JSON.stringify(played))
  }

  // Update local honor
  if (state.honorEarned > 0) {
    const currentLocal = getLocalHonor()
    localStorage.setItem('dojuku_total_honor', String(currentLocal + state.honorEarned))
  }

  if (!supabase) {
    // Offline: save to localStorage
    const offlineKey = 'dojuku_offline_scores'
    const offlineScores = JSON.parse(localStorage.getItem(offlineKey) || '[]')
    offlineScores.push({ gameSlug, ...state, playedAt: new Date().toISOString() })
    localStorage.setItem(offlineKey, JSON.stringify(offlineScores))
    return
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Save score
    await supabase.from('game_scores').insert({
      user_id: user.id,
      game_slug: gameSlug,
      score: state.score,
      honor_earned: state.honorEarned,
      max_combo: state.maxCombo,
      stars,
      played_at: new Date().toISOString(),
    })

    // 2. Add honor transaction
    if (state.honorEarned > 0) {
      await supabase.from('honor_transactions').insert({
        user_id: user.id,
        amount: state.honorEarned,
        source: 'game',
        game_slug: gameSlug,
      })

      // 3. Increment user stats (trigger handles belt)
      await supabase.rpc('increment_user_stats', {
        p_user_id: user.id,
        p_honor: state.honorEarned,
        p_games: 1,
      })
    }
  } catch (err) {
    console.error('Failed to save score:', err)
    // Fallback offline
    const offlineKey = 'dojuku_offline_scores'
    const offlineScores = JSON.parse(localStorage.getItem(offlineKey) || '[]')
    offlineScores.push({ gameSlug, ...state, playedAt: new Date().toISOString() })
    localStorage.setItem(offlineKey, JSON.stringify(offlineScores))
  }
}
