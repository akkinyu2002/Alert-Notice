/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edf8f5',
          100: '#d5f1e8',
          200: '#ade3d2',
          300: '#79cfb7',
          400: '#46b695',
          500: '#229a78',
          600: '#177f62',
          700: '#14654f',
          800: '#144f40',
          900: '#123f34',
        },
        danger: {
          50: '#fff2f2',
          100: '#ffe2e2',
          200: '#ffcaca',
          300: '#ffa4a4',
          400: '#ff7474',
          500: '#ef4f4f',
          600: '#d73f3f',
          700: '#b83434',
          800: '#982f2f',
          900: '#7f2c2c',
        },
        success: {
          50: '#effbf6',
          100: '#d8f5e9',
          200: '#b2ebd2',
          300: '#7edbb5',
          400: '#4ec593',
          500: '#2ea974',
          600: '#22885e',
          700: '#1e6d4d',
          800: '#1a563f',
          900: '#164633',
        },
        dark: {
          700: '#1e302a',
          800: '#15251f',
          900: '#0f1b17',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
