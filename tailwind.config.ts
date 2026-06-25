import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'green-accent': 'var(--color-green)',
        'amber-accent': 'var(--color-amber)',
        'blue-accent': 'var(--color-blue)',
        'text-base': 'var(--color-text-primary)',
        'text-dim': 'var(--color-text-secondary)',
        'text-ghost': 'var(--color-text-muted)',
        danger: 'var(--color-danger)',
        'green-bg': 'var(--color-green-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
        'card-lg': '0 4px 12px 0 rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config
