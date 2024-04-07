//themes

const myThemes = {
  dark: {
    primary: 'hsl(227, 10%, 25%)',
    secondary: 'hsl(255, 9%, 69%)',
    error: 'hsl(9, 52%, 57%)',
    accent: 'hsl(316, 96%, 60%)',
    neutral: 'hsl(240, 11%, 8%)',
    info: 'hsl(187, 11%, 60%)',
    success: 'hsl(117, 25%, 80%)',
    warning: 'hsl(50, 98%, 50%)',
    'primary-content': 'hsl(0, 0%, 98%)',
    'error-content': 'hsl(0, 0%, 98%)',
    'base-content': 'hsl(227, 0%, 60%)',
    'base-100': 'hsl(227, 10%, 20%)',
    'base-200': 'hsl(227, 10%, 10%)',
    'base-300': 'hsl(227, 10%, 8%)',
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    require('daisyui'),
    require('tailwindcss-animated'),
    require('autoprefixer'),
  ],
  daisyui: {
    logs: false,
    themes: [myThemes],
  },
};
