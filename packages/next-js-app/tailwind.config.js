
module.exports = {
  content: [
    './app/**/*.{html,js,ts,jsx,tsx}',
    './components/**/*.{html,js,ts,jsx,tsx}',
    './layouts/**/*.{html,js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'cardinal': {
          800: '#ce3241',
          900: '#bb132f',
        },
        'oynx': '#0E0E2C'
      }
    },
  },
  variants: {
    extend: {
    },
  },
  plugins: [],
}
