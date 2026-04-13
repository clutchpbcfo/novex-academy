import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        cyan: 'var(--cyan)',
        'cyan-soft': 'var(--cyan-soft)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        green: 'var(--green)',
        red: 'var(--red)',
        purple: 'var(--purple)',
        orange: 'var(--orange)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        'cyan-glow': 'var(--cyan-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
