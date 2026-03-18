export type Culture = 'japan' | 'china' | 'korea' | 'vietnam' | 'brazil';

export type TechniqueType = 'strike' | 'block' | 'throw' | 'stance' | 'kata';

export type GameCategory = 'writing' | 'stance' | 'culture';

export type BeltLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const BELT_NAMES: Record<BeltLevel, string> = {
  0: 'White',
  1: 'Yellow',
  2: 'Orange',
  3: 'Green',
  4: 'Blue',
  5: 'Brown',
  6: 'Black',
};

export const BELT_THRESHOLDS: Record<BeltLevel, number> = {
  0: 0,
  1: 500,
  2: 1500,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 20000,
};

export const BELT_COLORS: Record<BeltLevel, string> = {
  0: '#F5F5F5',
  1: '#EAB308',
  2: '#EA580C',
  3: '#16A34A',
  4: '#2563EB',
  5: '#92400E',
  6: '#1A1A1A',
};

export interface Technique {
  id: string;
  culture: Culture;
  discipline: string;
  name_original: string;
  name_romanized: string;
  name_english: string;
  difficulty: number;
  type: TechniqueType;
  stroke_data: object | null;
  position_description: string;
}

export interface GameScore {
  id: string;
  user_id: string;
  game_slug: string;
  score: number;
  honor_earned: number;
  max_combo: number;
  stars: number;
  culture: Culture;
  duration_seconds: number;
  played_at: string;
}

export interface QuizQuestion {
  id: string;
  statement_en: string;
  is_true: boolean;
  category: string;
  culture: Culture | null;
}

export interface GameConfig {
  slug: string;
  name: string;
  nameJp?: string;
  description: string;
  category: GameCategory;
  culture: Culture | 'all';
  icon: string;
  tier: 1 | 2 | 3;
  route: string;
}

export const GAMES: GameConfig[] = [
  { slug: 'kanji-stroke', name: 'Kanji Stroke', nameJp: '漢字', description: 'Trace Japanese kanji', category: 'writing', culture: 'japan', icon: '筆', tier: 1, route: '/games/kanji-stroke' },
  { slug: 'hanzi-master', name: 'Hanzi Master', nameJp: '汉字', description: 'Master Chinese characters', category: 'writing', culture: 'china', icon: '墨', tier: 1, route: '/games/hanzi-master' },
  { slug: 'hangul-dojo', name: 'Hangul Dojo', nameJp: '한글', description: 'Write Korean hangul', category: 'writing', culture: 'korea', icon: '글', tier: 1, route: '/games/hangul-dojo' },
  { slug: 'chu-vo', name: 'Chu Vo', nameJp: 'Chữ', description: 'Vietnamese martial terms', category: 'writing', culture: 'vietnam', icon: 'V', tier: 1, route: '/games/chu-vo' },
  { slug: 'calli-flow', name: 'CalliFlow', nameJp: '流', description: 'Write across 5 cultures', category: 'writing', culture: 'all', icon: '道', tier: 1, route: '/games/calli-flow' },
  { slug: 'stroke-race', name: 'Stroke Race', nameJp: '速', description: '60s speed calligraphy', category: 'writing', culture: 'all', icon: '⚡', tier: 1, route: '/games/stroke-race' },
  { slug: 'stance-name', name: 'Stance Name', description: 'Name the technique', category: 'stance', culture: 'all', icon: '🥋', tier: 2, route: '/games/stance-name' },
  { slug: 'stance-match', name: 'Stance Match', description: 'Memory card matching', category: 'stance', culture: 'all', icon: '🃏', tier: 2, route: '/games/stance-match' },
  { slug: 'sensei-says', name: 'Sensei Says', description: 'Follow the master', category: 'stance', culture: 'all', icon: '🗣', tier: 2, route: '/games/sensei-says' },
  { slug: 'kata-sequence', name: 'Kata Sequence', description: 'Memorize the sequence', category: 'stance', culture: 'all', icon: '📋', tier: 2, route: '/games/kata-sequence' },
  { slug: 'technique-sort', name: 'Technique Sort', description: 'Sort by category', category: 'stance', culture: 'all', icon: '↕️', tier: 2, route: '/games/technique-sort' },
  { slug: 'master-or-myth', name: 'Master or Myth', description: 'True or false quiz', category: 'stance', culture: 'all', icon: '❓', tier: 2, route: '/games/master-or-myth' },
  { slug: 'dojo-build', name: 'Dojo Build', description: 'Build your own dojo', category: 'culture', culture: 'all', icon: '🏯', tier: 3, route: '/games/dojo-build' },
  { slug: 'master-voice', name: 'Master Voice', description: 'Identify the master', category: 'culture', culture: 'all', icon: '👴', tier: 3, route: '/games/master-voice' },
  { slug: 'belt-path', name: 'Belt Path', description: 'RPG belt progression', category: 'culture', culture: 'all', icon: '🛤', tier: 3, route: '/games/belt-path' },
  { slug: 'culture-connect', name: 'Culture Connect', description: 'Connect the dots', category: 'culture', culture: 'all', icon: '🔗', tier: 3, route: '/games/culture-connect' },
  { slug: 'timeline-warrior', name: 'Timeline Warrior', description: 'Sort by history', category: 'culture', culture: 'all', icon: '📅', tier: 3, route: '/games/timeline-warrior' },
  { slug: 'zen-breath', name: 'Zen Breath', description: 'Breathing exercise', category: 'culture', culture: 'all', icon: '🧘', tier: 3, route: '/games/zen-breath' },
];

export const CULTURE_CONFIG: Record<Culture, { name: string; flag: string; master: string; font: string }> = {
  japan: { name: 'Japan', flag: '🇯🇵', master: 'Sensei Diadi', font: 'font-noto-jp' },
  china: { name: 'China', flag: '🇨🇳', master: 'Master Chen', font: 'font-noto-cn' },
  korea: { name: 'Korea', flag: '🇰🇷', master: 'Grand Master Hwan', font: 'font-noto-kr' },
  vietnam: { name: 'Vietnam', flag: '🇻🇳', master: 'Master Linh', font: 'font-dm' },
  brazil: { name: 'Brazil', flag: '🇧🇷', master: 'Mestre Bahia', font: 'font-dm' },
};

export const MASTER_QUOTES = [
  'The journey of a thousand miles begins with a single step.',
  'A true warrior has no enemies.',
  'In the midst of chaos, there is also opportunity.',
  'Fall seven times, stand up eight.',
  'The more you sweat in training, the less you bleed in combat.',
  'Be like water making its way through cracks.',
  'The best fighter is never angry.',
  'Discipline is the bridge between goals and accomplishment.',
  'A black belt is a white belt that never quit.',
  'The only way to do great work is to love what you practice.',
];
