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
  plugins: [
    require('daisyui'), 
    require('tailwindcss-animate')
  ],

  daisyui: {
    logs: false,
    themes: [
      {
        default: {
          primary: 'hsl(227, 23%, 20%)',
          secondary: '#ABA9C3',
          error: '#c17c74',
          accent: '#fe3bd9',
          neutral: '#131520',
          info: '#0A7CFF',
          success: '#8ACE2B',
          warning: '#F9D002',
          'primary-content': '#FAF9F6',
          'error-content': '#FAF9F6',
          'base-100': 'hsl(190, 4%, 9%)',
          'base-200': 'hsl(190, 4%, 8%)',
          'base-300': 'hsl(190, 4%, 5%)',
        },
      },
    ],
  },
};
