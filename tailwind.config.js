//themes

const myThemes = {
  dark: {
    primary: 'hsl(227, 25%, 25%)',
    secondary: 'hsl(255, 9%, 69%)',
    error: 'hsl(9, 52%, 57%)',
    accent: 'hsl(316, 96%, 60%)',
    neutral: 'hsl(240, 11%, 8%)',
    info: 'hsl(187, 11%, 60%)',
    success: 'hsl(117, 25%, 80%)',
    warning: 'hsl(50, 98%, 50%)',
    'primary-content': 'hsl(0, 0%, 98%)',
    'error-content': 'hsl(0, 0%, 98%)',
    'base-100': 'hsl(227, 20%, 20%)',
    'base-200': 'hsl(227, 20%, 13%)',
    'base-300': 'hsl(227, 20%, 10%)',
  },
  light: {
    primary: 'hsl(180, 20%, 70%)',
    secondary: 'hsl(120, 10%, 70%)',
    error: 'hsl(4, 87%, 74%)',
    accent: 'hsl(93, 27%, 73%)',
    neutral: 'hsl(38, 31%, 91%)',
    info: 'hsl(163, 40%, 79%)',
    success: 'hsl(93, 27%, 73%)',
    warning: 'hsl(40, 76%, 73%)',
    'primary-content': 'hsl(0, 0%, 0%)',
    'error-content': 'hsl(0, 0%, 0%)',
    'base-300': 'hsl(180, 10%, 70%)',
    'base-200': 'hsl(180, 10%, 75%)',
    'base-100': 'hsl(180, 10%, 80%)',
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
