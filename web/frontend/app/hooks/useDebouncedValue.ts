import { useEffect, useState } from 'react';

/**
 * Returns a value that only updates after `delayMs` has passed without `value` changing.
 *
 * @example
 *   const debouncedQuery = useDebouncedValue(query, 300);
 */
const useDebouncedValue = <T>(value: T, delayMs: number): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timeout);
    }, [value, delayMs]);

    return debounced;
};

export default useDebouncedValue;
