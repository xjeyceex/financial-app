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
import { FiEdit, FiPlus, FiRepeat, FiTrash } from 'react-icons/fi';
import { Entry } from '../../../lib/types';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import ConfirmDialog from './_components/DeleteBudgetDialog';

type BudgetData = {
  id: string;
  name: string;
  entries: Entry[];
  budget: number;
  recurring: boolean;
};

export default function MoneyTrackerPage() {
  const [budgets, setBudgets] = useLocalStorage<BudgetData[]>('budgets', [
    {
      id: uuidv4(),
      name: 'Budget 1',
      entries: [],
      budget: 5000,
      recurring: true,
    },
  ]);

  const [activeBudgetIndex, setActiveBudgetIndex] = useState(0);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [editBudgetModalOpen, setEditBudgetModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(budgets[0]?.name);

  const [newBudgetModalOpen, setNewBudgetModalOpen] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetRecurring, setNewBudgetRecurring] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [isEditingBudget, setIsEditingBudget] = useState(false);

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

  const handlePayDebt = (amount: number) => {
    if (!currentBudget) return;

    const debtPaymentEntry: Entry = {
      id: uuidv4(),
      budgetId: currentBudget.id,
      amount: amount, // ✅ make it positive
      date: new Date().toISOString(),
      item: 'Debt Payment',
    };

    updateCurrentBudget({
      entries: [debtPaymentEntry, ...currentBudget.entries],
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Budget Select */}
          <Select
            value={currentBudget.id}
            onValueChange={(value) => {
              const index = budgets.findIndex((b) => b.id === value);
              if (index !== -1) {
                setActiveBudgetIndex(index);
                setEditingEntry(null);
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
                  {b.recurring && (
                    <FiRepeat
                      className="ml-2 w-4 h-4 text-muted-foreground"
                      title="Recurring"
                    />
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Edit Budget Dialog */}
          <Dialog
            open={editBudgetModalOpen}
            onOpenChange={setEditBudgetModalOpen}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="budget-name"
                    className="text-sm font-medium pb-2 block"
                  >
                    Budget Name
                  </label>
                  <Input
                    id="budget-name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Switch
                    id="edit-recurring-toggle"
                    checked={budgets[activeBudgetIndex]?.recurring || false}
                    onCheckedChange={(checked) => {
                      const updated = [...budgets];
                      updated[activeBudgetIndex].recurring = checked;
                      setBudgets(updated);
                    }}
                  />
                  <label
                    htmlFor="edit-recurring-toggle"
                    className="text-sm font-medium"
                  >
                    Recurring
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      if (nameInput.trim() !== '') {
                        const updated = [...budgets];
                        updated[activeBudgetIndex].name = nameInput.trim();
                        setBudgets(updated);
                        setEditBudgetModalOpen(false);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <HiOutlineDotsHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditBudgetModalOpen(true)}>
                <FiEdit className="mr-2 w-4 h-4" />
                Edit Budget
              </DropdownMenuItem>

              {activeBudgetIndex !== 0 && (
                <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                  <FiTrash className="mr-2 w-4 h-4 text-red-500" />
                  Delete Budget
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setNewBudgetModalOpen(true)}>
                <FiPlus className="mr-2 w-4 h-4" />
                New Budget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Delete Budget Button with Tooltip and Confirm Dialog */}

          <ConfirmDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onConfirm={() => {
              const updated = [...budgets];
              updated.splice(activeBudgetIndex, 1);
              setBudgets(updated);
              setActiveBudgetIndex(0);
              setEditBudgetModalOpen(false);
            }}
            title="Delete Budget"
            description={`Are you sure you want to delete "${budgets[activeBudgetIndex]?.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            destructive
          />

          {/* Create Budget Dialog */}
          <Dialog
            open={newBudgetModalOpen}
            onOpenChange={setNewBudgetModalOpen}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Budget Name"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="recurring-toggle"
                    checked={newBudgetRecurring}
                    onCheckedChange={setNewBudgetRecurring}
                  />
                  <label htmlFor="recurring-toggle" className="text-sm">
                    Recurring
                  </label>
                </div>
                <Button
                  onClick={() => {
                    const trimmed = newBudgetName.trim();
                    if (trimmed) {
                      const newBudget: BudgetData = {
                        id: uuidv4(),
                        name: trimmed,
                        entries: [],
                        budget: 5000,
                        recurring: newBudgetRecurring,
                      };
                      setBudgets((prev) => [...prev, newBudget]);
                      setActiveBudgetIndex(budgets.length);
                      setNewBudgetName('');
                      setNewBudgetRecurring(false);
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
      </div>

      {/* Dashboard */}
      <section className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-3">
          <div className="rounded-2xl bg-muted/40 dark:bg-muted/10 shadow-sm">
            <Summary
              budgetId={currentBudget.id}
              entries={currentBudget.entries}
              budget={currentBudget.budget}
              setBudget={(value) => updateCurrentBudget({ budget: value })}
              isEditingBudget={isEditingBudget}
              setIsEditingBudget={setIsEditingBudget}
              onPayDebt={handlePayDebt}
              recurring={currentBudget.recurring}
            />
          </div>
        </div>

        <div className="lg:w-1/3 space-y-3">
          <h2 className="text-xl font-semibold mb-2">Your Expenses</h2>
          <EntryList
            entries={currentBudget.entries}
            onDelete={deleteEntry}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setModalOpen(true);
            }}
            recurring={currentBudget.recurring}
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
