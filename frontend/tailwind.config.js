/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans','Inter','system-ui','sans-serif'],
      },
      colors: {
        gov: {
          900: '#060b18',
          800: '#0a0f1e',
          700: '#111827',
          600: '#141e31',
          500: '#1e2d45',
          border: 'rgba(255,255,255,0.05)',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 40%,#0ea5e9 100%)',
        'hero-city': 'linear-gradient(to bottom,rgba(15,23,42,0.65),rgba(15,23,42,0.85))',
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(59,130,246,0.3)',
        'glow-sm'  : '0 0 12px rgba(59,130,246,0.15)',
        'card'     : '0 1px 3px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.06)',
        'card-lg'  : '0 4px 24px rgba(0,0,0,0.10)',
      },
      animation: {
        'fade-up'   : 'fadeUp 0.4s ease-out both',
        'scale-in'  : 'scaleIn 0.3s ease-out both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
