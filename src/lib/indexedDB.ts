import { openDB } from 'idb';
import { Budget, OneTimeBudget, OneTimeEntry } from './typesv2';

const DB_NAME = 'BudgetApp';
const DB_VERSION = 1;

const STORE_NAME = 'budgets';
const CALC_STORE = 'calculator';
const ENTRY_STORE = 'entries';
const ONETIME_BUDGET_STORE = 'oneTimeBudgets';
const ONETIME_ENTRY_STORE = 'oneTimeEntries';
const APP_STATE_STORE = 'appState';

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
      if (!db.objectStoreNames.contains(ONETIME_BUDGET_STORE)) {
        db.createObjectStore(ONETIME_BUDGET_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ONETIME_ENTRY_STORE)) {
        const store = db.createObjectStore(ONETIME_ENTRY_STORE, { keyPath: 'id' });
        store.createIndex('budgetId', 'budgetId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains(APP_STATE_STORE)) {
        db.createObjectStore(APP_STATE_STORE, { keyPath: 'id' });
      }
    },
  });
};

// Recurring Budgets
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

// Calculator
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

// App State
export const saveLastVisited = async (page: string) => {
  const db = await getDb();
  await db.put(APP_STATE_STORE, { id: 'lastVisited', value: page });
};

export const getLastVisited = async (): Promise<string | null> => {
  const db = await getDb();
  const result = await db.get(APP_STATE_STORE, 'lastVisited');
  return result?.value ?? null;
};
