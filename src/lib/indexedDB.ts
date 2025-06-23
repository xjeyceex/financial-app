import { openDB } from 'idb';
import { Budget } from './typesv2';

const DB_NAME = 'BudgetApp';
const DB_VERSION = 2;
const STORE_NAME = 'budgets';
const CALC_STORE = 'calculator';

export const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CALC_STORE)) {
        db.createObjectStore(CALC_STORE);
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

export const loadBudget = async (budgetId: string) => {
  const db = await getDb();
  return db.get(STORE_NAME, budgetId);
};

export const saveCalculatorState = async (state: {
  displayValue: string;
  history: string[];
}) => {
  const db = await getDb();
  await db.put(CALC_STORE, state, 'state');
};

export const loadCalculatorState = async () => {
  const db = await getDb();
  return db.get(CALC_STORE, 'state');
};
