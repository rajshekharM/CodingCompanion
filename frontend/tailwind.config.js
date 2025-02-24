/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(17, 17, 27)',
        'background-alt': 'rgb(24, 24, 37)',
        primary: 'rgb(93, 95, 239)',
        'primary-alt': 'rgb(108, 110, 241)',
        secondary: 'rgb(30, 30, 46)',
        accent: 'rgb(147, 153, 178)',
        success: 'rgb(87, 189, 159)',
        error: 'rgb(243, 139, 168)',
        warning: 'rgb(249, 226, 175)',
        info: 'rgb(137, 180, 250)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
