'use client';

import { useEffect, useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const item = localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prevValue) => {
        const computedValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prevValue)
            : newValue;

        try {
          localStorage.setItem(key, JSON.stringify(computedValue));
        } catch (error) {
          console.error(`Error writing to localStorage key "${key}":`, error);
        }

        return computedValue;
      });
    },
    [key]
  );

  useEffect(() => {
    const handleStorage = () => {
      try {
        const item = localStorage.getItem(key);
        if (item) setValue(JSON.parse(item));
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  // Prevent SSR mismatch by returning undefined before hydration
  if (!isClient) {
    return [initialValue, () => {}] as const;
  }

  return [value, setStoredValue] as const;
}
