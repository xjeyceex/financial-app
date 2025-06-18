import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BiweeklyRange } from '../../../../lib/types';
import { formatCurrency } from '../../../../lib/functions';

type BudgetHistoryDialogProps = {
  showBudgetHistory: boolean;
  setShowBudgetHistory: (value: boolean) => void;
  periodBudgets: Record<string, number>;
  formatBiweeklyLabel: (key: string) => string;
  biweeklyRange: BiweeklyRange;
};

export default function BudgetHistoryDialog({
  showBudgetHistory,
  setShowBudgetHistory,
  periodBudgets,
  formatBiweeklyLabel,
  biweeklyRange,
}: BudgetHistoryDialogProps) {
  const historyEntries = Object.entries(periodBudgets)
    .filter(([period]) => {
      const day = parseInt(period.split('-')[2]);
      return day === biweeklyRange.startDay1 || day === biweeklyRange.startDay2;
    })
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <Dialog open={showBudgetHistory} onOpenChange={setShowBudgetHistory}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Budget History</DialogTitle>
          <DialogDescription>
            History for {biweeklyRange.label} periods
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {historyEntries.length > 0 ? (
            historyEntries.map(([period, budget]) => (
              <div
                key={period}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span className="font-medium">
                  {formatBiweeklyLabel(period)}
                </span>
                <span>{formatCurrency(budget)}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No historical budgets found for this period range
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
