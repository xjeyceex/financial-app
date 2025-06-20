'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiEdit, FiTrash, FiPlus } from 'react-icons/fi';
import { Budget } from '../../../../lib/typesv2';
import { formatCurrency } from '../../../../lib/functions';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BudgetPeriod } from './BudgetPeriod';

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
  const percentageUsed = Math.min(
    100,
    Math.max(0, (totalExpenses / currentBaseAmount) * 100)
  );

  let progressColor = '';
  if (percentageUsed < 75) {
    progressColor = 'bg-green-500';
  } else if (percentageUsed < 100) {
    progressColor = 'bg-yellow-500';
  } else {
    progressColor = 'bg-red-500';
  }

  const handleEntrySubmit = (e: React.FormEvent) => {
    onEntrySubmit(e);
    setIsEntryModalOpen(false);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 ">
          {/* Main Content Grid - Wraps on mobile */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Left Column - Budget Summary & Debt */}
            <div className="flex-1 space-y-3 sm:space-y-4 bg-">
              {/* Budget Summary Section */}
              <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 mx-auto text-center">
                {/* Budget / Spent / Percent line */}
                <div className="text-sm font-medium text-muted-foreground flex justify-center items-center gap-2 flex-wrap mb-4">
                  {editingBudgetAmount ? (
                    <>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          onSaveAmount();
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="number"
                          value={
                            tempBudgetAmount === '' ? '' : tempBudgetAmount
                          }
                          onChange={onAmountChange}
                          autoFocus
                          className="text-lg font-semibold w-24 text-center px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="submit"
                          className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={onCancelAmountEdit}
                          className="text-sm px-2 py-1 border border-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </form>
                      <span>/</span>
                      <span>{formatCurrency(totalExpenses)}</span>
                      <span>-</span>
                      <span>({Math.round(percentageUsed)}%)</span>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={onAmountClick}
                        className="text-lg font-semibold cursor-pointer hover:underline"
                      >
                        {formatCurrency(currentBaseAmount)}
                      </span>
                      <span>/</span>
                      <span>{formatCurrency(totalExpenses)}</span>
                      <span>-</span>
                      <span>({Math.round(percentageUsed)}%)</span>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`${progressColor} h-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>

                {/* Current Balance */}
                <div className="text-base font-semibold">
                  Balance:{' '}
                  <span
                    className={
                      currentBalance < 0
                        ? 'text-destructive'
                        : currentBalance < currentBaseAmount * 0.2
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                    }
                  >
                    {formatCurrency(currentBalance)}
                  </span>
                </div>
              </div>

              {/* Savings & Debt Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg">
                    Savings & Debt
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Savings
                      </p>
                      <p className="text-lg sm:text-xl font-semibold text-green-600">
                        {formatCurrency(carriedOver.savings || 0)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Debt
                      </p>
                      <p className="text-lg sm:text-xl font-semibold text-destructive">
                        {formatCurrency(carriedOver.debt || 0)}
                      </p>
                    </div>
                  </div>

                  {netCarryover < 0 && currentBalance >= 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-xs sm:text-sm">
                          You can pay down debt with your current balance
                        </p>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const maxPay = Math.min(
                            Math.abs(netCarryover),
                            currentBalance
                          );
                          if (
                            debtPaymentAmount > 0 &&
                            debtPaymentAmount <= maxPay
                          ) {
                            payDebt({
                              type: 'debt',
                              amount: debtPaymentAmount,
                            });
                            setDebtPaymentAmount(0);
                          }
                        }}
                        className="flex flex-col sm:flex-row items-end gap-2 sm:gap-3"
                      >
                        <div className="w-full space-y-1">
                          <label className="text-xs sm:text-sm font-medium">
                            Payment Amount
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={Math.min(
                              Math.abs(netCarryover),
                              currentBalance
                            )}
                            value={debtPaymentAmount}
                            onChange={(e) =>
                              setDebtPaymentAmount(Number(e.target.value) || 0)
                            }
                            placeholder="Amount"
                            className="text-sm sm:text-base px-2 py-1.5 sm:px-3 sm:py-2"
                          />
                        </div>
                        <div className="flex w-full sm:w-auto gap-2">
                          <Button
                            type="submit"
                            variant="destructive"
                            className="flex-1 px-2 py-1 sm:px-4 sm:py-2"
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
                            className="flex-1 px-2 py-1 sm:px-4 sm:py-2"
                            onClick={() => {
                              const fullAmount = Math.min(
                                Math.abs(netCarryover),
                                currentBalance
                              );
                              payDebt({ type: 'debt', amount: fullAmount });
                              setDebtPaymentAmount(0);
                            }}
                          >
                            Pay Full
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Periods Button */}
              {budget?.pastPeriods && budget.pastPeriods.length > 0 && (
                <Button
                  onClick={() => setShowPastPeriods(true)}
                  className="w-full"
                >
                  View Past Periods
                </Button>
              )}
            </div>

            {/* Right Column - Entries List */}
            <div className="lg:w-96">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base sm:text-lg">
                      Entries
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {entries.length} {entries.length === 1 ? 'Item' : 'Items'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {entries.length === 0 ? (
                    <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground">
                      No entries yet. Tap the + button to add your first
                      expense.
                    </div>
                  ) : (
                    <div className=" max-h-[40vh]  overflow-y-auto">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {entry.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                              <span className="font-semibold">
                                {formatCurrency(entry.amount)}
                              </span>
                              <span className="text-muted-foreground truncate">
                                {new Date(entry.date).toLocaleDateString()} •{' '}
                                {new Date(entry.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEntryEdit(entry)}
                                  className="h-7 w-7 sm:h-8 sm:w-8"
                                >
                                  <FiEdit className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Entry</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEntryDelete(entry.id)}
                                  className="h-7 w-7 sm:h-8 sm:w-8"
                                >
                                  <FiTrash className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Entry</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <DialogContent className="sm:max-w-md">
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
