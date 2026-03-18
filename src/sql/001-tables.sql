-- DOJUKU SHINGI -- Database Schema
-- Supabase: cbmasgbbhmunzjoqbpcs (us-east-1)
-- DO NOT use isuzbpzwxcagtnbosgjl (COLHYBRI) or ydzuywqzzbpwytwwfmeq (obsolete)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT,
  display_name TEXT,
  belt_level INTEGER DEFAULT 0 CHECK (belt_level BETWEEN 0 AND 6),
  honor_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  preferred_culture TEXT CHECK (preferred_culture IN ('japan','china','korea','vietnam','brazil')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Techniques
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  culture TEXT NOT NULL CHECK (culture IN ('japan','china','korea','vietnam','brazil')),
  discipline TEXT NOT NULL,
  name_original TEXT NOT NULL,
  name_romanized TEXT NOT NULL,
  name_english TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  type TEXT CHECK (type IN ('strike','block','throw','stance','kata')),
  stroke_data JSONB,
  position_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Game Scores
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_slug TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  honor_earned INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  culture TEXT,
  duration_seconds INTEGER,
  played_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Honor Transactions
CREATE TABLE IF NOT EXISTS honor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('game','streak','bonus','achievement')),
  game_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Achievement Definitions (catalog of all possible achievements)
CREATE TABLE IF NOT EXISTS achievement_definitions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  honor_reward INTEGER NOT NULL DEFAULT 0
);

-- 6. User Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL REFERENCES achievement_definitions(key),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

-- 7. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_fr TEXT,
  statement_en TEXT NOT NULL,
  is_true BOOLEAN NOT NULL,
  category TEXT,
  culture TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id AS user_id,
  u.display_name,
  u.honor_points AS total_honor,
  u.belt_level,
  COUNT(gs.id) AS games_played,
  MODE() WITHIN GROUP (ORDER BY gs.culture) AS favorite_culture
FROM users u
LEFT JOIN game_scores gs ON gs.user_id = u.id
GROUP BY u.id, u.display_name, u.honor_points, u.belt_level
ORDER BY u.honor_points DESC;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_slug ON game_scores(game_slug);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_slug ON game_scores(user_id, game_slug);
CREATE INDEX IF NOT EXISTS idx_techniques_culture ON techniques(culture);
CREATE INDEX IF NOT EXISTS idx_honor_transactions_user ON honor_transactions(user_id);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE honor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Users: read own, insert own on signup, update own
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- Techniques: public read
CREATE POLICY techniques_select ON techniques FOR SELECT USING (true);

-- Game Scores: read own + public top scores, insert own
CREATE POLICY scores_select ON game_scores FOR SELECT USING (true);
CREATE POLICY scores_insert ON game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Honor Transactions: own only
CREATE POLICY honor_select ON honor_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY honor_insert ON honor_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievement Definitions: public read
CREATE POLICY achievement_defs_select ON achievement_definitions FOR SELECT USING (true);

-- User Achievements: own only
CREATE POLICY achievements_select ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY achievements_insert ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz Questions: public read
CREATE POLICY quiz_select ON quiz_questions FOR SELECT USING (true);

-- Function: update belt level based on honor points
CREATE OR REPLACE FUNCTION update_belt_level()
RETURNS TRIGGER AS $$
DECLARE
  new_belt INTEGER;
BEGIN
  new_belt := CASE
    WHEN NEW.honor_points >= 20000 THEN 6
    WHEN NEW.honor_points >= 10000 THEN 5
    WHEN NEW.honor_points >= 6000 THEN 4
    WHEN NEW.honor_points >= 3000 THEN 3
    WHEN NEW.honor_points >= 1500 THEN 2
    WHEN NEW.honor_points >= 500 THEN 1
    ELSE 0
  END;
  IF new_belt > NEW.belt_level THEN
    NEW.belt_level := new_belt;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_belt
  BEFORE UPDATE OF honor_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_belt_level();
