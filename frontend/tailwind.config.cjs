const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './views/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './state/**/*.{js,ts}',
    './utils/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF', // now white background
        accent: '#0b0b0b', // dark text
        primary: '#1f2937',
        brand: '#5C3A21' // modern dark brown
      },
      fontFamily: {
        sans: ['var(--font-base)', ...defaultTheme.fontFamily.sans],
        'b-titr': ['var(--font-fa)', 'B Titr', ...defaultTheme.fontFamily.sans],
        'cinzel': ['var(--font-en)', ...defaultTheme.fontFamily.serif]
      }
    }
  },
  plugins: []
}
