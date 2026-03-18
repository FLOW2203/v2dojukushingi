import { useRef, useEffect, useState, useCallback } from 'react';

type GridType = 'genkou' | 'tiange' | 'simple' | 'ruled';

interface CalligraphyCanvasProps {
  width?: number;
  height?: number;
  gridType?: GridType;
  targetPath?: string;
  showGuide?: boolean;
  onStrokeComplete?: (accuracy: number) => void;
  onClear?: () => void;
  disabled?: boolean;
}

interface Point {
  x: number;
  y: number;
  pressure: number;
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, type: GridType) {
  ctx.save();
  ctx.strokeStyle = 'rgba(180,160,130,0.2)';
  ctx.lineWidth = 0.5;

  if (type === 'genkou') {
    const cellSize = Math.min(w, h) / 4;
    for (let x = cellSize; x < w; x += cellSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cellSize; y < h; y += cellSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  } else if (type === 'tiange') {
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(180,160,130,0.1)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.stroke();
  } else if (type === 'simple') {
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
  } else if (type === 'ruled') {
    const spacing = h / 8;
    for (let y = spacing; y < h; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }
  ctx.restore();
}

export default function CalligraphyCanvas({
  width = 300,
  height = 300,
  gridType = 'simple',
  targetPath,
  showGuide = false,
  onStrokeComplete,
  onClear,
  disabled = false,
}: CalligraphyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const currentStroke = useRef<Point[]>([]);

  const getPoint = useCallback((e: React.TouchEvent | React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: (touch as any).force || 0.5,
      };
    }
    return {
      x: ((e as React.PointerEvent).clientX - rect.left) * scaleX,
      y: ((e as React.PointerEvent).clientY - rect.top) * scaleY,
      pressure: (e as React.PointerEvent).pressure || 0.5,
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Paper background
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    drawGrid(ctx, canvas.width, canvas.height, gridType);

    // Guide path
    if (showGuide && targetPath) {
      ctx.save();
      ctx.strokeStyle = 'rgba(199,48,50,0.2)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const p = new Path2D(targetPath);
      ctx.stroke(p);
      ctx.restore();
    }

    // Draw strokes
    const allStrokes = [...strokes, ...(currentStroke.current.length ? [currentStroke.current] : [])];
    for (const stroke of allStrokes) {
      if (stroke.length < 2) continue;
      ctx.save();
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1];
        const curr = stroke[i];
        ctx.beginPath();
        ctx.lineWidth = Math.max(2, curr.pressure * 8);
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [strokes, gridType, showGuide, targetPath]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleStart = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    currentStroke.current = [getPoint(e)];
    redraw();
  }, [disabled, getPoint, redraw]);

  const handleMove = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    currentStroke.current.push(getPoint(e));
    redraw();
  }, [isDrawing, disabled, getPoint, redraw]);

  const handleEnd = useCallback((e: React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const finished = [...currentStroke.current];
    currentStroke.current = [];
    if (finished.length > 1) {
      setStrokes(prev => [...prev, finished]);

      // Calculate accuracy if target path exists
      if (targetPath && onStrokeComplete) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d')!;
          const path = new Path2D(targetPath);
          let hits = 0;
          const total = finished.length;
          for (const pt of finished) {
            if (ctx.isPointInStroke(path, pt.x, pt.y)) hits++;
            else {
              // Check within 20px tolerance
              for (let dx = -20; dx <= 20; dx += 5) {
                for (let dy = -20; dy <= 20; dy += 5) {
                  if (ctx.isPointInStroke(path, pt.x + dx, pt.y + dy)) {
                    hits++;
                    dx = 21; dy = 21;
                  }
                }
              }
            }
          }
          onStrokeComplete(Math.round((hits / total) * 100));
        }
      } else if (onStrokeComplete) {
        onStrokeComplete(100);
      }
    }
  }, [isDrawing, targetPath, onStrokeComplete]);

  const clear = useCallback(() => {
    setStrokes([]);
    currentStroke.current = [];
    redraw();
    onClear?.();
  }, [redraw, onClear]);

  const undo = useCallback(() => {
    setStrokes(prev => prev.slice(0, -1));
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-white/10 touch-none"
        style={{ width: '100%', maxWidth: width, aspectRatio: `${width}/${height}` }}
        onPointerDown={handleStart}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      <div className="flex gap-2">
        <button
          onClick={clear}
          className="rounded-lg bg-white/10 px-4 py-2 font-dm text-sm text-dojuku-paper min-h-[44px] hover:bg-white/20 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={undo}
          className="rounded-lg bg-white/10 px-4 py-2 font-dm text-sm text-dojuku-paper min-h-[44px] hover:bg-white/20 transition-colors"
        >
          Undo
        </button>
        {showGuide && (
          <span className="flex items-center font-dm text-xs text-dojuku-gold/60">Guide ON</span>
        )}
      </div>
    </div>
  );
}
