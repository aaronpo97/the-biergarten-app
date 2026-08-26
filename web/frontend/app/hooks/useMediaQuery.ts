import { useSyncExternalStore } from 'react';

const subscribe = (query: string) => (callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
};

/**
 * Tracks whether a CSS media query currently matches the viewport, updating on change.
 *
 * @example
 *   const isSmallScreen = useMediaQuery('(max-width: 640px)');
 */
const useMediaQuery = (query: `(${string})`) =>
    useSyncExternalStore(
        subscribe(query),
        () => window.matchMedia(query).matches,
        () => false,
    );

export default useMediaQuery;
