import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cbmasgbbhmunzjoqbpcs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveGameScore(data: {
  game_slug: string;
  score: number;
  honor_earned: number;
  max_combo: number;
  stars: number;
  culture: string;
  duration_seconds: number;
}) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;

  const { data: result, error } = await supabase.from('game_scores').insert({
    user_id: session.session.user.id,
    ...data,
    played_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error('Error saving score:', error);
    return null;
  }
  return result;
}

export async function addHonor(amount: number, source: string, gameSlug?: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;

  const userId = session.session.user.id;

  await supabase.from('honor_transactions').insert({
    user_id: userId,
    amount,
    source,
    game_slug: gameSlug || null,
  });

  const { data: user } = await supabase
    .from('users')
    .select('honor_points')
    .eq('id', userId)
    .single();

  if (user) {
    await supabase
      .from('users')
      .update({ honor_points: user.honor_points + amount })
      .eq('id', userId);
  }

  return amount;
}

export async function getTechniques(culture?: string) {
  let query = supabase.from('techniques').select('*');
  if (culture) query = query.eq('culture', culture);
  const { data } = await query;
  return data || [];
}

export async function getQuizQuestions() {
  const { data } = await supabase.from('quiz_questions').select('*');
  return data || [];
}

export async function getLeaderboard(limit = 20) {
  const { data } = await supabase
    .from('game_scores')
    .select('user_id, score, game_slug, played_at')
    .order('score', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getUserBestScores(gameSlug: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return [];

  const { data } = await supabase
    .from('game_scores')
    .select('*')
    .eq('user_id', session.session.user.id)
    .eq('game_slug', gameSlug)
    .order('score', { ascending: false })
    .limit(5);

  return data || [];
}
