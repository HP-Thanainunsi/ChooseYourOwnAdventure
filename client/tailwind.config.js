/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float':       'float 4s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'spin-slow':   'spin 8s linear infinite',
        'bounce-in':   'bounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer':     'shimmer 2s linear infinite',
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
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 50px rgba(168, 85, 247, 0.8), 0 0 100px rgba(168, 85, 247, 0.3)' },
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
