/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sémantické tokeny řízené CSS proměnnými (viz index.css).
        // Mění se podle režimu (denní/noční) i barevného schématu.
        surface: v('--panel'),
        line: v('--border'),
        ink: v('--text'),
        muted: v('--muted'),
        accent: {
          DEFAULT: v('--accent'),
          hover: v('--accent-hover'),
          ink: v('--accent-ink'),
        },
        felt: {
          DEFAULT: v('--felt-2'),
          dark: v('--felt-1'),
        },
      },
      boxShadow: {
        card: '0 6px 16px -4px rgba(0,0,0,0.45)',
        table: 'inset 0 0 60px rgba(0,0,0,0.45), 0 10px 30px -10px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'card-in': 'card-in 0.28s ease-out both',
        pop: 'pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
