import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES, BELT_NAMES, BELT_COLORS, type BeltLevel, type Culture, CULTURE_CONFIG } from '../types/game';
import { getLeaderboard, getGameLeaderboard } from '../lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_honor: number;
  belt_level: number;
  games_played: number;
  favorite_culture: string | null;
}

interface GameScoreEntry {
  user_id: string;
  score: number;
  max_combo: number;
  stars: number;
  played_at: string;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'global' | 'game'>('global');
  const [selectedGame, setSelectedGame] = useState(GAMES[0].slug);
  const [cultureFilter, setCultureFilter] = useState<Culture | 'all'>('all');
  const [globalBoard, setGlobalBoard] = useState<LeaderboardEntry[]>([]);
  const [gameBoard, setGameBoard] = useState<GameScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (tab === 'global') {
        const data = await getLeaderboard(50);
        setGlobalBoard(data as LeaderboardEntry[]);
      } else {
        const data = await getGameLeaderboard(selectedGame, 20);
        setGameBoard(data as GameScoreEntry[]);
      }
      setLoading(false);
    };
    load();
  }, [tab, selectedGame]);

  const filteredGlobal = cultureFilter === 'all'
    ? globalBoard
    : globalBoard.filter(e => e.favorite_culture === cultureFilter);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-dojuku-dark">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/games')} className="font-dm text-sm text-dojuku-paper/60 hover:text-dojuku-paper min-h-[44px] flex items-center">
            &larr; Hub
          </button>
          <h1 className="font-outfit text-xl font-bold text-dojuku-gold">🏆 Leaderboard</h1>
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-4 pb-12">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 rounded-lg py-2 font-outfit text-sm font-semibold min-h-[44px] transition-colors ${
              tab === 'global' ? 'bg-dojuku-gold text-dojuku-dark' : 'bg-white/5 text-dojuku-paper/60 hover:bg-white/10'
            }`}
          >
            Global Honor
          </button>
          <button
            onClick={() => setTab('game')}
            className={`flex-1 rounded-lg py-2 font-outfit text-sm font-semibold min-h-[44px] transition-colors ${
              tab === 'game' ? 'bg-dojuku-gold text-dojuku-dark' : 'bg-white/5 text-dojuku-paper/60 hover:bg-white/10'
            }`}
          >
            Per Game
          </button>
        </div>

        {/* Culture filter (global only) */}
        {tab === 'global' && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'japan', 'china', 'korea', 'vietnam', 'brazil'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCultureFilter(c)}
                className={`rounded-full px-3 py-1 font-dm text-xs whitespace-nowrap min-h-[32px] transition-colors ${
                  cultureFilter === c
                    ? 'bg-white/15 text-dojuku-paper font-semibold'
                    : 'bg-white/5 text-dojuku-paper/40 hover:bg-white/10'
                }`}
              >
                {c === 'all' ? '🌍 All' : `${CULTURE_CONFIG[c].flag} ${CULTURE_CONFIG[c].name}`}
              </button>
            ))}
          </div>
        )}

        {/* Game selector (per game only) */}
        {tab === 'game' && (
          <select
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 font-dm text-sm text-dojuku-paper min-h-[44px] appearance-none"
          >
            {GAMES.map(g => (
              <option key={g.slug} value={g.slug} className="bg-dojuku-dark">
                {g.icon} {g.name}
              </option>
            ))}
          </select>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-dojuku-gold/30 border-t-dojuku-gold animate-spin" />
          </div>
        )}

        {/* Global leaderboard */}
        {!loading && tab === 'global' && (
          <div className="space-y-1">
            {filteredGlobal.length === 0 && (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🏯</p>
                <p className="font-dm text-sm text-dojuku-paper/40">
                  No warriors on the leaderboard yet.
                </p>
                <p className="font-dm text-xs text-dojuku-paper/30 mt-1">
                  Sign in and play to claim your spot!
                </p>
              </div>
            )}
            {filteredGlobal.map((entry, idx) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                  idx < 3 ? 'bg-dojuku-gold/5 border border-dojuku-gold/10' : 'bg-white/3'
                }`}
              >
                <span className="font-mono text-sm w-8 text-center">
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </span>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: BELT_COLORS[entry.belt_level as BeltLevel] }}
                >
                  {(entry.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-outfit text-sm text-dojuku-paper">
                    {entry.display_name || 'Anonymous'}
                  </p>
                  <p className="font-dm text-xs text-dojuku-paper/40">
                    {BELT_NAMES[entry.belt_level as BeltLevel]} | {entry.games_played} games
                    {entry.favorite_culture && ` | ${CULTURE_CONFIG[entry.favorite_culture as Culture]?.flag || ''}`}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-dojuku-gold">
                  {entry.total_honor}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Game leaderboard */}
        {!loading && tab === 'game' && (
          <div className="space-y-1">
            {gameBoard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🎮</p>
                <p className="font-dm text-sm text-dojuku-paper/40">
                  No scores for this game yet.
                </p>
              </div>
            )}
            {gameBoard.map((entry, idx) => (
              <div
                key={`${entry.user_id}-${idx}`}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                  idx < 3 ? 'bg-dojuku-gold/5 border border-dojuku-gold/10' : 'bg-white/3'
                }`}
              >
                <span className="font-mono text-sm w-8 text-center">
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-xs ${s <= entry.stars ? 'text-dojuku-gold' : 'text-white/10'}`}>★</span>
                      ))}
                    </div>
                    {entry.max_combo > 0 && (
                      <span className="font-mono text-[10px] text-dojuku-paper/30">x{entry.max_combo}</span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-dojuku-gold">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
