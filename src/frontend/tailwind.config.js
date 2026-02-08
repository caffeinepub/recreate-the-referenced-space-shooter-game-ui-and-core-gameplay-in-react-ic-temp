/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        'neon-cyan': 'oklch(var(--neon-cyan))',
        'neon-purple': 'oklch(var(--neon-purple))',
        'neon-magenta': 'oklch(var(--neon-magenta))',
        'neon-yellow': 'oklch(var(--neon-yellow))',
        'neon-orange': 'oklch(var(--neon-orange))',
        'space-dark': 'oklch(var(--space-dark))',
        'space-darker': 'oklch(var(--space-darker))',
        'space-card': 'oklch(var(--space-card))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'neon-cyan': '0 0 30px oklch(0.75 0.20 195 / 0.5)',
        'neon-cyan-lg': '0 0 45px oklch(0.75 0.20 195 / 0.7)',
        'neon-purple': '0 0 30px oklch(0.70 0.25 300 / 0.5)',
        'neon-purple-lg': '0 0 45px oklch(0.70 0.25 300 / 0.7)',
        'neon-magenta': '0 0 30px oklch(0.70 0.25 330 / 0.5)',
        'neon-magenta-lg': '0 0 45px oklch(0.70 0.25 330 / 0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
