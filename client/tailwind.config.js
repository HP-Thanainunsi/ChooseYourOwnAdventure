/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', '"Cinzel"', 'serif'],
      },
      colors: {
        emerald: {
          950: '#021e14',
          900: '#043927',
          800: '#064e3b',
          700: '#047857',
        },
        teak: {
          950: '#1c130d',
          900: '#2c1810',
          800: '#3d2314',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#d4af37',
          600: '#ca8a04',
          700: '#a16207',
        },
        midnight: {
          950: '#060a17',
          900: '#0b132b',
          800: '#1c2541',
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':     'fadeIn 0.6s ease-out both',
        'slide-right': 'slideRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float':       'float 5s ease-in-out infinite',
        'float-slow':  'floatSlow 7s ease-in-out infinite',
        'glow':        'glow 3s ease-in-out infinite alternate',
        'gold-pulse':  'goldPulse 2.5s ease-in-out infinite alternate',
        'spin-slow':   'spin 12s linear infinite',
        'bounce-in':   'bounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer':     'shimmer 2.5s linear infinite',
        'pulse-dot':   'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%':      { transform: 'translateY(-8px) scale(1.02)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)' },
          '100%': { boxShadow: '0 0 50px rgba(212, 175, 55, 0.65), 0 0 90px rgba(212, 175, 55, 0.2)' },
        },
        goldPulse: {
          '0%':   { borderColor: 'rgba(212, 175, 55, 0.3)', boxShadow: '0 0 15px rgba(212, 175, 55, 0.15)' },
          '100%': { borderColor: 'rgba(212, 175, 55, 0.8)', boxShadow: '0 0 35px rgba(212, 175, 55, 0.45)' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '50%':  { opacity: '1', transform: 'scale(1.08)' },
          '70%':  { transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0.5)', opacity: '0.3' },
          '40%':           { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
