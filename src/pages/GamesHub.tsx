import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GAMES, type GameCategory, type Culture, CULTURE_CONFIG, BELT_THRESHOLDS, BELT_NAMES, type BeltLevel } from '../types/game';
import BeltProgress from '../components/games/BeltProgress';
import { getLocalBestScore, getPlayedGames, getLocalHonor } from '../lib/supabase';

const CATEGORIES: { key: GameCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Games' },
  { key: 'writing', label: 'Writing' },
  { key: 'stance', label: 'Positions' },
  { key: 'culture', label: 'Culture' },
];

const CULTURES: { key: Culture | 'all'; label: string; flag: string }[] = [
  { key: 'all', label: 'All', flag: '🌍' },
  { key: 'japan', label: 'Japan', flag: '🇯🇵' },
  { key: 'china', label: 'China', flag: '🇨🇳' },
  { key: 'korea', label: 'Korea', flag: '🇰🇷' },
  { key: 'vietnam', label: 'Vietnam', flag: '🇻🇳' },
  { key: 'brazil', label: 'Brazil', flag: '🇧🇷' },
];

// Belt requirements per tier
const TIER_BELT_REQ: Record<number, BeltLevel> = {
  1: 0, // Tier 1: open to all
  2: 0, // Tier 2: open to all
  3: 0, // Tier 3: open to all
};

function computeBelt(honor: number): BeltLevel {
  const levels: BeltLevel[] = [6, 5, 4, 3, 2, 1, 0];
  for (const level of levels) {
    if (honor >= BELT_THRESHOLDS[level]) return level;
  }
  return 0;
}

export default function GamesHub() {
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | 'all'>('all');
  const [cultureFilter, setCultureFilter] = useState<Culture | 'all'>('all');
  const [playedGames, setPlayedGames] = useState<string[]>([]);
  const [honor, setHonor] = useState(0);

  useEffect(() => {
    setPlayedGames(getPlayedGames());
    setHonor(getLocalHonor());
  }, []);

  const beltLevel = computeBelt(honor);

  const filtered = GAMES.filter(g => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    if (cultureFilter !== 'all' && g.culture !== cultureFilter && g.culture !== 'all') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dojuku-dark">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-outfit text-2xl font-bold text-dojuku-paper">DOJUKU SHINGI</h1>
              <p className="font-dm text-xs text-dojuku-paper/40">18 Mini-Games | 5 Cultures</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/leaderboard"
                className="rounded-lg bg-white/5 px-3 py-2 font-dm text-xs text-dojuku-paper/60 hover:bg-white/10 transition-colors min-h-[36px] flex items-center"
              >
                🏆
              </Link>
              <Link
                to="/profile"
                className="rounded-lg bg-white/5 px-3 py-2 font-dm text-xs text-dojuku-paper/60 hover:bg-white/10 transition-colors min-h-[36px] flex items-center"
              >
                👤
              </Link>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-dojuku-gold">道塾信義</p>
              </div>
            </div>
          </div>
          <BeltProgress honorPoints={honor} />

          {/* Stats bar */}
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="font-mono text-xs text-dojuku-gold">{honor} 名誉</span>
            <span className="font-dm text-xs text-dojuku-paper/40">{playedGames.length}/18 games played</span>
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`rounded-full px-4 py-1.5 font-dm text-sm whitespace-nowrap min-h-[36px] transition-colors ${
                categoryFilter === cat.key
                  ? 'bg-dojuku-gold text-dojuku-dark font-semibold'
                  : 'bg-white/5 text-dojuku-paper/60 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Culture filter */}
      <div className="px-4 py-1">
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {CULTURES.map(c => (
            <button
              key={c.key}
              onClick={() => setCultureFilter(c.key)}
              className={`rounded-full px-3 py-1.5 font-dm text-sm whitespace-nowrap min-h-[36px] transition-colors ${
                cultureFilter === c.key
                  ? 'bg-white/15 text-dojuku-paper font-semibold'
                  : 'bg-white/5 text-dojuku-paper/40 hover:bg-white/10'
              }`}
            >
              {c.flag} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games grid */}
      <div className="px-4 py-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(game => {
            const best = getLocalBestScore(game.slug);
            const isPlayed = playedGames.includes(game.slug);
            const isNew = !isPlayed;
            const requiredBelt = TIER_BELT_REQ[game.tier];
            const isLocked = beltLevel < requiredBelt;

            if (isLocked) {
              return (
                <div
                  key={game.slug}
                  className="relative rounded-xl bg-white/3 border border-white/5 p-4 opacity-50"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl">🔒</span>
                      <p className="font-dm text-xs text-dojuku-paper/40 mt-1">
                        {BELT_NAMES[requiredBelt]} Belt
                      </p>
                    </div>
                  </div>
                  <div className="text-3xl mb-2 blur-sm">{game.icon}</div>
                  <h3 className="font-outfit text-sm font-semibold text-dojuku-paper/30">{game.name}</h3>
                </div>
              );
            }

            return (
              <Link
                key={game.slug}
                to={game.route}
                className="group relative rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-dojuku-gold/30 transition-all"
              >
                {/* NEW badge */}
                {isNew && (
                  <span className="absolute top-2 right-2 rounded-full bg-dojuku-red px-1.5 py-0.5 font-mono text-[9px] font-bold text-white animate-pulse">
                    NEW
                  </span>
                )}

                {/* Stars (if played) */}
                {isPlayed && best.stars > 0 && (
                  <div className="absolute top-2 right-2 flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={`text-[10px] ${s <= best.stars ? 'text-dojuku-gold' : 'text-white/10'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* Icon */}
                <div className="text-3xl mb-2">{game.icon}</div>

                {/* Name */}
                <h3 className="font-outfit text-sm font-semibold text-dojuku-paper group-hover:text-dojuku-gold transition-colors">
                  {game.name}
                </h3>

                {/* Culture flag */}
                {game.culture !== 'all' && (
                  <span className="text-xs">{CULTURE_CONFIG[game.culture as Culture].flag}</span>
                )}

                {/* Description */}
                <p className="font-dm text-xs text-dojuku-paper/40 mt-1">{game.description}</p>

                {/* Best score + plays */}
                {isPlayed && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-dojuku-gold">{best.score}</span>
                    <span className="font-dm text-[10px] text-dojuku-paper/30">{best.plays}x</span>
                  </div>
                )}

                {/* Category badge */}
                {!isPlayed && (
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 font-dm text-[10px] ${
                    game.category === 'writing' ? 'bg-blue-500/10 text-blue-400' :
                    game.category === 'stance' ? 'bg-green-500/10 text-green-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {game.category}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <p className="font-dm text-xs text-dojuku-paper/20">
          DOJUKU SHINGI | ONLYMORE GROUP | 5 Cultures, 18 Games, 1 Path
        </p>
      </footer>
    </div>
  );
}
