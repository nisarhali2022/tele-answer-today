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
        primary: '#2f5fa8',
        'primary-dark': '#21477f',
        'primary-light': '#eef5ff',
        accent: '#f59e0b',
        'accent-dark': '#b45309',
        navy: '#17233f',
        'navy-dark': '#111827',
        surface: '#f7fafc',
        border: '#d9e2ec',
        'text-primary': '#111827',
        'text-secondary': '#4b5563',
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
