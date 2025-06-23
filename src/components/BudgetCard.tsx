'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FiEdit,
  FiTrash,
  FiX,
  FiCheck,
  FiClock,
  FiEyeOff,
  FiFileText,
} from 'react-icons/fi';
import { Budget, Entry } from '../lib/typesv2';
import { formatCurrency } from '../lib/functionsv2';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Calculator,
  PlusIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BudgetPeriod } from './BudgetPeriod';
import StatsCard from './StatsCard';
import { cn } from '../lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CalculatorModal } from '@/components/Calculator';

interface BudgetCardProps {
  budget: Budget;
  onAmountClick: () => void;
  onSaveAmount: () => void;
  onCancelAmountEdit: () => void;
  editingBudgetAmount: boolean;
  tempBudgetAmount: string;
  onEntrySubmit: (e: React.FormEvent) => void;
  entryDesc: string;
  setEntryDesc: (value: string) => void;
  entryAmount: string;
  setEntryAmount: (value: string) => void;
  entryDate: string;
  setEntryDate: (value: string) => void;
  isValidMathExpression: (input: string) => boolean;
  calculateAmount: (input: string) => number;
  onEditPastAmount: (periodId: string, newAmount: number) => void;
  payDebt: (params: { type: 'debt' | 'savings'; amount: number }) => void;
  onEntryEdit: (entry: {
    id: string;
    description?: string;
    amount: number;
    date: string;
  }) => void;
  onEntryDelete: (entryId: string) => void;
  onEditBudgetClick: () => void;
  entryExclude: boolean;
  setEntryExclude: (value: boolean) => void;
  isEntryModalOpen: boolean;
  setIsEntryModalOpen: (value: boolean) => void;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: (value: boolean) => void;
  showPastPeriods: boolean;
  setShowPastPeriods: (value: boolean) => void;
  entryType: 'income' | 'expense';
  setEntryType: (value: 'income' | 'expense') => void;
  setTempBudgetAmount: (value: string) => void;
}

