import { useEffect, useState } from 'react';

interface ScorePopupProps {
  score: number;
  label?: string;
  visible: boolean;
  onDone?: () => void;
}

export default function ScorePopup({ score, label = '名誉', visible, onDone }: ScorePopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [visible, onDone]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="animate-score-pop font-mono text-3xl font-bold"
        style={{
          color: '#D4A017',
          textShadow: '0 0 20px rgba(212,160,23,0.6), 0 0 40px rgba(212,160,23,0.3)',
        }}
      >
        +{score} {label}
      </div>
    </div>
  );
}
