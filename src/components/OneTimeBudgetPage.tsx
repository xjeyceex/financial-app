'use client';

import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllOneTimeBudgets,
  saveOneTimeBudget,
  getOneTimeEntriesByBudget,
  saveOneTimeEntry,
  deleteOneTimeEntry,
  deleteOneTimeBudget,
} from '@/lib/indexedDB';
import { OneTimeBudget, OneTimeEntry } from '@/lib/typesv2';
import { estimateDepletionDate } from '@/lib/utils/depletion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaWallet,
} from 'react-icons/fa';
import StatsCard from './StatsCard';
import { FiEyeOff, FiFileText, FiMoreHorizontal } from 'react-icons/fi';
import { Calculator, PlusIcon } from 'lucide-react';
import { CalculatorModal } from './Calculator';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  calculateAmount,
  formatCurrency,
  formatDateForDatetimeLocal,
  isValidMathExpression,
} from '@/lib/functionsv2';

export function OneTimeBudgetPage() {
  const [budgets, setBudgets] = useState<OneTimeBudget[]>([]);
  const [selected, setSelected] = useState<OneTimeBudget | null>(null);
  const [entries, setEntries] = useState<OneTimeEntry[]>([]);

  // Modal states
  const [openNewEntry, setOpenNewEntry] = useState(false);
  const [openEditEntry, setOpenEditEntry] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [openEditBudget, setOpenEditBudget] = useState(false);
  const [openCreateBudget, setOpenCreateBudget] = useState(false);
  const [openDeleteBudget, setOpenDeleteBudget] = useState(false);

  // Form fields
  const [newEntryDesc, setNewEntryDesc] = useState('');
  const [newEntryAmt, setNewEntryAmt] = useState<string>(''); // instead of number
  const [editEntryDesc, setEditEntryDesc] = useState('');
  const [editEntryAmt, setEditEntryAmt] = useState<string>(''); // was number
  const [editedBudgetAmt, setEditedBudgetAmt] = useState<number>(0);
  const [editedBudgetName, setEditedBudgetName] = useState('');
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(0);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmount, setEditedAmount] = useState(0);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10); // You can adjust this number
  const [editEntryDate, setEditEntryDate] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [selectedEntry, setSelectedEntry] = useState<OneTimeEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isEditingAmount && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [isEditingAmount]);

  const handleAmountSave = async () => {
    if (selected && editedAmount > 0) {
      const updated = { ...selected, amount: editedAmount };
      await saveOneTimeBudget(updated);
      await loadBudgets();
      setSelected(updated);
    }
    setIsEditingAmount(false);
  };

  // Initialize editedAmount when selected changes
  useEffect(() => {
    if (selected) {
      setEditedAmount(selected.amount);
    }
  }, [selected]);

  const createBudget = async () => {
    if (!newBudgetName || newBudgetAmount <= 0) return;

    const newBudget: OneTimeBudget = {
      id: uuidv4(),
      name: newBudgetName.trim(),
      amount: newBudgetAmount,
      createdAt: new Date().toISOString(),
    };

    await saveOneTimeBudget(newBudget);
    setNewBudgetName('');
    setNewBudgetAmount(0);
    setOpenCreateBudget(false);
    await loadBudgets();
    setSelected(newBudget);
  };

  const loadBudgets = async () => {
    const all = await getAllOneTimeBudgets();
    setBudgets(all);
    if (!selected && all.length > 0) setSelected(all[0]);
  };

  const loadEntries = async (budgetId: string) => {
    const list = await getOneTimeEntriesByBudget(budgetId);
    setEntries(list);
  };

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      loadEntries(selected.id);
      setEditedBudgetName(selected.name);
      setEditedBudgetAmt(selected.amount);
    } else setEntries([]);
  }, [selected]);

  const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);
  const budgetAmt = selected?.amount ?? 0;
  const remaining = budgetAmt - totalSpent;
  const pct = budgetAmt
    ? Math.min(100, (totalSpent / budgetAmt) * 100).toFixed(0)
    : '0';

  const depletion = selected
    ? (estimateDepletionDate(entries, budgetAmt) ?? 'No spending')
    : 'No budget selected';

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(entries.length / entriesPerPage);

  // Handlers
  const handleBudgetSave = async () => {
    if (selected && editedBudgetAmt > 0 && editedBudgetName) {
      const updated = {
        ...selected,
        name: editedBudgetName,
        amount: editedBudgetAmt,
      };
      await saveOneTimeBudget(updated);
      await loadBudgets();
      setSelected(updated);
      setOpenEditBudget(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!selected) return;
    await deleteOneTimeBudget(selected.id);
    setOpenDeleteBudget(false);
    await loadBudgets();
    setSelected(budgets.length > 1 ? budgets[0] : null);
  };

  const handleAddEntry = async () => {
    if (!selected || !newEntryAmt.trim()) return;

    let parsedAmount = 0;
    try {
      parsedAmount = eval(newEntryAmt); // Consider using a safer math parser
    } catch (e) {
      console.error('Invalid expression:', e);
      return;
    }

    if (parsedAmount <= 0 || isNaN(parsedAmount)) return;

    const entry: OneTimeEntry = {
      id: uuidv4(),
      budgetId: selected.id,
      amount: parsedAmount,
      description: newEntryDesc,
      date: new Date().toISOString(),
    };

    await saveOneTimeEntry(entry);
    setNewEntryDesc('');
    setNewEntryAmt('');
    setOpenNewEntry(false);
    loadEntries(selected.id);
  };

  const handleStartEditEntry = (e: OneTimeEntry) => {
    setEditEntryId(e.id);
    setEditEntryDesc(e.description ?? '');
    setEditEntryAmt(e.amount.toString());
    setEditEntryDate(formatDateForDatetimeLocal(e.date)); // ✅ format it here
    setOpenEditEntry(true);
  };

  const handleSaveEditEntry = async () => {
    if (!editEntryId || editEntryAmt.trim() === '') return;

    const parsedAmount = calculateAmount(editEntryAmt);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const original = entries.find((e) => e.id === editEntryId);
    if (!original) return;

    await saveOneTimeEntry({
      ...original,
      description: editEntryDesc,
      amount: parsedAmount,
    });

    setOpenEditEntry(false);
    loadEntries(selected!.id);
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteOneTimeEntry(id);
    loadEntries(selected!.id);
  };

  useEffect(() => {
    if (selected) {
      loadEntries(selected.id);
      setEditedBudgetName(selected.name);
      setEditedBudgetAmt(selected.amount);
      setCurrentPage(1); // Reset to first page when budget changes
    } else setEntries([]);
  }, [selected]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 ">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        {budgets.length > 0 ? (
          <>
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              One-Time Budget
            </h1>
            <div className="flex gap-2 items-center">
              <Select
                value={selected?.id}
                onValueChange={(id) => {
                  const b = budgets.find((b) => b.id === id);
                  setSelected(b || null);
                }}
              >
                <SelectTrigger className="w-[200px]">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FiMoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenCreateBudget(true)}>
                    <FaPlus className="mr-2 h-4 w-4" /> Create Budget
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOpenEditBudget(true)}
                    disabled={!selected}
                  >
                    <FaEdit className="mr-2 h-4 w-4" /> Edit Budget
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setOpenDeleteBudget(true)}
                    disabled={!selected}
                    className="text-red-500"
                  >
                    <FaTrash className="mr-2 h-4 w-4" /> Delete Budget
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="w-full py-10 px-4 text-center space-y-4 bg-muted/10 rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Start your one-time budget
            </h2>
            <p className="text-sm text-muted-foreground">
              Set a fixed amount and track how fast you spend it.
            </p>
            <Button size="lg" onClick={() => setOpenCreateBudget(true)}>
              <FaPlus className="mr-2" /> Create Budget
            </Button>
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column: Budget Summary + Stats */}
            <div className="flex-1 space-y-4">
              {/* Budget Summary Card */}
              <Card className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  {/* Spent / Editable Budget / % */}
                  <div className="flex items-center gap-2 text-lg font-medium text-white">
                    <span className="text-sm text-muted-foreground">
                      ₱{totalSpent.toLocaleString()}
                    </span>
                    {isEditingAmount ? (
                      <Input
                        ref={amountInputRef}
                        type="number"
                        value={editedAmount}
                        onChange={(e) =>
                          setEditedAmount(Number(e.target.value))
                        }
                        onBlur={handleAmountSave}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleAmountSave()
                        }
                        className="w-24 h-8 text-lg"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setIsEditingAmount(true)}
                        className="cursor-pointer flex items-center"
                      >
                        / ₱{budgetAmt.toLocaleString()}
                        <FaEdit
                          className="text-muted-foreground ml-1 -mt-[2px]"
                          size={14}
                        />
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      ({pct}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`${remaining >= 0 ? 'bg-green-500' : 'bg-red-500'} h-full transition-all duration-500`}
                      style={{ width: `${Math.min(Number(pct), 100)}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Stats Cards */}
              <div className="flex gap-3 w-full">
                <div className="flex-1">
                  <StatsCard
                    icon={<FaWallet size={14} />}
                    label="Remaining"
                    value={`₱${remaining.toLocaleString()}`}
                    isPositive={remaining >= 0}
                  />
                </div>
                <div className="flex-1">
                  <StatsCard
                    icon={<FaCalendarAlt size={14} />}
                    label="Depletion"
                    value={depletion === 'N/A' ? 'No spending' : depletion}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Entries */}
            <div className="w-full lg:w-1/3">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">Entries</CardTitle>
                    <Badge variant="secondary">
                      {entries.length} {entries.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <FiFileText className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No entries yet. Tap the + button to add your first
                        expense.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2">
                      {[...currentEntries]
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((e, index) => (
                          <div
                            key={e.id}
                            onClick={() => {
                              setSelectedEntry(e); // ✅ Set selected entry
                              setIsDetailModalOpen(true); // ✅ Open details modal
                            }}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer active:bg-accent/30"
                          >
                            {/* Left section: description and date */}
                            <div className="flex-1 min-w-0 mr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground w-5 text-right">
                                  {index + 1}.
                                </span>
                                <p className="font-medium text-sm truncate">
                                  {e.description || 'Unspecified'}
                                </p>
                              </div>

                              <div className="text-xs text-muted-foreground mt-1 ml-7 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>
                                    {new Date(e.date).toLocaleDateString(
                                      undefined,
                                      {
                                        month: 'short',
                                        day: 'numeric',
                                      }
                                    )}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {new Date(e.date).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right section: amount and actions */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium text-sm ${
                                  e.amount < 0
                                    ? 'text-emerald-600'
                                    : 'text-destructive'
                                }`}
                              >
                                {e.amount < 0
                                  ? `+${formatCurrency(Math.abs(e.amount))}`
                                  : `-${formatCurrency(e.amount)}`}
                              </span>

                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleStartEditEntry(e);
                                  }}
                                  className="text-muted-foreground hover:text-blue-600 h-7 w-7"
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleDeleteEntry(e.id);
                                  }}
                                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                                >
                                  <FaTrash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1)
                                      setCurrentPage(currentPage - 1);
                                  }}
                                  className={
                                    currentPage === 1
                                      ? 'pointer-events-none opacity-50'
                                      : ''
                                  }
                                />
                              </PaginationItem>

                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page);
                                    }}
                                    isActive={page === currentPage}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}

                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage < totalPages)
                                      setCurrentPage(currentPage + 1);
                                  }}
                                  className={
                                    currentPage === totalPages
                                      ? 'pointer-events-none opacity-50'
                                      : ''
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-10 flex flex-row items-center gap-3">
            {/* Calculator Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="bg-white text-zinc-700 rounded-full h-14 w-14 shadow-lg flex items-center justify-center hover:opacity-90 transition"
                >
                  <Calculator className="text-[32px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Calculator</TooltipContent>
            </Tooltip>

            {/* Add Entry Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setOpenNewEntry(true)}
                  className="bg-white text-zinc-700 rounded-full h-14 w-14 shadow-lg flex items-center justify-center hover:opacity-90 transition"
                >
                  <PlusIcon className="text-[32px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Add New Entry</TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
      {/* Add Entry Modal */}
      <Dialog open={openNewEntry} onOpenChange={setOpenNewEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <Label>Description (optional)</Label>
            <Input
              placeholder="Add a short description"
              value={newEntryDesc}
              onChange={(e) => setNewEntryDesc(e.target.value)}
            />

            {/* Amount */}
            <Label>Amount</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9+\-/*xX]*"
                placeholder="Amount (e.g., 100+50-20)"
                value={newEntryAmt}
                onChange={(e) => {
                  let input = e.target.value;
                  input = input.replace(/[^0-9+\-/*xX]/g, '');
                  input = input.replace(/x/gi, '*');
                  input = input.replace(/([+\-*/]){2,}/g, '$1');
                  input = input.replace(/^([+*/]+)/, '');
                  setNewEntryAmt(input);
                }}
                className="flex-1"
              />
              {newEntryAmt.trim() !== '' &&
                (isValidMathExpression(newEntryAmt) ? (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    = {formatCurrency(calculateAmount(newEntryAmt))}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Invalid</Badge>
                ))}
            </div>

            {/* Date */}
            <Label>Date</Label>
            <Input
              type="datetime-local"
              value={newEntryDate}
              onChange={(e) => setNewEntryDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleAddEntry}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Modal */}
      <Dialog open={openEditEntry} onOpenChange={setOpenEditEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                placeholder="Add a short description"
                value={editEntryDesc}
                onChange={(e) => setEditEntryDesc(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <Label htmlFor="edit-amount">Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-amount"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9+\-/*xX]*"
                  placeholder="e.g. 100+50-20"
                  value={editEntryAmt}
                  onChange={(e) => {
                    let input = e.target.value;
                    input = input.replace(/[^0-9+\-/*xX]/g, '');
                    input = input.replace(/x/gi, '*');
                    input = input.replace(/([+\-*/]){2,}/g, '$1');
                    input = input.replace(/^([+*/]+)/, '');
                    setEditEntryAmt(input);
                  }}
                  className="flex-1"
                />
                {editEntryAmt.trim() !== '' &&
                  (isValidMathExpression(editEntryAmt) ? (
                    <Badge variant="secondary" className="whitespace-nowrap">
                      = {formatCurrency(calculateAmount(editEntryAmt))}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Invalid</Badge>
                  ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editEntryDate}
                onChange={(e) => setEditEntryDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveEditEntry}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Modal */}
      <Dialog open={openEditBudget} onOpenChange={setOpenEditBudget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Budget name"
              value={editedBudgetName}
              onChange={(e) => setEditedBudgetName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={editedBudgetAmt || ''}
              onChange={(e) => setEditedBudgetAmt(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleBudgetSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Budget Modal */}
      <Dialog open={openCreateBudget} onOpenChange={setOpenCreateBudget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Budget name"
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newBudgetAmount || ''}
              onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button onClick={createBudget}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Budget Confirmation Modal */}
      <Dialog open={openDeleteBudget} onOpenChange={setOpenDeleteBudget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selected?.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteBudget(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CalculatorModal
        open={isCalculatorOpen}
        onOpenChange={setIsCalculatorOpen}
      />
      {selectedEntry && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-md rounded-lg">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold">
                Entry Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Description */}
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </span>
                <p className="text-base font-medium">
                  {selectedEntry.description || '(No Description)'}
                </p>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </span>
                <p
                  className={`text-lg font-bold ${
                    selectedEntry.amount > 0
                      ? 'text-red-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {selectedEntry.amount > 0
                    ? `-${formatCurrency(selectedEntry.amount)}`
                    : formatCurrency(Math.abs(selectedEntry.amount))}
                </p>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date & Time
                </span>
                <p className="text-base">
                  {new Date(selectedEntry.date).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Recurring Bill Indicator */}
              {selectedEntry.excludeFromDepletion && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <FiEyeOff className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-300">
                    Recurring Bill (excluded from depletion)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleStartEditEntry(selectedEntry);
                }}
              >
                Edit Entry
              </Button>
              <Button
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleDeleteEntry(selectedEntry.id);
                }}
              >
                Delete Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
