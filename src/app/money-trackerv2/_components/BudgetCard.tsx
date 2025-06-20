'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiEdit, FiTrash, FiPlus } from 'react-icons/fi';
import { formatPayPeriodDisplay } from '../../../../lib/functionsv2';
import { Budget } from '../../../../lib/typesv2';
import { formatCurrency } from '../../../../lib/functions';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
  onEditBudgetClick,
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

  const handleEntrySubmit = (e: React.FormEvent) => {
    onEntrySubmit(e);
    setIsEntryModalOpen(false);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                {budget.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pay Period:{' '}
                {formatPayPeriodDisplay(
                  currentPeriod.startDate,
                  currentPeriod.endDate
                )}
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEditBudgetClick}
                  className="h-8 w-8"
                >
                  <FiEdit className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Budget</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 px-3 py-4 sm:px-6 sm:py-6">
          {/* Main Content Grid - Wraps on mobile */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Left Column - Budget Summary & Debt */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              {/* Budget Summary Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">
                      Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    {editingBudgetAmount ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          onSaveAmount();
                        }}
                        className="flex flex-col sm:flex-row items-end gap-2 sm:gap-3"
                      >
                        <div className="w-full space-y-1">
                          <label className="text-xs sm:text-sm font-medium">
                            Amount
                          </label>
                          <Input
                            type="number"
                            value={
                              tempBudgetAmount === '' ? '' : tempBudgetAmount
                            }
                            onChange={onAmountChange}
                            autoFocus
                            className="text-sm sm:text-base px-2 py-1.5 sm:px-3 sm:py-2"
                          />
                        </div>
                        <div className="flex w-full sm:w-auto gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            className="flex-1 px-2 py-1 sm:px-4 sm:py-2"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={onCancelAmountEdit}
                            className="flex-1 px-2 py-1 sm:px-4 sm:py-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div
                        onClick={onAmountClick}
                        className="cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                      >
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Budget Amount
                        </p>
                        <p className="text-lg sm:text-xl font-semibold">
                          {formatCurrency(currentBaseAmount)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">
                      Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Current Balance
                      </p>
                      <p
                        className={`text-lg sm:text-xl font-semibold ${
                          currentBalance < 0
                            ? 'text-destructive'
                            : currentBalance < currentBaseAmount * 0.2
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {entries.length}{' '}
                        {entries.length === 1 ? 'Entry' : 'Entries'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(totalExpenses)} Spent
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
                <CardContent className="p-3 sm:p-6">
                  {entries.length === 0 ? (
                    <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground">
                      No entries yet. Tap the + button to add your first
                      expense.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] sm:max-h-[calc(100vh-400px)] overflow-y-auto">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {entry.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="font-semibold">
                                {formatCurrency(entry.amount)}
                              </span>
                              <span className="text-muted-foreground truncate">
                                {new Date(entry.date).toLocaleDateString()}
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
    </>
  );
}
