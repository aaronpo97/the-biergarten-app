/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
    themes: [
      {
        default: {
          primary: 'hsl(227, 46%, 25%)',
          secondary: 'hsl(47, 100%, 80%)',
          accent: '#fe3bd9',
          neutral: '#131520',
          info: '#0A7CFF',
          success: '#8ACE2B',
          warning: '#F9D002',
          error: '#CF1259',
          'primary-content': '#FAF9F6',
          'error-content': '#FAF9F6',
          'base-100': 'hsl(190, 4%, 15%)',
          'base-200': 'hsl(190, 4%, 12%)',
          'base-300': 'hsl(190, 4%, 10%)',
        },
      },
    ],
  },
};
