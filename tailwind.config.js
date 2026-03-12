/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#050a14',
          800: '#080f1e',
          700: '#0d1a2e',
          600: '#112240',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#22d3ee',
        },
        amber: {
          glow: '#f59e0b',
        },
        red: {
          glow: '#ef4444',
        },
        green: {
          glow: '#22c55e',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '92%': { opacity: 1 },
          '93%': { opacity: 0.8 },
          '94%': { opacity: 1 },
          '96%': { opacity: 0.9 },
          '97%': { opacity: 1 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34,211,238,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(34,211,238,0.7), 0 0 50px rgba(34,211,238,0.3)' },
        }
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
