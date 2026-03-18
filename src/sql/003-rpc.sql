-- DOJUKU SHINGI -- RPC Functions
-- Supabase: cbmasgbbhmunzjoqbpcs (us-east-1)

-- Atomically increment user honor_points and games_played
-- The trigger update_belt_level() handles belt promotion automatically
CREATE OR REPLACE FUNCTION public.increment_user_stats(
  p_user_id UUID,
  p_honor INTEGER,
  p_games INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET
    honor_points = honor_points + p_honor,
    games_played = COALESCE(games_played, 0) + p_games,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
