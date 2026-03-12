import { useState, useEffect } from 'react';

/**
 * A hook that delays updating a value until after a specified delay has passed
 * since the last time the value was changed. Useful for "Search As You Type".
 * 
 * @param value The value to debounce (e.g., search query string)
 * @param delay The delay in milliseconds (e.g., 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the state after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay ends
    // This is what prevents the function from firing multiple times!
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
