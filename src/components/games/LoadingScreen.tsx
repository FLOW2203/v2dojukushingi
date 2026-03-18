import { MASTER_QUOTES } from '../../types/game';

interface LoadingScreenProps {
  culture?: string;
}

export default function LoadingScreen({ culture }: LoadingScreenProps) {
  const quote = MASTER_QUOTES[Math.floor(Math.random() * MASTER_QUOTES.length)];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${culture ? `culture-${culture}` : ''} bg-dojuku-dark`}>
      <div className="mb-8 text-5xl animate-breathe">🧘</div>
      <div className="mb-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full animate-pulse"
          style={{ background: 'var(--gradient-fire)', width: '60%' }}
        />
      </div>
      <p className="max-w-xs text-center font-dm text-sm italic text-dojuku-paper/50">
        "{quote}"
      </p>
    </div>
  );
}
