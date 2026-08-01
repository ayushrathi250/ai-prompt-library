import { useEffect, useState } from 'react';

/**
 * Returns `value` after it has stayed unchanged for `delay` ms.
 * Used for the 300ms global search debounce.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