export function BudgetCard({
  budget,
  onAmountClick,
  onSaveAmount,
  onCancelAmountEdit,
  editingBudgetAmount,
  tempBudgetAmount,
  onEntrySubmit,
  entryDesc,
  onEditPastAmount,
  isCalculatorOpen,
  setIsCalculatorOpen,
  showPastPeriods,
  setShowPastPeriods,
  isEntryModalOpen,
  setIsEntryModalOpen,
  setEntryDesc,
  payDebt,
  entryAmount,
  setEntryAmount,
  entryDate,
  setEntryDate,
  isValidMathExpression,
  calculateAmount,
  onEntryEdit,
  onEntryDelete,
  entryExclude,
  setEntryExclude,
  entryType,
  setEntryType,
  setTempBudgetAmount,
}: BudgetCardProps) {
  const [debtPaymentAmount, setDebtPaymentAmount] = useState(0);

  // Calculate carryover from past periods
  const { currentPeriod, pastPeriods = [] } = budget;
  const carriedOver = currentPeriod.carriedOver ?? { savings: 0, debt: 0 };
  const netCarryover = carriedOver.savings - carriedOver.debt;
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const currentBaseAmount = currentPeriod.amount || 0;
  const entries = currentPeriod.entries || [];
  const totalExpenses = entries.reduce((sum, e) => sum + e.amount, 0);

  const currentBalance = currentBaseAmount - totalExpenses;

  const percentageUsed =
    currentBaseAmount > 0
      ? Math.min(100, Math.max(0, (totalExpenses / currentBaseAmount) * 100))
      : 0;

  const getTopCurrentExpenses = (
    entries: {
      description?: string;
      amount: number;
      id?: string | number;
      excludeFromDepletion?: boolean;
    }[] = [],
    count: number = 5
  ) => {
    return entries
      .filter((e) => e.amount > 0 && !e.excludeFromDepletion)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, count);
  };

  const topExpenses = getTopCurrentExpenses(entries, 3);

  let progressColor = '';
  if (percentageUsed < 75) {
    progressColor = 'bg-green-500';
  } else if (percentageUsed < 100) {
    progressColor = 'bg-yellow-500';
  } else {
    progressColor = 'bg-red-500';
  }

  const maxPay = Math.min(Math.abs(netCarryover), currentBalance);

  const startDate = new Date(currentPeriod.startDate);
  const today = new Date();
  const daysPassed = Math.max(
    1,
    Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const spendingEntries = entries.filter(
    (e) => !e.excludeFromDepletion && !e.excludeFromDepletion
  );

  const totalSpendingForAvg = spendingEntries.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const avgDailySpending = totalSpendingForAvg / daysPassed;

  let depletionDate: string | null = null;
  if (avgDailySpending > 0 && currentBalance > 0) {
    const daysLeft = Math.floor(currentBalance / avgDailySpending);
    const projectedDate = new Date();
    projectedDate.setDate(today.getDate() + daysLeft);
    depletionDate = projectedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  }

  const handleEntrySubmit = (e: React.FormEvent) => {
    onEntrySubmit(e);
    setIsEntryModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row w-full gap-4">
        {/* Left Column - Budget Summary & Stats */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Budget Summary Section */}
          <Card className="shadow-sm p-0">
            <CardContent className="p-4 sm:p-6">
              {/* Spent / Budget / Percent */}
              <div className="text-sm font-medium text-muted-foreground flex justify-center items-center gap-2 flex-wrap mb-3">
                <span>{formatCurrency(totalExpenses)}</span>
                <span>/</span>
                {editingBudgetAmount ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveAmount();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9+\-/*xX]*"
                      placeholder="e.g. 100+500-25"
                      value={tempBudgetAmount}
                      onChange={(e) => {
                        let input = e.target.value;
                        input = input.replace(/[^0-9+\-/*xX]/g, '');
                        input = input.replace(/x/gi, '*');
                        input = input
                          .replace(/([+\-*/]){2,}/g, '$1')
                          .replace(/^([+*/]+)/, '');
                        setTempBudgetAmount(input);
                      }}
                      autoFocus
                      className="text-lg font-semibold text-center px-2 py-1 w-36"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      type="submit"
                      className="w-8 h-8 text-green-400 hover:text-green-600 transition"
                      title="Save"
                    >
                      <FiCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={onCancelAmountEdit}
                      className="w-8 h-8 text-gray-500 hover:text-red-400 transition"
                      title="Cancel"
                    >
                      <FiX className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <span
                    onClick={onAmountClick}
                    className="flex items-center gap-1 text-xl font-semibold text-primary cursor-pointer transition-colors hover:text-primary/80 hover:underline"
                  >
                    {formatCurrency(currentBaseAmount)}
                    <FiEdit className="w-3 h-3 text-muted-foreground" />
                  </span>
                )}

                <span>-</span>
                <span>({Math.round(percentageUsed)}%)</span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                <div
                  className={`${progressColor} h-full transition-all duration-500`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>

              {/* Current Balance */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Balance:</span>
                <span
                  className={cn(
                    'font-medium',
                    currentBalance < 0
                      ? 'text-destructive'
                      : currentBalance < currentBaseAmount * 0.2
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                  )}
                >
                  {formatCurrency(currentBalance)}
                </span>
              </div>
            </CardContent>
          </Card>
          {/* Financial Overview Section */}
          <div className="space-y-3">
            {/* Savings & Debt */}
            <div>
              <div className="flex flex-nowrap gap-4 w-full">
                <div className="basis-0 grow">
                  <StatsCard
                    icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                    label="Total Savings"
                    value={formatCurrency(carriedOver.savings || 0)}
                    isPositive={true}
                  />
                </div>
                <div className="basis-0 grow">
                  <StatsCard
                    icon={<TrendingDown className="w-4 h-4 text-destructive" />}
                    label="Total Debt"
                    value={formatCurrency(carriedOver.debt || 0)}
                    isPositive={false}
                  />
                </div>
              </div>
            </div>

            {/* Top Expenses */}
            {topExpenses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Recent Top Expenses
                </h4>
                <div className="flex flex-wrap gap-4">
                  {topExpenses
                    .filter((entry) => entry.description !== 'Debt Payment')
                    .map((entry, index) => (
                      <div
                        key={entry.id || index}
                        className="flex-1 min-w-[200px]"
                      >
                        <StatsCard
                          icon={''}
                          label={entry.description || 'Unnamed'}
                          value={formatCurrency(entry.amount)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {depletionDate && (
              <StatsCard
                icon={<FiClock className="w-4 h-4 text-yellow-600" />}
                label="Est. Depletion Date"
                value={depletionDate}
                isPositive={false}
              />
            )}
          </div>

          {/* Debt Payment Section */}
          {netCarryover < 0 && currentBalance >= 1 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {maxPay === Math.abs(netCarryover)
                      ? 'You can fully pay your debt using your current balance'
                      : `You can pay down your debt with ₱${maxPay.toLocaleString()} of your current balance`}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const maxPay = Math.min(
                      Math.abs(netCarryover),
                      currentBalance
                    );
                    if (debtPaymentAmount > 0 && debtPaymentAmount <= maxPay) {
                      payDebt({ type: 'debt', amount: debtPaymentAmount });
                      setDebtPaymentAmount(0);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Payment Amount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={Math.min(Math.abs(netCarryover), currentBalance)}
                      value={debtPaymentAmount}
                      onChange={(e) =>
                        setDebtPaymentAmount(Number(e.target.value) || 0)
                      }
                      placeholder="₱0.00"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      type="submit"
                      variant="destructive"
                      className="flex-1"
                      disabled={
                        debtPaymentAmount <= 0 ||
                        debtPaymentAmount >
                          Math.min(Math.abs(netCarryover), currentBalance)
                      }
                    >
                      Pay Debt
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={currentBalance <= 0}
                      onClick={() => {
                        const partialAmount = Math.min(
                          Math.abs(netCarryover),
                          currentBalance
                        );
                        payDebt({ type: 'debt', amount: partialAmount });
                        setDebtPaymentAmount(0);
                      }}
                    >
                      Pay Max
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* Past Periods Button */}
          {budget?.pastPeriods && budget.pastPeriods.length > 0 && (
            <Button
              onClick={() => setShowPastPeriods(true)}
              variant="outline"
              className="w-full"
            >
              View Past Periods
            </Button>
          )}
        </div>

        {/* Right Column - Entries List (1/3 width on larger screens) */}
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
                    No entries yet. Tap the + button to add your first expense.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2">
                  {[...entries]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((entry, index) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsDetailModalOpen(true);
                        }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer active:bg-accent/30"
                      >
                        {/* Left Content - Entry Info */}
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground w-5 text-right">
                              {index + 1}.
                            </span>
                            <p className="font-medium text-sm truncate">
                              {entry.description}
                            </p>
                          </div>

                          <div className="text-xs text-muted-foreground mt-1 ml-7 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>
                                {new Date(entry.date).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(entry.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {entry.excludeFromDepletion && (
                              <div className="flex items-center gap-1 text-orange-500">
                                <FiEyeOff className="w-3.5 h-3.5" />
                                <span className="text-xs">Recurring Bill</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Content - Amount & Actions */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              entry.amount < 0
                                ? 'text-emerald-600' // income
                                : 'text-destructive' // expense
                            }`}
                          >
                            {entry.amount < 0
                              ? `+${formatCurrency(Math.abs(entry.amount))}`
                              : `-${formatCurrency(entry.amount)}`}
                          </span>

                          <div className="flex space-x-1">
                            {entry.description !== 'Debt Payment' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEntryEdit(entry);
                                }}
                                className="text-muted-foreground hover:text-blue-600 h-7 w-7"
                              >
                                <FiEdit className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEntryDelete(entry.id);
                              }}
                              className="text-muted-foreground hover:text-destructive h-7 w-7"
                            >
                              <FiTrash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Floating Add Button */}
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
              onClick={() => setIsEntryModalOpen(true)}
              className="bg-white text-zinc-700 rounded-full h-14 w-14 shadow-lg flex items-center justify-center hover:opacity-90 transition"
            >
              <PlusIcon className="text-[32px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Add New Entry</TooltipContent>
        </Tooltip>
      </div>
      {/* Add Entry Modal */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="p-0 m-0">
            <DialogTitle className="p-0 m-0">Add New Entry</DialogTitle>
            <DialogDescription className="p-0 m-0"></DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEntrySubmit} className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9+\-/*xX]*"
                  placeholder="Amount (e.g., 85+15+30)"
                  value={entryAmount}
                  onChange={(e) => {
                    let input = e.target.value;
                    input = input.replace(/[^0-9+\-/*xX]/g, '');
                    input = input.replace(/x/gi, '*');
                    input = input
                      .replace(/([+\-*/]){2,}/g, '$1')
                      .replace(/^([+*/]+)/, '');
                    setEntryAmount(input);
                  }}
                  className="flex-1"
                  autoFocus
                />
                {entryAmount.trim() !== '' &&
                  (isValidMathExpression(entryAmount) ? (
                    <Badge variant="secondary" className="whitespace-nowrap">
                      = {formatCurrency(calculateAmount(entryAmount))}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Invalid</Badge>
                  ))}
              </div>
            </div>

            {/* Entry Type */}
            <div className="space-y-2">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="entryType"
                    value="expense"
                    checked={entryType === 'expense'}
                    onChange={() => setEntryType('expense')}
                    className="accent-red-500"
                  />
                  Expense
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="entryType"
                    value="income"
                    checked={entryType === 'income'}
                    onChange={() => setEntryType('income')}
                    className="accent-green-500"
                  />
                  Income
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                type="text"
                placeholder="Add a short description"
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="datetime-local"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>

            {/* Exclude from Depletion */}
            <div className="flex items-center gap-2">
              <Switch
                id="exclude-entry"
                checked={entryExclude}
                onCheckedChange={setEntryExclude}
              />
              <label htmlFor="exclude-entry" className="text-sm">
                Recurring Bill
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEntryModalOpen(false);
                  setEntryDesc('');
                  setEntryAmount('');
                  setEntryDate(new Date().toISOString().slice(0, 16));
                  setEntryExclude(false);
                  setEntryType('expense'); // reset to default
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Past Periods Modal */}
      <Dialog open={showPastPeriods} onOpenChange={setShowPastPeriods}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {budget.name} - Past Periods
            </DialogTitle>
          </DialogHeader>

          {pastPeriods.length === 0 ? (
            <p className="text-muted-foreground">No past periods.</p>
          ) : (
            <div className="space-y-6 mt-4">
              {pastPeriods
                .sort(
                  (a, b) =>
                    new Date(b.startDate).getTime() -
                    new Date(a.startDate).getTime()
                )
                .map((period) => (
                  <BudgetPeriod
                    key={period.id}
                    period={period}
                    onAmountChange={(newAmount) =>
                      onEditPastAmount(period.id, newAmount)
                    }
                    onEntryEdit={onEntryEdit}
                    onEntryDelete={onEntryDelete}
                  />
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CalculatorModal
        open={isCalculatorOpen}
        onOpenChange={setIsCalculatorOpen}
      />{' '}
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
                  {selectedEntry.description}
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
                      ? 'text-red-400'
                      : 'text-emerald-400'
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

              {/* Recurring Indicator */}
              {selectedEntry.excludeFromDepletion && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <FiEyeOff className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-300">
                    Recurring Bill (excluded from depletion)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons - Stacked on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  onEntryEdit(selectedEntry);
                }}
              >
                Edit Entry
              </Button>
              <Button
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  onEntryDelete(selectedEntry.id);
                }}
              >
                Delete Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
