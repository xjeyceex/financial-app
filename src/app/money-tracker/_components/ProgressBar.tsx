'use client';

import { History, Pencil } from 'lucide-react';
import BudgetEditor from './BudgetEditor';
import { formatCurrency } from '../../../../lib/functions';

type Props = {
  totalSpent: number;
  budget: number;
  percentageUsed: number;
  remaining: number;
  isEditingBudget: boolean;
  setIsEditingBudget: (value: boolean) => void;
  setShowBudgetHistory: (value: boolean) => void;
  tempBudget: string;
  setTempBudget: (value: string) => void;
  handleBudgetSave: () => void;
  handleBudgetCancel: () => void;
};

export default function ProgressBar({
  totalSpent,
  budget,
  percentageUsed,
  remaining,
  isEditingBudget,
  setIsEditingBudget,
  setShowBudgetHistory,
  tempBudget,
  setTempBudget,
  handleBudgetSave,
  handleBudgetCancel,
}: Props) {
  if (budget <= 0) {
    return (
      <div className="space-y-1 text-center">
        <div className="text-sm text-muted-foreground italic">
          Budget not set
        </div>
      </div>
    );
  }

  const isOverBudget = remaining < 0;
  const isCritical = percentageUsed > 90;
  const isWarning = percentageUsed > 75 && !isCritical;

  const progressColor = isOverBudget
    ? 'bg-red-500'
    : isCritical
      ? 'bg-red-500'
      : isWarning
        ? 'bg-yellow-500'
        : 'bg-blue-500';

  const remainingClass = isOverBudget
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  const remainingLabel = isOverBudget ? 'Over Budget' : 'Remaining';

  return (
    <div className="space-y-2 w-full flex flex-col items-center text-center">
      {/* Budget Summary and Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
        {!isEditingBudget ? (
          <>
            <span className="text-muted-foreground text-sm">
              {formatCurrency(totalSpent)} /{' '}
            </span>
            <span className="text-2xl font-bold">{formatCurrency(budget)}</span>
            <button
              onClick={() => setIsEditingBudget(true)}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Edit budget"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowBudgetHistory(true)}
              className="p-1 text-muted-foreground hover:text-foreground"
              title="Budget history"
            >
              <History className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              ({Math.round(percentageUsed)}%)
            </span>
          </>
        ) : (
          <BudgetEditor
            tempBudget={tempBudget}
            setTempBudget={setTempBudget}
            handleBudgetSave={handleBudgetSave}
            handleBudgetCancel={handleBudgetCancel}
          />
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500`}
          style={{
            width: `${Math.min(percentageUsed, 100)}%`,
          }}
        />
      </div>

      {/* Remaining / Over Budget */}
      <div className="text-xs">
        <div className={`${remainingClass}`}>
          {remainingLabel}: {formatCurrency(Math.abs(remaining))}
          {isWarning && !isOverBudget && (
            <span className="ml-1 text-yellow-600 dark:text-yellow-400">
              (Approaching limit)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
