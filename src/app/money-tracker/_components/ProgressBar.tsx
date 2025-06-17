export default function ProgressBar({
  totalSpent,
  budget,
  percentageUsed,
  remaining,
}: {
  totalSpent: number;
  budget: number;
  percentageUsed: number;
  remaining: number;
}) {
  // Handle zero budget case
  if (budget <= 0) {
    return (
      <div className="space-y-1 text-right">
        <div className="text-sm text-muted-foreground italic">
          Budget not set
        </div>
      </div>
    );
  }

  // Determine colors and labels based on usage
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
    <div className="space-y-1 text-right">
      <div className="text-sm font-medium">
        ₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} / ₱
        {budget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          ({Math.round(percentageUsed)}%)
        </span>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500`}
          style={{
            width: `${Math.min(100, percentageUsed)}%`,
          }}
        />
      </div>

      <div className="text-xs">
        <div className={`${remainingClass}`}>
          {remainingLabel}: ₱
          {Math.abs(remaining).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
          })}
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
