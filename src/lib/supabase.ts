import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing - running in offline mode')
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// ---------- Offline storage keys ----------

const OFFLINE_SCORES_KEY = 'dojuku_offline_scores'
const OFFLINE_HONOR_KEY = 'dojuku_offline_honor'
const LOCAL_HONOR_KEY = 'dojuku_total_honor'
const PLAYED_GAMES_KEY = 'dojuku_played_games'

// ---------- Auth helpers ----------

export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export async function ensureUserProfile() {
  if (!supabase) return null
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (data) return data

  const { data: newUser } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      display_name: user.email?.split('@')[0] || 'Warrior',
    })
    .select()
    .single()

  return newUser
}

export async function getUserProfile() {
  if (!supabase) return null
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

// ---------- Score management ----------

interface ScorePayload {
  game_slug: string
  score: number
  honor_earned: number
  max_combo: number
  stars: number
  culture: string
  duration_seconds: number
}

export async function saveGameScore(data: ScorePayload) {
  // Always update local best
  updateLocalBestScore(data.game_slug, data.score, data.stars)

  const user = await getCurrentUser()

  if (!user || !supabase) {
    // Offline: queue for later sync
    const existing = JSON.parse(localStorage.getItem(OFFLINE_SCORES_KEY) || '[]')
    existing.push({ ...data, played_at: new Date().toISOString() })
    localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(existing))
    return null
  }

  try {
    const { data: result, error } = await supabase.from('game_scores').insert({
      user_id: user.id,
      ...data,
      played_at: new Date().toISOString(),
    }).select().single()

    if (error) throw error
    return result
  } catch (err) {
    console.error('Error saving score:', err)
    const existing = JSON.parse(localStorage.getItem(OFFLINE_SCORES_KEY) || '[]')
    existing.push({ ...data, played_at: new Date().toISOString() })
    localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(existing))
    return null
  }
}

function updateLocalBestScore(gameSlug: string, score: number, stars: number) {
  const key = `dojuku_best_${gameSlug}`
  const existing = JSON.parse(localStorage.getItem(key) || '{"score":0,"stars":0,"plays":0}')
  localStorage.setItem(key, JSON.stringify({
    score: Math.max(existing.score, score),
    stars: Math.max(existing.stars, stars),
    plays: (existing.plays || 0) + 1,
  }))

  const played = JSON.parse(localStorage.getItem(PLAYED_GAMES_KEY) || '[]')
  if (!played.includes(gameSlug)) {
    played.push(gameSlug)
    localStorage.setItem(PLAYED_GAMES_KEY, JSON.stringify(played))
  }
}

export function getLocalBestScore(gameSlug: string): { score: number; stars: number; plays: number } {
  const key = `dojuku_best_${gameSlug}`
  return JSON.parse(localStorage.getItem(key) || '{"score":0,"stars":0,"plays":0}')
}

export function getPlayedGames(): string[] {
  return JSON.parse(localStorage.getItem(PLAYED_GAMES_KEY) || '[]')
}

export function getLocalHonor(): number {
  return parseInt(localStorage.getItem(LOCAL_HONOR_KEY) || '0', 10)
}

// ---------- Honor management ----------

export async function addHonor(amount: number, source: string, gameSlug?: string) {
  if (amount <= 0) return 0

  // Always update local honor
  const currentLocal = getLocalHonor()
  localStorage.setItem(LOCAL_HONOR_KEY, String(currentLocal + amount))

  const user = await getCurrentUser()
  if (!user || !supabase) {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_HONOR_KEY) || '[]')
    existing.push({ amount, source, game_slug: gameSlug || null, created_at: new Date().toISOString() })
    localStorage.setItem(OFFLINE_HONOR_KEY, JSON.stringify(existing))
    return amount
  }

  try {
    await supabase.from('honor_transactions').insert({
      user_id: user.id,
      amount,
      source,
      game_slug: gameSlug || null,
    })

    // Use RPC to atomically increment user stats
    await supabase.rpc('increment_user_stats', {
      p_user_id: user.id,
      p_honor: amount,
      p_games: source === 'game' ? 1 : 0,
    })
  } catch (err) {
    console.error('Error adding honor:', err)
    const existing = JSON.parse(localStorage.getItem(OFFLINE_HONOR_KEY) || '[]')
    existing.push({ amount, source, game_slug: gameSlug || null, created_at: new Date().toISOString() })
    localStorage.setItem(OFFLINE_HONOR_KEY, JSON.stringify(existing))
  }

  return amount
}

