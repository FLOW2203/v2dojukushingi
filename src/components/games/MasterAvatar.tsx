import { type Culture, CULTURE_CONFIG } from '../../types/game';

type Expression = 'neutral' | 'bravo' | 'correction' | 'celebration';

interface MasterAvatarProps {
  culture: Culture;
  expression?: Expression;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MASTER_COLORS: Record<Culture, { primary: string; secondary: string }> = {
  japan: { primary: '#1E3A5F', secondary: '#C73032' },
  china: { primary: '#DC2626', secondary: '#1A1A1A' },
  korea: { primary: '#47A3B5', secondary: '#0F172A' },
  vietnam: { primary: '#FBBF24', secondary: '#B91C1C' },
  brazil: { primary: '#16A34A', secondary: '#EAB308' },
};

const EXPRESSION_EMOJI: Record<Expression, string> = {
  neutral: '🧘',
  bravo: '👏',
  correction: '🤔',
  celebration: '🎉',
};

const sizes = { sm: 40, md: 56, lg: 80 };

export default function MasterAvatar({ culture, expression = 'neutral', message, size = 'md' }: MasterAvatarProps) {
  const colors = MASTER_COLORS[culture];
  const config = CULTURE_CONFIG[culture];
  const s = sizes[size];

  return (
    <div className="flex items-start gap-2">
      <div
        className="relative flex items-center justify-center rounded-full border-2 animate-breathe"
        style={{
          width: s,
          height: s,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          borderColor: colors.primary,
        }}
      >
        <span className="text-lg">{EXPRESSION_EMOJI[expression]}</span>
        <div
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
          style={{ backgroundColor: colors.primary }}
        >
          {config.flag}
        </div>
      </div>
      {message && (
        <div
          className="relative max-w-48 rounded-lg px-3 py-2 text-xs"
          style={{
            backgroundColor: `${colors.primary}33`,
            border: `1px solid ${colors.primary}55`,
            color: '#F5F0E8',
          }}
        >
          <div className="font-outfit text-[10px] font-semibold opacity-70">{config.master}</div>
          {message}
        </div>
      )}
    </div>
  );
}
