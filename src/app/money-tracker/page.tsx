'use client';

import { useState } from 'react';
import { useLocalStorage } from '../../../lib/hooks/useLocalStorage';
import EntryForm from './_components/EntryForm';
import EntryList from './_components/EntryList';
import Summary from './_components/Summary';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FiPlus } from 'react-icons/fi';
import { Entry } from '../../../lib/types';

export default function MoneyTrackerPage() {
  const [entries, setEntries] = useLocalStorage<Entry[]>('entries', []);
  const [budget, setBudget] = useLocalStorage<number>('budget', 5000);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addEntry = (entry: Entry) => {
    setEntries((prev) => [entry, ...prev]);
    setModalOpen(false);
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
    <main className="max-w-7xl px-1 md:px-6 lg:px-12 py-4 space-y-8">
      {/* Dashboard */}
      <section className="flex flex-col lg:flex-row gap-6">
        {/* Wider Summary (2/3 width) */}
        <div className="lg:w-2/3 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="rounded-2xl  bg-muted/40 dark:bg-muted/10 shadow-sm">
            <Summary entries={entries} budget={budget} setBudget={setBudget} />
          </div>
        </div>

        {/* Narrower Expenses (1/3 width) */}
        <div className="lg:w-1/3 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Your Expenses</h2>
          <div>
            <EntryList
              entries={entries}
              onDelete={deleteEntry}
              onEdit={(entry) => {
                setEditingEntry(entry);
                setModalOpen(true);
              }}
            />
          </div>
        </div>
      </section>

      {/* Add Entry Button + Modal */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-12 w-12 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center"
              aria-label="Add Expense"
            >
              <FiPlus size={28} strokeWidth={3} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md translate-y-[-85%]">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Expense' : 'Add Expense'}
              </DialogTitle>
            </DialogHeader>
            <EntryForm
              onAdd={addEntry}
              onUpdate={updateEntry}
              editingEntry={editingEntry}
              cancelEdit={() => {
                cancelEdit();
                setModalOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
