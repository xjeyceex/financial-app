'use client';

import { Pencil, History } from 'lucide-react';
import BudgetEditor from './BudgetEditor';
import ProgressBar from './ProgressBar';
import { Entry } from '../../../../lib/types';
import { formatCurrency } from '../../../../lib/functions';

type BudgetSectionProps = {
  isEditingBudget: boolean;
  budget: number;
  percentageUsed: number;
  entries: Entry[];
  tempBudget: string;
  setTempBudget: (value: string) => void;
  handleBudgetSave: () => void;
  handleBudgetCancel: () => void;
  setIsEditingBudget: (value: boolean) => void;
  setShowBudgetHistory: (value: boolean) => void;
};

export default function BudgetSection({
  isEditingBudget,
  budget,
  percentageUsed,
  entries,
  tempBudget,
  setTempBudget,
  handleBudgetSave,
  handleBudgetCancel,
  setIsEditingBudget,
  setShowBudgetHistory,
}: BudgetSectionProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {isEditingBudget ? (
        <BudgetEditor
          tempBudget={tempBudget}
          setTempBudget={setTempBudget}
          handleBudgetSave={handleBudgetSave}
          handleBudgetCancel={handleBudgetCancel}
        />
      ) : (
        <div className="flex items-center gap-2 min-w-fit md:flex-shrink-0">
          <button
            onClick={() => setIsEditingBudget(true)}
            className="flex items-center text-left rounded-lg p-1 transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{formatCurrency(budget)}</p>
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
          <button
            onClick={() => setShowBudgetHistory(true)}
            className="p-1 text-muted-foreground hover:text-foreground"
            title="Budget history"
          >
            <History className="w-4 h-4" />
          </button>
          <p
            className={`text-xs mt-[1px] ${
              percentageUsed > 90
                ? 'text-red-500 font-semibold'
                : percentageUsed > 75
                  ? 'text-yellow-500 font-medium'
                  : 'text-muted-foreground'
            }`}
          >
            {entries.length > 0
              ? `${Math.round(percentageUsed)}% utilized`
              : 'No expenses yet'}
          </p>
        </div>
      )}
      <div className="flex-1 w-full">
        {budget > 0 ? (
          <ProgressBar
            totalSpent={(budget * percentageUsed) / 100}
            budget={budget}
            percentageUsed={percentageUsed}
            remaining={budget - (budget * percentageUsed) / 100}
          />
        ) : (
          <div className="text-xs text-muted-foreground italic">
            Budget not set
          </div>
        )}
      </div>
    </div>
  );
}
