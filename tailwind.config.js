/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dojuku-dark': '#0C0E1A',
        'dojuku-gold': '#D4A017',
        'dojuku-red': '#C73032',
        'dojuku-paper': '#F5F0E8',
        'dojuku-ink': '#1A1A1A',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'dm': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'noto-jp': ['Noto Serif JP', 'serif'],
        'noto-cn': ['Noto Sans SC', 'sans-serif'],
        'noto-kr': ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'brush-stroke': 'brush-stroke 1s ease-out forwards',
        'ink-dry': 'ink-dry 0.5s ease-out forwards',
        'bow': 'bow 1.5s ease-in-out',
        'belt-glow': 'belt-glow 2s ease-in-out infinite',
        'paper-unfold': 'paper-unfold 0.6s ease-out forwards',
        'stance-reveal': 'stance-reveal 0.4s ease-out forwards',
        'ki-energy': 'ki-energy 1.5s ease-in-out infinite',
        'score-pop': 'score-pop 0.8s ease-out forwards',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
