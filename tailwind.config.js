/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#faf5ec',
          200: '#f4ead8',
          300: '#ecdcbf',
          400: '#e0c79e',
          500: '#d2af7e',
        },
        rose: {
          50: '#fdf2f4',
          100: '#fbe4e9',
          200: '#f7ccd6',
          300: '#f0a7ba',
          400: '#e67a98',
          500: '#d95378',
          600: '#c13a62',
          700: '#a02e50',
          800: '#832a45',
          900: '#6e283d',
        },
        sage: {
          50: '#f3f6f1',
          100: '#e3ebe0',
          200: '#c7d8c2',
          300: '#a3bd9c',
          400: '#7f9d76',
          500: '#628059',
          600: '#4c6645',
          700: '#3d5238',
          800: '#324230',
          900: '#2a3729',
        },
        sky: {
          50: '#f0f6fb',
          100: '#dcebf6',
          200: '#bcd9ec',
          300: '#8bc0dd',
          400: '#54a1c9',
          500: '#3785b3',
          600: '#2c6a95',
          700: '#28577a',
          800: '#284b65',
          900: '#273f56',
        },
        gold: {
          50: '#fdf9ef',
          100: '#faf0d3',
          200: '#f4dfa3',
          300: '#eec871',
          400: '#e8b04c',
          500: '#d9952f',
          600: '#bd7523',
          700: '#9c561f',
          800: '#804420',
          900: '#6b381e',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(110, 40, 61, 0.06), 0 1px 2px rgba(110, 40, 61, 0.04)',
        card: '0 8px 24px rgba(110, 40, 61, 0.08), 0 2px 6px rgba(110, 40, 61, 0.04)',
        float: '0 16px 48px rgba(110, 40, 61, 0.12), 0 4px 12px rgba(110, 40, 61, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
