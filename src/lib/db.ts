// lib/db.ts
import { openDB } from 'idb';
import { Budget } from './typesv2';

const DB_NAME = 'MoneyTrackerDB';
const STORE_NAME = 'budgets';
const DB_VERSION = 1;

export type Entry = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

export const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveBudget = async (budget: Budget) => {
  const db = await getDb();
  await db.add(STORE_NAME, budget);
};

export const getAllBudgets = async (): Promise<Budget[]> => {
  const db = await getDb();
  return db.getAll(STORE_NAME);
};
