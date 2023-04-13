import { useState, useEffect } from 'react';

/**
 * A custom react hook that provides a convenient way to query the viewport size and check
 * if it matches a given media query. The hook returns a boolean value indicating whether
 * the query matches the current viewport size.
 *
 * @example
 *   const isSmallScreen = useMediaQuery('(max-width: 600px)');
 *
 * @example
 *   const userPrefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * @param query - A media query string to match against.
 * @returns - A boolean indicating whether the given media query matches the current
 *   viewport size.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries|Media Queries} for more information on media queries in CSS.
 */
const useMediaQuery = (query: `(${string})`) => {
  /**
   * Initialize the matches state variable to false. This is updated whenever the viewport
   * size changes (i.e. when the component is mounted and when the window is resized)
   */
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    /**
     * Create a media query object based on the provided query string. This is used to
     * check if the media query matches the current viewport size.
     */
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    /**
     * Add a resize event listener to the window object, and update the `matches` state
     * variable whenever the viewport size changes.
     */
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);

    /**
     * Cleanup function that removes the resize event listener when the component is
     * unmounted or when the dependencies change.
     */
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;
