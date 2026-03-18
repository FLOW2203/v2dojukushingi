import { type Technique, type Culture, CULTURE_CONFIG } from '../../types/game';

interface StanceViewerProps {
  technique: Technique;
  showName?: boolean;
  showOriginal?: boolean;
  showDifficulty?: boolean;
  compact?: boolean;
}

const CULTURE_SILHOUETTE: Record<Culture, string> = {
  japan: 'M20 60 Q25 30 30 20 Q35 10 40 15 Q45 20 48 35 L50 60 Z',
  china: 'M15 60 Q20 35 25 25 Q35 5 45 25 Q50 35 55 60 Z',
  korea: 'M18 60 Q22 30 28 18 L38 8 L48 18 Q52 30 55 60 Z',
  vietnam: 'M20 60 Q25 28 35 15 Q40 5 45 15 Q50 28 52 60 Z',
  brazil: 'M12 60 Q18 40 22 30 Q35 8 48 30 Q52 40 58 60 Z',
};

export default function StanceViewer({ technique, showName = true, showOriginal = true, showDifficulty = true, compact }: StanceViewerProps) {
  const config = CULTURE_CONFIG[technique.culture];
  const silhouette = CULTURE_SILHOUETTE[technique.culture];

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
        <span className="text-lg">{config.flag}</span>
        <span className={`${config.font} text-sm text-dojuku-paper`}>{technique.name_original}</span>
        <span className="font-dm text-xs text-dojuku-paper/50">{technique.name_romanized}</span>
      </div>
    );
  }

  return (
    <div className="animate-stance-reveal flex flex-col items-center gap-3 rounded-xl bg-white/5 p-4 border border-white/10">
      {/* Silhouette */}
      <div className="relative">
        <svg width="70" height="70" viewBox="0 0 70 70" className="opacity-80">
          <path d={silhouette} fill="currentColor" className="text-dojuku-gold/30" />
        </svg>
        <span className="absolute -top-1 -right-1 text-sm">{config.flag}</span>
      </div>

      {showOriginal && (
        <p className={`${config.font} text-2xl text-dojuku-paper`}>
          {technique.name_original}
        </p>
      )}

      {showName && (
        <div className="text-center">
          <p className="font-outfit text-sm font-semibold text-dojuku-paper/90">{technique.name_romanized}</p>
          <p className="font-dm text-xs text-dojuku-paper/50">{technique.name_english}</p>
        </div>
      )}

      {showDifficulty && (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < technique.difficulty ? 'bg-dojuku-gold' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
