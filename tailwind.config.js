/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rouge-shingi': 'var(--rouge-shingi)',
        'noir-do': 'var(--noir-do)',
        'blanc-juku': 'var(--blanc-juku)',
        'or-dojuku': 'var(--or-dojuku)',
        'gris-zen': 'var(--gris-zen)',
      },
      fontFamily: {
        'noto-serif': ['Noto Serif JP', 'serif'],
        'sora': ['Sora', 'sans-serif'],
      },
      animation: {
        'kanji-appear': 'kanji-appear 1.5s ease-out',
        'fall': 'fall linear infinite',
      },
    },
  },
  plugins: [],
};