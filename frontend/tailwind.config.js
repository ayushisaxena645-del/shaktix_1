/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raahi: {
          darkest: '#050B1A',
          dark: '#0A142B',
          card: '#111E3E',
          cardHover: '#182A56',
          border: '#1F376E',
          borderLight: '#2D4C93',
          teal: '#00F0FF',
          tealHover: '#38F8FF',
          tealGlow: 'rgba(0, 240, 255, 0.25)',
          cyan: '#06B6D4',
          emerald: '#10B981',
          danger: '#FF3366',
          dangerGlow: 'rgba(255, 51, 102, 0.35)',
          amber: '#F59E0B',
          purple: '#8B5CF6',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon': 'beaconRipple 2.5s ease-out infinite',
      },
      keyframes: {
        beaconRipple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8', boxShadow: '0 0 0 0 rgba(255, 51, 102, 0.7)' },
          '70%': { transform: 'scale(1.05)', opacity: '0.2', boxShadow: '0 0 0 35px rgba(255, 51, 102, 0)' },
          '100%': { transform: 'scale(0.95)', opacity: '0', boxShadow: '0 0 0 0 rgba(255, 51, 102, 0)' }
        }
      }
    },
  },
  plugins: [],
}
