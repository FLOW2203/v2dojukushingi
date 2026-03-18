const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const Sound = {
  brushStroke: () => playTone(200, 0.15, 'triangle', 0.08),
  correct: () => {
    playTone(523, 0.12, 'sine');
    setTimeout(() => playTone(659, 0.12, 'sine'), 100);
    setTimeout(() => playTone(784, 0.2, 'sine'), 200);
  },
  wrong: () => {
    playTone(200, 0.3, 'sawtooth', 0.1);
  },
  combo: () => {
    playTone(784, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(988, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(1175, 0.15, 'sine', 0.12), 160);
  },
  levelUp: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i * 120)
    );
  },
  gameOver: () => {
    playTone(392, 0.3, 'sine', 0.12);
    setTimeout(() => playTone(330, 0.3, 'sine', 0.12), 250);
    setTimeout(() => playTone(262, 0.5, 'sine', 0.12), 500);
  },
  tick: () => playTone(1000, 0.05, 'square', 0.05),
  select: () => playTone(600, 0.08, 'sine', 0.1),
};

let muted = false;

export function toggleMute() {
  muted = !muted;
  if (audioCtx) {
    if (muted) {
      audioCtx.suspend();
    } else {
      audioCtx.resume();
    }
  }
  return muted;
}

export function isMuted() {
  return muted;
}
