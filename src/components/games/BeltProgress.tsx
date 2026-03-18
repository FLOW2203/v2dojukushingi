import { BELT_NAMES, BELT_THRESHOLDS, BELT_COLORS, type BeltLevel } from '../../types/game';

interface BeltProgressProps {
  honorPoints: number;
  compact?: boolean;
}

function getBeltLevel(honor: number): BeltLevel {
  const levels: BeltLevel[] = [6, 5, 4, 3, 2, 1, 0];
  for (const l of levels) {
    if (honor >= BELT_THRESHOLDS[l]) return l;
  }
  return 0;
}

function getNextThreshold(honor: number): number {
  const levels: BeltLevel[] = [1, 2, 3, 4, 5, 6];
  for (const l of levels) {
    if (honor < BELT_THRESHOLDS[l]) return BELT_THRESHOLDS[l];
  }
  return BELT_THRESHOLDS[6];
}

export default function BeltProgress({ honorPoints, compact }: BeltProgressProps) {
  const level = getBeltLevel(honorPoints);
  const currentThreshold = BELT_THRESHOLDS[level];
  const nextThreshold = getNextThreshold(honorPoints);
  const progress = ((honorPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-8 rounded-sm border border-white/20"
          style={{ backgroundColor: BELT_COLORS[level] }}
        />
        <span className="font-mono text-sm text-dojuku-gold">{honorPoints}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-10 rounded-sm border border-white/20 animate-belt-glow"
            style={{ backgroundColor: BELT_COLORS[level] }}
          />
          <span className="font-outfit text-sm font-semibold text-dojuku-paper">
            {BELT_NAMES[level]} Belt
          </span>
        </div>
        <span className="font-mono text-xs text-dojuku-gold">
          {honorPoints} / {nextThreshold} 名誉
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'var(--gradient-fire)',
          }}
        />
      </div>
    </div>
  );
}

export { getBeltLevel };
