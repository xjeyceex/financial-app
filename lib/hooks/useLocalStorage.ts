'use client';

import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }

    setIsHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue] as const;
}
