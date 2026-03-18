import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES, type GameCategory, type Culture, CULTURE_CONFIG } from '../types/game';
import BeltProgress from '../components/games/BeltProgress';

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

const TIER_BADGES: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

export default function GamesHub() {
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | 'all'>('all');
  const [cultureFilter, setCultureFilter] = useState<Culture | 'all'>('all');

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
              <p className="font-dm text-xs text-dojuku-paper/40">18 Mini-Games — 5 Cultures</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold text-dojuku-gold">道塾信義</p>
            </div>
          </div>
          <BeltProgress honorPoints={0} />
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
          {filtered.map(game => (
            <Link
              key={game.slug}
              to={game.route}
              className="group relative rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-dojuku-gold/30 transition-all"
            >
              {/* Tier badge */}
              <span className="absolute top-2 right-2 font-mono text-[9px] text-dojuku-paper/30">
                {TIER_BADGES[game.tier]}
              </span>

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

              {/* Category badge */}
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 font-dm text-[10px] ${
                game.category === 'writing' ? 'bg-blue-500/10 text-blue-400' :
                game.category === 'stance' ? 'bg-green-500/10 text-green-400' :
                'bg-purple-500/10 text-purple-400'
              }`}>
                {game.category}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <p className="font-dm text-xs text-dojuku-paper/20">
          DOJUKU SHINGI — ONLYMORE GROUP — 5 Cultures, 18 Games, 1 Path
        </p>
      </footer>
    </div>
  );
}
