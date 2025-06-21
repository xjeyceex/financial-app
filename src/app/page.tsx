'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDb, getAllBudgets, saveBudget } from '../lib/db';
import { Budget, Entry } from '../lib/typesv2';
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
import BudgetDialog from '../components/BudgetDialog';
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
  formatDateForDatetimeLocal,
  formatPayPeriodDisplay,
  getCurrentPeriodDates,
  getLocalDateTime,
} from '../lib/functionsv2';
import { BudgetCard } from '../components/BudgetCard';
import { Switch } from '@/components/ui/switch';

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
    date: string;
    excludeFromDepletion: boolean;
  } | null>(null);
  const [editingBudgetAmount, setEditingBudgetAmount] = useState(false);
  const [tempBudgetAmount, setTempBudgetAmount] = useState('');
  const [entryExclude, setEntryExclude] = useState(false);

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
    const name = formName.trim();
    if (!name) return;

    const today = new Date();
    const isFirstPeriod = determinePayPeriod(today.toISOString()) === 'first';

    const start = isFirstPeriod
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 16);

    const end = isFirstPeriod
      ? new Date(today.getFullYear(), today.getMonth(), 15)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let newBudgetId: string | undefined;

    if (dialogMode === 'create') {
      newBudgetId = uuidv4();
      await saveBudget({
        id: newBudgetId,
        name,
        createdAt: today.toISOString(),
        currentPeriod: {
          id: uuidv4(),
          amount: 0,
          entries: [],
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });
    } else if (selectedBudget) {
      const db = await getDb();
      await db.put('budgets', {
        ...selectedBudget,
        name,
      });
      newBudgetId = selectedBudget.id;
    }

    setDialogOpen(false);
    refreshBudgets(newBudgetId);
  };

  const handleEntryEdit = (entry: Entry) => {
    setEditingEntry({
      id: entry.id,
      description: entry.description ?? 'Unspecified',
      amount: entry.amount.toString(),
      date: formatDateForDatetimeLocal(entry.date), // ✅ Local time
      excludeFromDepletion: entry.excludeFromDepletion ?? false,
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
    const entries = current.entries ?? [];

    const carried = current.carriedOver ?? { savings: 0, debt: 0 };
    const available = isDebt ? carried.debt : carried.savings;
    if (available <= 0) return;

    const payment = Math.min(available, amount);

    const newEntry = {
      id: uuidv4(),
      description: isDebt ? 'Debt Payment' : 'Used Savings',
      amount: payment, // ✅ always positive
      date: new Date().toISOString(),
    };

    const updatedBudget: Budget = {
      ...selectedBudget,
      currentPeriod: {
        ...current,
        entries: [...entries, newEntry],
        // ✅ Let the cleanup useEffect recalculate carriedOver
        // This line is removed for consistency
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
      excludeFromDepletion: entryExclude, // ✅ Add this line
    };

    const entryDateObj = new Date(newEntry.date);
    const currentStart = new Date(selectedBudget.currentPeriod.startDate);
    const currentEnd = new Date(selectedBudget.currentPeriod.endDate);

    const db = await getDb();
    const updatedBudget = { ...selectedBudget };

    // 1. Add to current period if in range
    if (entryDateObj >= currentStart && entryDateObj <= currentEnd) {
      updatedBudget.currentPeriod.entries = [
        ...(updatedBudget.currentPeriod.entries ?? []),
        newEntry,
      ];
    } else {
      // 2. Add to matching past period
      let matched = false;
      if (updatedBudget.pastPeriods) {
        for (const period of updatedBudget.pastPeriods) {
          const start = new Date(period.startDate);
          const end = new Date(period.endDate);
          if (entryDateObj >= start && entryDateObj <= end) {
            period.entries.push(newEntry);
            matched = true;
            break;
          }
        }
      }

      // 3. Create new past period if unmatched
      if (!matched) {
        const year = entryDateObj.getFullYear();
        const month = entryDateObj.getMonth();
        const day = entryDateObj.getDate();

        const newStart = new Date(year, month, day <= 15 ? 1 : 16);
        const newEnd = new Date(
          year,
          month + (day <= 15 ? 0 : 1),
          day <= 15 ? 15 : 0,
          23,
          59,
          59
        );

        const newPeriod = {
          id: uuidv4(),
          amount: 0,
          entries: [newEntry],
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
          finalBalance: -newEntry.amount,
        };

        if (!updatedBudget.pastPeriods) {
          updatedBudget.pastPeriods = [];
        }

        updatedBudget.pastPeriods.push(newPeriod);
      }
    }

    // 4. Cleanup: Remove empty past periods
    updatedBudget.pastPeriods = updatedBudget.pastPeriods?.filter((period) => {
      const hasEntries = (period.entries ?? []).length > 0;
      const hasAmount = (period.amount ?? 0) !== 0;
      return hasEntries || hasAmount;
    });

    // 5. Save and refresh
    await db.put('budgets', updatedBudget);

    // 6. Reset form state
    setEntryDesc('');
    setEntryAmount('');
    setEntryDate(getLocalDateTime());
    setEntryExclude(false); // ✅ reset exclude state
    refreshBudgets();
  };

  const handleEntryDelete = async (entryId: string) => {
    if (!selectedBudget) return;

    const current = selectedBudget.currentPeriod;
    const past = selectedBudget.pastPeriods ?? [];

    let updatedBudget: Budget;

    const entryInCurrent = current.entries?.some((e) => e.id === entryId);

    if (entryInCurrent) {
      const updatedEntries = current.entries.filter((e) => e.id !== entryId);

      updatedBudget = {
        ...selectedBudget,
        currentPeriod: {
          ...current,
          entries: updatedEntries,
        },
      };
    } else {
      const updatedPastPeriods = past.map((period) => {
        const entryExists = period.entries?.some((e) => e.id === entryId);
        if (!entryExists) return period;

        const updatedEntries = period.entries.filter((e) => e.id !== entryId);

        return {
          ...period,
          entries: updatedEntries,
        };
      });

      updatedBudget = {
        ...selectedBudget,
        pastPeriods: updatedPastPeriods,
      };
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
          date: editingEntry.date, // ✅ Add date update
          excludeFromDepletion: editingEntry.excludeFromDepletion ?? false,
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
                date: editingEntry.date, // ✅ Add date update here too
                excludeFromDepletion:
                  editingEntry.excludeFromDepletion ?? false,
              };
            }
            return entry;
          });

          return {
            ...period,
            entries: updatedEntries,
          };
        }
      );
    }

    await db.put('budgets', updatedBudget);
    setEntryDialogOpen(false);
    setEditingEntry(null);
    setEntryExclude(false);
    refreshBudgets();
  };

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;

    const runCleanup = async () => {
      const db = await getDb();
      let modified = false;

      for (const budget of budgets) {
        const pastPeriods = budget.pastPeriods ?? [];
        const current = budget.currentPeriod;

        // 🧹 Remove empty past periods and strip stale finalBalance
        const cleanedPastPeriods = pastPeriods
          .filter((p) => (p.amount ?? 0) !== 0 || (p.entries?.length ?? 0) > 0)
          .map((p) => {
            const amount = p.amount ?? 0;
            const entriesTotal =
              p.entries?.reduce((s, e) => s + e.amount, 0) ?? 0;
            const recalculatedFinal = amount - entriesTotal;

            return {
              ...p,
              finalBalance: recalculatedFinal, // Optional: or omit this field
            };
          });

        // 🧮 Total past finalBalance (always recalculated)
        const pastFinalBalance = cleanedPastPeriods.reduce((sum, period) => {
          return sum + (period.finalBalance ?? 0);
        }, 0);

        // 💳 Total of Debt Payments made in currentPeriod
        const debtPayments =
          current.entries?.reduce((sum, entry) => {
            return entry.description?.toLowerCase().includes('debt payment')
              ? sum + entry.amount
              : sum;
          }, 0) ?? 0;

        // 🧮 Adjust net balance: past + debt payments
        const adjustedBalance = pastFinalBalance + debtPayments;

        const updatedCarriedOver = {
          savings: adjustedBalance > 0 ? adjustedBalance : 0,
          debt: adjustedBalance < 0 ? Math.abs(adjustedBalance) : 0,
        };

        const carriedOverChanged =
          JSON.stringify(current.carriedOver ?? {}) !==
          JSON.stringify(updatedCarriedOver);

        const pastChanged =
          cleanedPastPeriods.length !== pastPeriods.length ||
          pastPeriods.some((p, i) => {
            const cleaned = cleanedPastPeriods[i];
            return p.finalBalance !== cleaned?.finalBalance;
          });

        if (carriedOverChanged || pastChanged) {
          const updatedBudget: Budget = {
            ...budget,
            pastPeriods: cleanedPastPeriods,
            currentPeriod: {
              ...current,
              carriedOver: updatedCarriedOver,
            },
          };

          await db.put('budgets', updatedBudget);
          modified = true;
        }
      }

      if (modified) refreshBudgets();
    };

    runCleanup().catch((err) => console.error('Budget cleanup failed:', err));
  }, [budgets, refreshBudgets]);

  return (
    <main className="max-w-5xl mx-auto space-y-6 mt-16">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
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
            entryExclude={entryExclude}
            setEntryExclude={setEntryExclude}
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
              {/* Description */}
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

              {/* Amount */}
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

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="datetime-local"
                  value={editingEntry.date}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              {/* Exclude from depletion */}
              <div className="flex items-center gap-2">
                <Switch
                  id="exclude-toggle"
                  checked={editingEntry.excludeFromDepletion ?? false}
                  onCheckedChange={(checked) =>
                    setEditingEntry({
                      ...editingEntry,
                      excludeFromDepletion: checked,
                    })
                  }
                />
                <label htmlFor="exclude-toggle" className="text-sm">
                  Recurring Bill
                </label>
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