// ---------- Sync offline data ----------

export async function syncOfflineData() {
  if (!supabase) return
  const user = await getCurrentUser()
  if (!user) return

  // Sync scores
  const offlineScores: ScorePayload[] = JSON.parse(localStorage.getItem(OFFLINE_SCORES_KEY) || '[]')
  if (offlineScores.length > 0) {
    for (const scoreData of offlineScores) {
      await supabase.from('game_scores').insert({ user_id: user.id, ...scoreData })
    }
    localStorage.removeItem(OFFLINE_SCORES_KEY)
  }

  // Sync honor
  const offlineHonor: { amount: number; source: string; game_slug: string | null; created_at: string }[] =
    JSON.parse(localStorage.getItem(OFFLINE_HONOR_KEY) || '[]')
  if (offlineHonor.length > 0) {
    let totalHonor = 0
    let totalGames = 0
    for (const tx of offlineHonor) {
      await supabase.from('honor_transactions').insert({ user_id: user.id, ...tx })
      totalHonor += tx.amount
      if (tx.source === 'game') totalGames++
    }

    if (totalHonor > 0) {
      await supabase.rpc('increment_user_stats', {
        p_user_id: user.id,
        p_honor: totalHonor,
        p_games: totalGames,
      })
    }
    localStorage.removeItem(OFFLINE_HONOR_KEY)
  }
}

// ---------- Data queries ----------

export async function getTechniques(culture?: string) {
  if (!supabase) return []
  let query = supabase.from('techniques').select('*')
  if (culture) query = query.eq('culture', culture)
  const { data } = await query
  return data || []
}

export async function getQuizQuestions(culture?: string) {
  if (!supabase) return []
  let query = supabase.from('quiz_questions').select('*')
  if (culture) query = query.eq('culture', culture)
  const { data } = await query
  return data || []
}

export async function getLeaderboard(limit = 50) {
  if (!supabase) return []
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit)
  return data || []
}

export async function getGameLeaderboard(gameSlug: string, limit = 20) {
  if (!supabase) return []
  const { data } = await supabase
    .from('game_scores')
    .select('user_id, score, max_combo, stars, played_at')
    .eq('game_slug', gameSlug)
    .order('score', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getUserBestScores(gameSlug: string) {
  if (!supabase) return []
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('game_scores')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_slug', gameSlug)
    .order('score', { ascending: false })
    .limit(5)

  return data || []
}

export async function getUserStats() {
  if (!supabase) return null
  const user = await getCurrentUser()
  if (!user) return null

  const { data: scores } = await supabase
    .from('game_scores')
    .select('game_slug, score, stars, culture')
    .eq('user_id', user.id)

  if (!scores) return null

  const uniqueGames = new Set(scores.map(s => s.game_slug))
  const uniqueCultures = new Set(scores.map(s => s.culture).filter(Boolean))

  return {
    totalGames: scores.length,
    uniqueGames: uniqueGames.size,
    uniqueCultures: uniqueCultures.size,
    bestScorePerGame: [...uniqueGames].reduce((acc, slug) => {
      const gameScores = scores.filter(s => s.game_slug === slug)
      acc[slug] = Math.max(...gameScores.map(s => s.score))
      return acc
    }, {} as Record<string, number>),
  }
}

export async function getUserAchievements() {
  if (!supabase) return []
  const user = await getCurrentUser()
  if (!user) return []

  const { data } = await supabase
    .from('achievements')
    .select('achievement_key, unlocked_at')
    .eq('user_id', user.id)

  return data || []
}

export async function getAchievementDefinitions() {
  if (!supabase) return []
  const { data } = await supabase
    .from('achievement_definitions')
    .select('*')
  return data || []
}
