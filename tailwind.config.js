/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004f9f',
        'primary-dark': '#003d7a',
        'primary-light': '#e8f0fb',
        accent: '#c2410c',
        'accent-dark': '#9a3412',
        navy: '#1e3a5f',
        'navy-dark': '#152b47',
        surface: '#f8fafc',
        border: '#e2e8f0',
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
