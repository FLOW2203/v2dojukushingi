import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GAMES, BELT_NAMES, BELT_COLORS, BELT_THRESHOLDS, type BeltLevel } from '../types/game';
import BeltProgress from '../components/games/BeltProgress';
import { supabase, getUserProfile, getUserAchievements, getAchievementDefinitions, getLocalHonor, getLocalBestScore, getPlayedGames } from '../lib/supabase';

function computeBelt(honor: number): BeltLevel {
  const levels: BeltLevel[] = [6, 5, 4, 3, 2, 1, 0];
  for (const level of levels) {
    if (honor >= BELT_THRESHOLDS[level]) return level;
  }
  return 0;
}

interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  honor_reward: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string; honor_points: number; belt_level: number } | null>(null);
  const [achievements, setAchievements] = useState<{ achievement_key: string; unlocked_at: string }[]>([]);
  const [achievementDefs, setAchievementDefs] = useState<AchievementDef[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const localHonor = getLocalHonor();
  const playedGames = getPlayedGames();
  const honor = profile?.honor_points ?? localHonor;
  const belt = (profile?.belt_level ?? computeBelt(honor)) as BeltLevel;
  const displayName = profile?.display_name || 'Guest Warrior';

  useEffect(() => {
    const load = async () => {
      const p = await getUserProfile();
      if (p) {
        setProfile(p);
        setIsLoggedIn(true);
      }
      const achs = await getUserAchievements();
      setAchievements(achs);
      const defs = await getAchievementDefinitions();
      setAchievementDefs(defs);
    };
    load();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsLoggedIn(false);
  };

  // Compute stats from local data
  const totalGames = playedGames.reduce((sum, slug) => {
    const best = getLocalBestScore(slug);
    return sum + best.plays;
  }, 0);

  const totalStars = playedGames.reduce((sum, slug) => {
    const best = getLocalBestScore(slug);
    return sum + best.stars;
  }, 0);

  // Next belt info
  const nextBelt = Math.min(6, belt + 1) as BeltLevel;
  const nextThreshold = BELT_THRESHOLDS[nextBelt];
  const progress = belt >= 6 ? 100 : Math.min(100, Math.round(((honor - BELT_THRESHOLDS[belt]) / (nextThreshold - BELT_THRESHOLDS[belt])) * 100));

  const unlockedKeys = new Set(achievements.map(a => a.achievement_key));

  return (
    <div className="min-h-screen bg-dojuku-dark">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/games')} className="font-dm text-sm text-dojuku-paper/60 hover:text-dojuku-paper min-h-[44px] flex items-center">
            &larr; Hub
          </button>
          <h1 className="font-outfit text-xl font-bold text-dojuku-paper">Profile</h1>
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-6 pb-12">
        {/* User card */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
          <div
            className="mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: BELT_COLORS[belt], boxShadow: `0 0 20px ${BELT_COLORS[belt]}40` }}
          >
            🥋
          </div>
          <h2 className="font-outfit text-xl font-bold text-dojuku-paper">{displayName}</h2>
          <p className="font-dm text-sm text-dojuku-gold mt-1">{BELT_NAMES[belt]} Belt</p>

          <div className="mt-4">
            <BeltProgress honorPoints={honor} />
          </div>

          {belt < 6 && (
            <p className="font-dm text-xs text-dojuku-paper/40 mt-2">
              {nextThreshold - honor} honor to {BELT_NAMES[nextBelt]} Belt ({progress}%)
            </p>
          )}

          {!isLoggedIn && (
            <button
              onClick={handleSignIn}
              className="mt-4 rounded-lg px-6 py-2 font-outfit font-semibold text-dojuku-dark min-h-[44px]"
              style={{ background: 'var(--gradient-fire)' }}
            >
              Sign In to Save Progress
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              className="mt-4 rounded-lg bg-white/5 px-4 py-2 font-dm text-xs text-dojuku-paper/40 hover:bg-white/10 min-h-[36px]"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-dojuku-gold">{honor}</p>
            <p className="font-dm text-xs text-dojuku-paper/40">Honor</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-dojuku-paper">{totalGames}</p>
            <p className="font-dm text-xs text-dojuku-paper/40">Games</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-dojuku-gold">{totalStars}</p>
            <p className="font-dm text-xs text-dojuku-paper/40">Stars</p>
          </div>
        </div>

        {/* Recent scores */}
        <div>
          <h3 className="font-outfit text-lg font-semibold text-dojuku-paper mb-3">Best Scores</h3>
          <div className="space-y-2">
            {GAMES.filter(g => playedGames.includes(g.slug))
              .map(game => {
                const best = getLocalBestScore(game.slug);
                return (
                  <Link
                    key={game.slug}
                    to={game.route}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{game.icon}</span>
                      <div>
                        <p className="font-outfit text-sm text-dojuku-paper">{game.name}</p>
                        <p className="font-dm text-xs text-dojuku-paper/40">{best.plays} plays</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-dojuku-gold">{best.score}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={`text-[10px] ${s <= best.stars ? 'text-dojuku-gold' : 'text-white/10'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })
            }
            {playedGames.length === 0 && (
              <p className="font-dm text-sm text-dojuku-paper/40 text-center py-4">
                No games played yet. Start your journey!
              </p>
            )}
          </div>
        </div>

        {/* Achievements */}
        {achievementDefs.length > 0 && (
          <div>
            <h3 className="font-outfit text-lg font-semibold text-dojuku-paper mb-3">
              Achievements ({achievements.length}/{achievementDefs.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {achievementDefs.map(def => {
                const unlocked = unlockedKeys.has(def.key);
                return (
                  <div
                    key={def.key}
                    className={`rounded-lg p-3 border transition-all ${
                      unlocked
                        ? 'bg-dojuku-gold/10 border-dojuku-gold/20'
                        : 'bg-white/3 border-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-xl">{def.icon}</span>
                    <p className="font-outfit text-xs font-semibold text-dojuku-paper mt-1">{def.name}</p>
                    <p className="font-dm text-[10px] text-dojuku-paper/40">{def.description}</p>
                    {unlocked && (
                      <p className="font-mono text-[10px] text-dojuku-gold mt-1">+{def.honor_reward} 名誉</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
