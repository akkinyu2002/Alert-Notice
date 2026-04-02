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
          50: '#eefcf7',
          100: '#d6f5ea',
          200: '#afe8d3',
          300: '#82d9ba',
          400: '#56c99f',
          500: '#2db483',
          600: '#1f946b',
          700: '#197657',
          800: '#165e47',
          900: '#144d3c',
        },
        danger: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc9c9',
          300: '#ffa3a3',
          400: '#ff7373',
          500: '#f14545',
          600: '#d93737',
          700: '#b92e2e',
          800: '#982a2a',
          900: '#7e2727',
        },
        success: {
          50: '#f0fdf5',
          100: '#dbf9e7',
          200: '#b8f0cf',
          300: '#84e1af',
          400: '#52cb8e',
          500: '#2faf72',
          600: '#228f5d',
          700: '#1d724d',
          800: '#1a5b3f',
          900: '#174b35',
        },
        dark: {
          700: '#1f2f2a',
          800: '#152521',
          900: '#0d1a17',
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
