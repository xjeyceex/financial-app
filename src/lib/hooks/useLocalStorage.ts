'use client';

import { useState, useEffect, useCallback } from 'react';
import { openDB } from 'idb';

const DB_NAME = 'AppStorage';
const STORE_NAME = 'keyval';

const getDb = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export function useIndexedDB<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);

  // Load value from IndexedDB
  useEffect(() => {
    const load = async () => {
      try {
        const db = await getDb();
        const stored = await db.get(STORE_NAME, key);
        if (stored !== undefined) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`IndexedDB read error for key "${key}":`, error);
      } finally {
        setIsReady(true);
      }
    };
    load();
  }, [key]);

  const setStoredValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      try {
        const computedValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(value)
            : newValue;

        const db = await getDb();
        await db.put(STORE_NAME, computedValue, key);
        setValue(computedValue);
      } catch (error) {
        console.error(`IndexedDB write error for key "${key}":`, error);
      }
    },
    [key, value]
  );

  if (!isReady) {
    return [initialValue, () => {}, false] as const;
  }

  return [value, setStoredValue, true] as const;
}
