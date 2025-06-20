'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDb, getAllBudgets, saveBudget } from '../../../lib/db';
import { Budget } from '../../../lib/typesv2';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FiEdit, FiMoreHorizontal, FiPlus, FiTrash } from 'react-icons/fi';
import BudgetDialog from './_components/BudgetDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  calculatePeriodBalance,
  determinePayPeriod,
  formatPayPeriodDisplay,
  getCurrentPeriodDates,
  getLocalDateTime,
} from '../../../lib/functionsv2';
import { BudgetCard } from './_components/BudgetCard';

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formName, setFormName] = useState('');
  const [entryDesc, setEntryDesc] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    id: string;
    description: string;
    amount: string;
  } | null>(null);
  const [editingBudgetAmount, setEditingBudgetAmount] = useState(false);
  const [tempBudgetAmount, setTempBudgetAmount] = useState('');

  const [entryDate, setEntryDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  });

  const isPayday = (date: Date): boolean => {
    const day = date.getDate();
    return (
      day === 15 ||
      day === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    );
  };

  // Create new budget on payday
  const createNewBudgetOnPayday = async () => {
    const today = new Date();
    if (!isPayday(today)) return;

    const lastBudget = budgets[budgets.length - 1];
    if (
      lastBudget &&
      new Date(lastBudget.currentPeriod.startDate).getMonth() ===
        today.getMonth()
    ) {
      return;
    }

    // Calculate final balance of previous period
    const previousBalance = lastBudget
      ? calculatePeriodBalance(lastBudget.currentPeriod)
      : 0;

    const periodId = uuidv4();
    const periodDates = getCurrentPeriodDates(today);

    const newBudget: Budget = {
      id: uuidv4(),
      name: `Budget ${formatPayPeriodDisplay(periodDates.start, periodDates.end)}`,
      createdAt: today.toISOString(),
      currentPeriod: {
        id: periodId,
        amount: 0,
        entries: [],
        startDate: periodDates.start,
        endDate: periodDates.end,
        carriedOver: {
          savings: previousBalance > 0 ? previousBalance : 0,
          debt: previousBalance < 0 ? Math.abs(previousBalance) : 0,
        },
      },
      pastPeriods: lastBudget
        ? [
            ...(lastBudget.pastPeriods || []),
            {
              ...lastBudget.currentPeriod,
              finalBalance: previousBalance,
            },
          ]
        : [],
    };

    await saveBudget(newBudget);
    refreshBudgets();
  };

  useEffect(() => {
    const loadBudgets = async () => {
      const all = await getAllBudgets();
      setBudgets(all);
      const lastId = localStorage.getItem('selectedBudgetId');
      const found = all.find((b) => b.id === lastId) ?? all[0] ?? null;
      setSelectedBudget(found);
    };
    loadBudgets();

    // Check for payday every day
    const checkPayday = () => {
      const now = new Date();
      const msUntilMidnight =
        new Date(now).setHours(24, 0, 0, 0) - now.getTime();
      setTimeout(
        () => {
          createNewBudgetOnPayday();
          setInterval(createNewBudgetOnPayday, 24 * 60 * 60 * 1000);
        },
        msUntilMidnight > 0 ? msUntilMidnight : 0
      );
    };

    checkPayday();
    // eslint-disable-next-line
  }, []);

  const refreshBudgets = useCallback(
    async (targetId?: string) => {
      const all = await getAllBudgets();
      setBudgets(all);

      const found =
        all.find((b) => b.id === (targetId ?? selectedBudget?.id)) ??
        all[0] ??
        null;

      setSelectedBudget(found);

      if (found) {
        localStorage.setItem('selectedBudgetId', found.id);
      }
    },
    [selectedBudget?.id] // dependencies
  );

  const onEditPastAmount = async (periodId: string, newAmount: number) => {
    if (!selectedBudget) return;

    // Update the target period with new amount and recalculate finalBalance
    const updatedPastPeriods = (selectedBudget.pastPeriods ?? []).map(
      (period) =>
        period.id === periodId
          ? {
              ...period,
              amount: newAmount,
              finalBalance:
                newAmount -
                (period.entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0),
            }
          : period
    );

    // Determine the latest period (by endDate) to recalculate carriedOver
    const latest = [...updatedPastPeriods].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0];

    const newCarriedOver = {
      savings: latest.finalBalance > 0 ? latest.finalBalance : 0,
      debt: latest.finalBalance < 0 ? Math.abs(latest.finalBalance) : 0,
    };

    const updatedBudget = {
      ...selectedBudget,
      pastPeriods: updatedPastPeriods,
      currentPeriod: {
        ...selectedBudget.currentPeriod,
        carriedOver: newCarriedOver,
      },
    };

    const db = await getDb();
    await db.put('budgets', updatedBudget);
    refreshBudgets();
  };

  const handleBudgetAmountClick = () => {
    if (!selectedBudget) return;
    setTempBudgetAmount((selectedBudget.currentPeriod.amount ?? 0).toString());
    setEditingBudgetAmount(true);
  };

  const handleBudgetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempBudgetAmount(e.target.value);
  };

  const saveBudgetAmount = async () => {
    if (!selectedBudget || !tempBudgetAmount) return;

    const amount = parseFloat(tempBudgetAmount);
    if (isNaN(amount)) return;

    const db = await getDb();
    await db.put('budgets', {
      ...selectedBudget,
      currentPeriod: {
        ...selectedBudget.currentPeriod,
        amount: amount,
      },
    });

    setEditingBudgetAmount(false);
    refreshBudgets();
  };

  const cancelBudgetAmountEdit = () => {
    setEditingBudgetAmount(false);
  };

  const handleDialogSave = async () => {
    if (!formName.trim()) return;

    const today = new Date();
    const currentPayPeriod = determinePayPeriod(today.toISOString());

    const periodDates =
      currentPayPeriod === 'first'
        ? {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth(), 15),
          }
        : {
            start: new Date(today.getFullYear(), today.getMonth(), 16),
            end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          };

    let newBudgetId: string | undefined;

    if (dialogMode === 'create') {
      newBudgetId = uuidv4();
      await saveBudget({
        id: newBudgetId,
        name: formName.trim(),
        createdAt: today.toISOString(),
        currentPeriod: {
          id: uuidv4(),
          amount: 0,
          entries: [],
          startDate: periodDates.start.toISOString(),
          endDate: periodDates.end.toISOString(),
        },
      });
    } else if (selectedBudget) {
      const db = await getDb();
      await db.put('budgets', {
        ...selectedBudget,
        name: formName.trim(),
      });
      newBudgetId = selectedBudget.id;
    }

    setDialogOpen(false);
    refreshBudgets(newBudgetId); // ✅ Now sets the newly created/edited budget
  };

  const handleEntryEdit = (entry: {
    id: string;
    description?: string;
    amount: number;
  }) => {
    setEditingEntry({
      id: entry.id,
      description: entry.description ?? 'Unspecified',
      amount: entry.amount.toString(),
    });
    setEntryDialogOpen(true);
  };

  const isValidMathExpression = (input: string): boolean => {
    const sanitized = input.replace(/\s+/g, '');
    if (!/^[0-9+\-*/.]+$/.test(sanitized)) return false;

    try {
      const result = new Function(`return ${sanitized}`)();
      return typeof result === 'number' && isFinite(result);
    } catch {
      return false;
    }
  };

  const calculateAmount = (input: string): number => {
    const sanitized = input.replace(/\s+/g, '');
    return new Function(`return ${sanitized}`)();
  };

  const handlePayDebt = async ({
    type,
    amount,
  }: {
    type: 'debt' | 'savings';
    amount: number;
  }) => {
    if (!selectedBudget || amount <= 0) return;

    const isDebt = type === 'debt';
    const current = selectedBudget.currentPeriod;
    const carried = current.carriedOver ?? { savings: 0, debt: 0 };
    const entries = current.entries ?? [];

    const available = isDebt ? carried.debt : carried.savings;
    if (available <= 0) return;

    const payment = Math.min(available, amount);

    const newEntry = {
      id: uuidv4(),
      description: isDebt ? 'Debt Payment' : 'Used Savings',
      amount: payment, // ✅ always positive
      date: new Date().toISOString(),
    };

    const updatedCarriedOver = {
      ...carried,
      [type]: Math.max(0, available - payment),
    };

    const updatedBudget: Budget = {
      ...selectedBudget,
      currentPeriod: {
        ...current,
        entries: [...entries, newEntry],
        carriedOver: updatedCarriedOver,
      },
    };

    const db = await getDb();
    await db.put('budgets', updatedBudget);
    refreshBudgets();
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;

    const calculatedAmount = calculateAmount(entryAmount);
    if (isNaN(calculatedAmount)) return;

    const newEntry = {
      id: uuidv4(),
      description: entryDesc.trim() || 'Unspecified',
      amount: calculatedAmount,
      date: new Date(entryDate).toISOString(),
    };

    const entryDateObj = new Date(newEntry.date);
    const currentStart = new Date(selectedBudget.currentPeriod.startDate);
    const currentEnd = new Date(selectedBudget.currentPeriod.endDate);

    const db = await getDb();
    const updatedBudget = { ...selectedBudget };

    let newPastPeriodFinalBalance: number | null = null;

    // --- 1. Handle current period
    if (entryDateObj >= currentStart && entryDateObj <= currentEnd) {
      const current = updatedBudget.currentPeriod;

      // Add new entry
      current.entries = [...(current.entries ?? []), newEntry];

      const totalExpenses = current.entries.reduce(
        (sum, e) => sum + e.amount,
        0
      );
      const currentBalance = (current.amount || 0) - totalExpenses;

      // ✅ Reflect savings/debt based on current balance
      current.carriedOver = {
        savings: currentBalance > 0 ? currentBalance : 0,
        debt: currentBalance < 0 ? Math.abs(currentBalance) : 0,
      };
    } else {
      // --- 2. Try matching past period
      let matched = false;
      if (updatedBudget.pastPeriods) {
        for (const period of updatedBudget.pastPeriods) {
          const start = new Date(period.startDate);
          const end = new Date(period.endDate);
          if (entryDateObj >= start && entryDateObj <= end) {
            period.entries.push(newEntry);
            const total = period.entries.reduce((sum, e) => sum + e.amount, 0);
            period.finalBalance = (period.amount ?? 0) - total;
            matched = true;
            break;
          }
        }
      }

      // --- 3. Create new past period if unmatched
      if (!matched) {
        const year = entryDateObj.getFullYear();
        const month = entryDateObj.getMonth();
        const day = entryDateObj.getDate();

        let newStart: Date;
        let newEnd: Date;

        if (day <= 15) {
          newStart = new Date(year, month, 1);
          newEnd = new Date(year, month, 15, 23, 59, 59);
        } else {
          newStart = new Date(year, month, 16);
          newEnd = new Date(year, month + 1, 0, 23, 59, 59);
        }

        const total = newEntry.amount;

        const newPeriod = {
          id: uuidv4(),
          amount: 0,
          entries: [newEntry],
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
          finalBalance: 0 - total,
        };

        if (!updatedBudget.pastPeriods) {
          updatedBudget.pastPeriods = [];
        }

        updatedBudget.pastPeriods.push(newPeriod);
        newPastPeriodFinalBalance = newPeriod.finalBalance;
      }
    }

    // --- 4. Cleanup: Remove empty past periods
    updatedBudget.pastPeriods = updatedBudget.pastPeriods?.filter((period) => {
      const hasEntries = (period.entries ?? []).length > 0;
      const hasAmount = (period.amount ?? 0) !== 0;
      return hasEntries || hasAmount;
    });

    // --- 5. Only update carriedOver if a new past period was created
    if (newPastPeriodFinalBalance !== null) {
      updatedBudget.currentPeriod.carriedOver = {
        savings: newPastPeriodFinalBalance > 0 ? newPastPeriodFinalBalance : 0,
        debt:
          newPastPeriodFinalBalance < 0
            ? Math.abs(newPastPeriodFinalBalance)
            : 0,
      };
    }

    // --- 6. Save updated budget
    await db.put('budgets', updatedBudget);

    // --- 7. Reset form
    setEntryDesc('');
    setEntryAmount('');
    setEntryDate(getLocalDateTime());
    refreshBudgets();
  };

  const handleEntryDelete = async (entryId: string) => {
    if (!selectedBudget) return;

    const current = selectedBudget.currentPeriod;
    const past = selectedBudget.pastPeriods ?? [];

    const entryInCurrent = current.entries?.some((e) => e.id === entryId);
    let updatedBudget: Budget;

    if (entryInCurrent) {
      const updatedEntries = current.entries.filter((e) => e.id !== entryId);

      // ✅ Recalculate carriedOver based on remaining entries
      const total = updatedEntries.reduce((sum, e) => sum + e.amount, 0);
      const finalBalance = current.amount + total;

      const updatedCarriedOver = {
        savings: finalBalance > 0 ? finalBalance : 0,
        debt: finalBalance < 0 ? Math.abs(finalBalance) : 0,
      };

      updatedBudget = {
        ...selectedBudget,
        currentPeriod: {
          ...current,
          entries: updatedEntries,
          carriedOver: updatedCarriedOver,
        },
      };
    } else {
      // Delete from a past period
      const updatedPastPeriods = past
        .map((period) => {
          const entryExists = period.entries?.some((e) => e.id === entryId);
          if (!entryExists) return period;

          const updatedEntries = period.entries.filter((e) => e.id !== entryId);
          const totalExpenses = updatedEntries.reduce(
            (sum, e) => sum + e.amount,
            0
          );

          return {
            ...period,
            entries: updatedEntries,
            finalBalance: (period.amount || 0) + totalExpenses,
          };
        })
        .filter((period) => {
          const hasEntries = period.entries?.length > 0;
          const hasNonZeroAmount = (period.amount ?? 0) !== 0;
          return hasEntries || hasNonZeroAmount;
        });

      updatedBudget = {
        ...selectedBudget,
        pastPeriods: updatedPastPeriods,
      };

      // Recalculate carriedOver based on remaining past periods
      if (updatedPastPeriods.length === 0) {
        updatedBudget.currentPeriod.carriedOver = {
          savings: 0,
          debt: 0,
        };
      } else {
        const latest = [...updatedPastPeriods].sort(
          (a, b) =>
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
        )[0];
        const final = latest.finalBalance ?? 0;
        updatedBudget.currentPeriod.carriedOver = {
          savings: final > 0 ? final : 0,
          debt: final < 0 ? Math.abs(final) : 0,
        };
      }
    }

    const db = await getDb();
    await db.put('budgets', updatedBudget);
    refreshBudgets();
  };

  const handleEntryUpdate = async () => {
    if (!selectedBudget || !editingEntry) return;
    if (!isValidMathExpression(editingEntry.amount)) return;

    const calculatedAmount = calculateAmount(editingEntry.amount);
    const db = await getDb();
    const updatedBudget = { ...selectedBudget };

    let entryUpdated = false;

    // 1. Try updating in current period
    const currentEntries = updatedBudget.currentPeriod.entries ?? [];
    const updatedCurrentEntries = currentEntries.map((entry) => {
      if (entry.id === editingEntry.id) {
        entryUpdated = true;
        return {
          ...entry,
          description: editingEntry.description.trim() || 'Unspecified',
          amount: calculatedAmount,
        };
      }
      return entry;
    });

    if (entryUpdated) {
      updatedBudget.currentPeriod.entries = updatedCurrentEntries;
    } else {
      // 2. Try updating in past periods
      updatedBudget.pastPeriods = (updatedBudget.pastPeriods ?? []).map(
        (period) => {
          const found = period.entries?.some((e) => e.id === editingEntry.id);
          if (!found) return period;

          const updatedEntries = period.entries.map((entry) => {
            if (entry.id === editingEntry.id) {
              return {
                ...entry,
                description: editingEntry.description.trim() || 'Unspecified',
                amount: calculatedAmount,
              };
            }
            return entry;
          });

          const total = updatedEntries.reduce((sum, e) => sum + e.amount, 0);
          const finalBalance = (period.amount ?? 0) - total;

          return {
            ...period,
            entries: updatedEntries,
            finalBalance,
          };
        }
      );
    }

    // 3. Recalculate carriedOver for current period
    if (updatedBudget.pastPeriods?.length) {
      const totalFinalBalance = updatedBudget.pastPeriods.reduce(
        (sum, period) => {
          return sum + (period.finalBalance ?? 0);
        },
        0
      );

      updatedBudget.currentPeriod.carriedOver = {
        savings: totalFinalBalance > 0 ? totalFinalBalance : 0,
        debt: totalFinalBalance < 0 ? Math.abs(totalFinalBalance) : 0,
      };
    }

    // 4. Save and refresh
    await db.put('budgets', updatedBudget);
    setEntryDialogOpen(false);
    setEditingEntry(null);
    refreshBudgets();
  };

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;

    const runCleanup = async () => {
      const db = await getDb();
      let modified = false;

      for (const budget of budgets) {
        const pastPeriods = budget.pastPeriods ?? [];
        const cleanedPastPeriods = pastPeriods.filter(
          (period) =>
            (period.amount ?? 0) !== 0 || (period.entries?.length ?? 0) > 0
        );

        // Only update if there was a change
        if (cleanedPastPeriods.length < pastPeriods.length) {
          const updatedBudget: Budget = {
            ...budget,
            pastPeriods: cleanedPastPeriods,
          };
          await db.put('budgets', updatedBudget);
          modified = true;
        }
      }

      if (modified) refreshBudgets();
    };

    runCleanup();
  }, [budgets, refreshBudgets]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <Label>Select a budget</Label>
          <Select
            value={selectedBudget?.id}
            onValueChange={(id) => refreshBudgets(id)}
          >
            <SelectTrigger>
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
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <FiMoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setDialogMode('create');
                setFormName('');
                setDialogOpen(true);
              }}
            >
              <FiPlus className="mr-2 h-4 w-4" /> Create
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedBudget}
              onClick={() => {
                if (!selectedBudget) return;
                setDialogMode('edit');
                setFormName(selectedBudget.name);
                setDialogOpen(true);
              }}
            >
              <FiEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!selectedBudget}
              onClick={async () => {
                if (!selectedBudget) return;
                const confirmDelete = confirm(
                  `Delete "${selectedBudget.name}"?`
                );
                if (!confirmDelete) return;
                const db = await getDb();
                await db.delete('budgets', selectedBudget.id);
                refreshBudgets();
              }}
            >
              <FiTrash className="mr-2 h-4 w-4 text-red-500" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        {selectedBudget ? (
          <BudgetCard
            budget={selectedBudget}
            onAmountClick={handleBudgetAmountClick}
            onAmountChange={handleBudgetAmountChange}
            onSaveAmount={saveBudgetAmount}
            onCancelAmountEdit={cancelBudgetAmountEdit}
            editingBudgetAmount={editingBudgetAmount}
            tempBudgetAmount={tempBudgetAmount}
            onEntrySubmit={handleEntrySubmit}
            onEditPastAmount={onEditPastAmount}
            entryDesc={entryDesc}
            payDebt={handlePayDebt}
            setEntryDesc={setEntryDesc}
            entryAmount={entryAmount}
            setEntryAmount={setEntryAmount}
            entryDate={entryDate}
            setEntryDate={setEntryDate}
            isValidMathExpression={isValidMathExpression}
            calculateAmount={calculateAmount}
            onEntryEdit={handleEntryEdit}
            onEntryDelete={handleEntryDelete}
            onEditBudgetClick={() => {
              setDialogMode('edit');
              setFormName(selectedBudget.name);
              setDialogOpen(true);
            }}
          />
        ) : (
          <div className="p-4 border rounded bg-gray-50 dark:bg-zinc-900 text-center">
            <p>No budget selected</p>
            <Button
              onClick={() => {
                setDialogMode('create');
                setDialogOpen(true);
              }}
              className="mt-2"
            >
              Create New Budget
            </Button>
          </div>
        )}
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        name={formName}
        onNameChange={setFormName}
        onSave={handleDialogSave}
      />

      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingEntry.description}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (e.g., 85+15+30)</Label>
                <Input
                  value={editingEntry.amount}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      amount: e.target.value,
                    })
                  }
                />
                {editingEntry.amount.trim() !== '' &&
                  (isValidMathExpression(editingEntry.amount) ? (
                    <p className="text-sm text-green-600">
                      Calculated amount: ₱
                      {calculateAmount(editingEntry.amount).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">Invalid expression</p>
                  ))}
              </div>
              <Button className="w-full" onClick={handleEntryUpdate}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
