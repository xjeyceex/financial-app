'use client';

import EntryForm from './_components/EntryForm';
import EntryList from './_components/EntryList';
import Summary from './_components/Summary';
import { useState, useEffect } from 'react';

export type Entry = {
  id: string;
  amount: number;
  item: string;
  date: string;
  description?: string;
};

export default function MoneyTrackerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [budget, setBudget] = useState<number>(5000);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('entries');
    const storedBudget = localStorage.getItem('budget');

    if (storedEntries) setEntries(JSON.parse(storedEntries));
    if (storedBudget) setBudget(parseFloat(storedBudget));
  }, []);

  // Save entries to localStorage on change
  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  // Save budget to localStorage on change
  useEffect(() => {
    localStorage.setItem('budget', budget.toString());
  }, [budget]);

  const addEntry = (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const updateEntry = (updated: Entry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  return (
    <main className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">💸 Money Tracker</h1>

      {/* Budget Input */}
      <section className="space-y-2">
        <label htmlFor="budget" className="block font-medium text-lg">
          Monthly Budget
        </label>
        <input
          id="budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-sm text-gray-500">
          Current budget:{' '}
          <span className="font-semibold text-gray-700">
            ₱{budget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </p>
      </section>

      {/* Dashboard on top */}
      <section>
        <Summary entries={entries} budget={budget} />
      </section>

      {/* Two-column layout: Add + List */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Add Expense (left) */}
        <div className="lg:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold">Add Expense</h2>
          <EntryForm
            onAdd={addEntry}
            onUpdate={updateEntry}
            editingEntry={editingEntry}
            cancelEdit={cancelEdit}
          />
        </div>

        {/* Expense List (right) */}
        <div className="lg:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold">Your Expenses</h2>
          <EntryList
            entries={entries}
            onDelete={deleteEntry}
            onEdit={(entry) => setEditingEntry(entry)}
          />
        </div>
      </div>
    </main>
  );
}
