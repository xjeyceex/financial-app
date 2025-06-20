import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useMemo } from 'react';
import { formatCurrency } from '../../../lib/functions';

type BudgetHistoryDialogProps = {
  showBudgetHistory: boolean;
  setShowBudgetHistory: (value: boolean) => void;
  periodBudgets: Record<string, number>;
  updateBudget: (budget: number, periodKey: string) => void;
  currentPeriodKey: string;
  currentBudget: number;
  formatPeriodLabel: (key: string) => string;
};

export default function BudgetHistoryDialog({
  showBudgetHistory,
  setShowBudgetHistory,
  periodBudgets,
  updateBudget,
  currentPeriodKey,
  currentBudget,
  formatPeriodLabel,
}: BudgetHistoryDialogProps) {
  // Always sync current budget to history when dialog opens
  useEffect(() => {
    if (showBudgetHistory) {
      updateBudget(currentBudget, currentPeriodKey);
    }
  }, [showBudgetHistory, currentPeriodKey, currentBudget, updateBudget]);

  const historyEntries = useMemo(
    () =>
      Object.entries(periodBudgets)
        .filter(([, budget]) => budget > 0)
        .sort(([a], [b]) => b.localeCompare(a)),
    [periodBudgets]
  );

  return (
    <Dialog open={showBudgetHistory} onOpenChange={setShowBudgetHistory}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Budget History</DialogTitle>
          <DialogDescription>
            Historical budget entries by period
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {historyEntries.length > 0 ? (
            historyEntries.map(([period, budget]) => (
              <div
                key={period}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span className="font-medium truncate">
                  {formatPeriodLabel(period)}
                </span>
                <span className="text-right tabular-nums">
                  {formatCurrency(budget)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No historical budgets found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
