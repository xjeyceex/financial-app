import { openDB } from 'idb';
import { Budget, OneTimeBudget, OneTimeEntry } from './typesv2';

const DB_NAME = 'BudgetApp';
const DB_VERSION = 3;
const STORE_NAME = 'budgets';
const CALC_STORE = 'calculator';
const ONETIME_BUDGET_STORE = 'oneTimeBudgets';
const ONETIME_ENTRY_STORE = 'oneTimeEntries';
const ENTRY_STORE = 'entries';

export const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CALC_STORE)) {
        db.createObjectStore(CALC_STORE);
      }
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        const store = db.createObjectStore(ENTRY_STORE, { keyPath: 'id' });
        store.createIndex('budgetId', 'budgetId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('oneTimeBudgets')) {
        db.createObjectStore('oneTimeBudgets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('oneTimeEntries')) {
        const store = db.createObjectStore('oneTimeEntries', { keyPath: 'id' });
        store.createIndex('budgetId', 'budgetId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
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

// One-Time Budgets
export const saveOneTimeBudget = async (budget: OneTimeBudget) => {
  const db = await getDb();
  await db.put(ONETIME_BUDGET_STORE, budget);
};

export const getAllOneTimeBudgets = async (): Promise<OneTimeBudget[]> => {
  const db = await getDb();
  return db.getAll(ONETIME_BUDGET_STORE);
};

export const loadOneTimeBudget = async (budgetId: string) => {
  const db = await getDb();
  return db.get(ONETIME_BUDGET_STORE, budgetId);
};

export const deleteOneTimeBudget = async (budgetId: string) => {
  const db = await getDb();
  await db.delete(ONETIME_BUDGET_STORE, budgetId);
};

// One-Time Entries
export const saveOneTimeEntry = async (entry: OneTimeEntry) => {
  const db = await getDb();
  await db.put(ONETIME_ENTRY_STORE, entry);
};

export const getOneTimeEntriesByBudget = async (
  budgetId: string
): Promise<OneTimeEntry[]> => {
  const db = await getDb();
  return db.getAllFromIndex(ONETIME_ENTRY_STORE, 'budgetId', budgetId);
};

export const deleteOneTimeEntry = async (entryId: string) => {
  const db = await getDb();
  await db.delete(ONETIME_ENTRY_STORE, entryId);
};
