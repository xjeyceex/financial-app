// lib/indexedDB.ts
import { openDB } from 'idb';
import { BudgetStorage } from './types';

const DB_NAME = 'BudgetApp';
const STORE_NAME = 'budgets';

export const getDb = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // key = budgetId, value = BudgetStorage
      }
    },
  });
};

export const saveBudget = async (budgetId: string, data: BudgetStorage) => {
  const db = await getDb();
  await db.put(STORE_NAME, data, budgetId);
};

export const loadBudget = async (budgetId: string) => {
  const db = await getDb();
  return db.get(STORE_NAME, budgetId);
};
