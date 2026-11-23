/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ide: {
          bg: 'var(--ide-bg)',
          surface: 'var(--ide-surface)',
          panel: 'var(--ide-panel)',
          border: 'var(--ide-border)',
          text: 'var(--ide-text)',
          muted: 'var(--ide-muted)',
          accent: 'var(--ide-accent)',
          accentSoft: 'var(--ide-accent-soft)',
          success: 'var(--ide-success)',
          warn: 'var(--ide-warn)',
          danger: 'var(--ide-danger)'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
