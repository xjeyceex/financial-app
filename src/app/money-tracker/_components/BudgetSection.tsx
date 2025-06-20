'use client';

import ProgressBar from './ProgressBar';
import { Entry } from '../../../lib/types';

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
  tempBudget,
  setTempBudget,
  handleBudgetSave,
  handleBudgetCancel,
  setIsEditingBudget,
  setShowBudgetHistory,
}: BudgetSectionProps) {
  const totalSpent = (budget * percentageUsed) / 100;
  const remaining = budget - totalSpent;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 w-full">
        {budget > 0 ? (
          <ProgressBar
            totalSpent={totalSpent}
            budget={budget}
            percentageUsed={percentageUsed}
            remaining={remaining}
            isEditingBudget={isEditingBudget}
            setIsEditingBudget={setIsEditingBudget}
            setShowBudgetHistory={setShowBudgetHistory}
            tempBudget={tempBudget}
            setTempBudget={setTempBudget}
            handleBudgetSave={handleBudgetSave}
            handleBudgetCancel={handleBudgetCancel}
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
