'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '../../../lib/hooks/useLocalStorage';
import EntryForm from './_components/EntryForm';
import EntryList from './_components/EntryList';
import Summary from './_components/Summary';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FiPlus } from 'react-icons/fi';
import { Entry } from '../../../lib/types';
import { Pencil } from 'lucide-react';

type BudgetData = {
  id: string;
  name: string;
  entries: Entry[];
  budget: number;
};

export default function MoneyTrackerPage() {
  const [budgets, setBudgets] = useLocalStorage<BudgetData[]>('budgets', [
    { id: uuidv4(), name: 'Budget 1', entries: [], budget: 5000 },
  ]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [activeBudgetIndex, setActiveBudgetIndex] = useState(0);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(budgets[activeBudgetIndex]?.name);

  const [newBudgetModalOpen, setNewBudgetModalOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');

  useEffect(() => {
    setBudgets((prev) =>
      prev.map((b) => ({
        ...b,
        id: b.id || uuidv4(),
      }))
    );
  }, [setBudgets]);

  useEffect(() => {
    setNameInput(budgets[activeBudgetIndex]?.name);
  }, [activeBudgetIndex, budgets]);

  const currentBudget = budgets[activeBudgetIndex];

  const updateCurrentBudget = (newData: Partial<BudgetData>) => {
    setBudgets((prev) => {
      const updated = [...prev];
      updated[activeBudgetIndex] = {
        ...updated[activeBudgetIndex],
        ...newData,
      };
      return updated;
    });
  };

  const addEntry = (entry: Entry) => {
    updateCurrentBudget({ entries: [entry, ...currentBudget.entries] });
    setModalOpen(false);
  };

  const updateEntry = (updated: Entry) => {
    updateCurrentBudget({
      entries: currentBudget.entries.map((e) =>
        e.id === updated.id ? updated : e
      ),
    });
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    updateCurrentBudget({
      entries: currentBudget.entries.filter((e) => e.id !== id),
    });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-1 md:px-6 lg:px-12 pt-4 space-y-8">
      {/* Budget Switcher */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm font-medium">Budget for:</label>

        {/* Select + Controls Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select
            value={currentBudget.id}
            onValueChange={(value) => {
              const index = budgets.findIndex((b) => b.id === value);
              if (index !== -1) {
                setActiveBudgetIndex(index);
                setEditingEntry(null);
                setIsEditingName(false);
                setIsEditingBudget(false);
              }
            }}
          >
            <SelectTrigger className="w-[160px] sm:w-[200px]">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isEditingName ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-2 py-1 border rounded text-sm flex-1 min-w-[120px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (nameInput.trim() !== '') {
                    setBudgets((prev) => {
                      const updated = [...prev];
                      updated[activeBudgetIndex] = {
                        ...updated[activeBudgetIndex],
                        name: nameInput.trim(),
                      };
                      return updated;
                    });
                    setIsEditingName(false);
                  }
                }}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNameInput(currentBudget.name);
                  setIsEditingName(false);
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1"
              >
                <span className="block sm:hidden">
                  <Pencil className="w-4 h-4" />
                </span>
                <span className="hidden sm:block">Rename</span>
              </Button>

              {/* + Icon for New Budget */}
              <Dialog
                open={newBudgetModalOpen}
                onOpenChange={setNewBudgetModalOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8 p-0 flex items-center justify-center"
                  >
                    <FiPlus size={28} strokeWidth={3} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Budget Name"
                      value={newBudgetName}
                      onChange={(e) => setNewBudgetName(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        const trimmed = newBudgetName.trim();
                        if (trimmed) {
                          const newBudget: BudgetData = {
                            id: uuidv4(),
                            name: trimmed,
                            entries: [],
                            budget: 5000,
                          };
                          setBudgets((prev) => [...prev, newBudget]);
                          setActiveBudgetIndex(budgets.length);
                          setNewBudgetName('');
                          setNewBudgetModalOpen(false);
                        }
                      }}
                    >
                      Create Budget
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard */}
      <section className="flex flex-col lg:flex-row gap-6">
        {/* Summary */}
        <div className="lg:w-2/3 space-y-3">
          <div className="rounded-2xl bg-muted/40 dark:bg-muted/10 shadow-sm">
            <Summary
              budgetId={currentBudget.id}
              budgetName={currentBudget.name}
              entries={currentBudget.entries}
              budget={currentBudget.budget}
              setBudget={(value) => updateCurrentBudget({ budget: value })}
              isEditingBudget={isEditingBudget}
              setIsEditingBudget={setIsEditingBudget}
            />
          </div>
        </div>

        {/* Expenses */}
        <div className="lg:w-1/3 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Your Expenses</h2>
          <EntryList
            entries={currentBudget.entries}
            onDelete={deleteEntry}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setModalOpen(true);
            }}
          />
        </div>
      </section>

      {/* Entry Form Modal */}
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
          <DialogContent className="max-w-md">
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
              budgetId={currentBudget.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
