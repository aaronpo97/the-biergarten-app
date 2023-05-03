import { useState, useEffect } from 'react';
import useMediaQuery from './useMediaQuery';

/**
 * A custom hook to manage the theme of the app. If a preferred theme is not set in
 * localStorage, it will use what the user's browser prefers as determined by the
 * prefers-color-scheme media query. If the user changes their preferred theme, it will be
 * saved in localStorage and used in subsequent visits.
 *
 * @returns ThemeState.theme - The current theme of the app.
 * @returns ThemeState.setTheme - A setter function to change the theme of the app.
 */
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (prefersDarkMode && !savedTheme) {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
      return;
    }
    setTheme(savedTheme as 'light' | 'dark');
  }, [prefersDarkMode, theme]);

  return { theme, setTheme };
};

export default useTheme;
