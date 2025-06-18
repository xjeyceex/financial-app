import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '../../../../lib/functions';

type BudgetHistoryDialogProps = {
  showBudgetHistory: boolean;
  setShowBudgetHistory: (value: boolean) => void;
  periodBudgets: Record<string, number>;
  formatPeriodLabel: (key: string) => string;
};

export default function BudgetHistoryDialog({
  showBudgetHistory,
  setShowBudgetHistory,
  periodBudgets,
  formatPeriodLabel,
}: BudgetHistoryDialogProps) {
  const historyEntries = Object.entries(periodBudgets)
    .filter(([, budget]) => budget > 0)
    .sort(([a], [b]) => b.localeCompare(a));

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
                <span className="font-medium">{formatPeriodLabel(period)}</span>
                <span>{formatCurrency(budget)}</span>
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
