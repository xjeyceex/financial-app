'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FiEdit,
  FiTrash,
  FiPlus,
  FiX,
  FiCheck,
  FiTrendingDown,
} from 'react-icons/fi';
import { Budget } from '../../../lib/typesv2';
import { formatCurrency } from '../../../lib/functions';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BudgetPeriod } from './BudgetPeriod';
import StatsCard from './StatsCard';
import { cn } from '../../../lib/utils';
import { Label } from '@/components/ui/label';

interface BudgetCardProps {
  budget: Budget;
  onAmountClick: () => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}

export function BudgetCard({
  budget,
  onAmountClick,
  onAmountChange,
  onSaveAmount,
  onCancelAmountEdit,
  editingBudgetAmount,
  tempBudgetAmount,
  onEntrySubmit,
  entryDesc,
  onEditPastAmount,
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
}: BudgetCardProps) {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState(0);
  const [showPastPeriods, setShowPastPeriods] = useState(false);

  // Calculate carryover from past periods
  const { currentPeriod, pastPeriods = [] } = budget;
  const carriedOver = currentPeriod.carriedOver ?? { savings: 0, debt: 0 };
  const netCarryover = carriedOver.savings - carriedOver.debt;

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
    }[] = [],
    count: number = 5
  ) => {
    return entries
      .filter((e) => e.amount > 0) // assuming expenses are positive
      .sort((a, b) => b.amount - a.amount)
      .slice(0, count);
  };

  const topExpenses = getTopCurrentExpenses(budget.currentPeriod.entries, 3);

  let progressColor = '';
  if (percentageUsed < 75) {
    progressColor = 'bg-green-500';
  } else if (percentageUsed < 100) {
    progressColor = 'bg-yellow-500';
  } else {
    progressColor = 'bg-red-500';
  }

  const maxPay = Math.min(Math.abs(netCarryover), currentBalance);

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
                    <input
                      type="number"
                      value={tempBudgetAmount === '' ? '' : tempBudgetAmount}
                      onChange={onAmountChange}
                      autoFocus
                      className="text-lg font-semibold w-24 text-center px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      type="submit"
                      className="w-8 h-8 text-green-600 hover:text-green-800 transition"
                      title="Save"
                    >
                      <FiCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={onCancelAmountEdit}
                      className="w-8 h-8 text-gray-500 hover:text-red-600 transition"
                      title="Cancel"
                    >
                      <FiX className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <span
                    onClick={onAmountClick}
                    className="text-xl font-semibold text-primary cursor-pointer transition-colors hover:text-primary/80 hover:underline"
                  >
                    {formatCurrency(currentBaseAmount)}
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
                  {topExpenses.map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className="flex-1 min-w-[200px]"
                    >
                      <StatsCard
                        icon={<FiTrendingDown className="w-4 h-4" />}
                        label={entry.description || 'Unnamed'}
                        value={formatCurrency(entry.amount)}
                        isPositive={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
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
            <CardContent className="px-4">
              {entries.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No entries yet. Tap the + button to add your first expense.
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <p className="font-medium text-sm truncate">
                            {entry.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
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
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm text-destructive">
                          {formatCurrency(entry.amount)}
                        </span>
                        <div className="flex opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEntryEdit(entry)}
                            className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                          >
                            <FiEdit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEntryDelete(entry.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
      <div className="fixed bottom-6 right-6 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={() => setIsEntryModalOpen(true)}
            >
              <FiPlus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Add New Entry</TooltipContent>
        </Tooltip>
      </div>

      {/* Add Entry Modal */}
      <Dialog open={isEntryModalOpen} onOpenChange={setIsEntryModalOpen}>
        <DialogContent className="sm:max-w-md translate-y-[-65%]">
          <DialogHeader>
            <DialogTitle>Add New Entry</DialogTitle>
            <DialogDescription>
              Add an expense to your current budget period
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                type="text"
                placeholder="What was this expense for?"
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Amount (e.g., 85+15+30)"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="flex-1"
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="datetime-local"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEntryModalOpen(false)}
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
    </>
  );
}
