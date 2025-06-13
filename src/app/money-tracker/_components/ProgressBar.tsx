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
  const remainingClass =
    remaining < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  const remainingLabel = remaining < 0 ? 'Over Budget' : 'Remaining';

  return (
    <div className="space-y-1 text-right">
      <div className="text-sm font-medium">
        ₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} / ₱
        {budget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            percentageUsed > 100 ? 'bg-red-500' : 'bg-blue-500'
          } transition-all duration-500`}
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
        </div>
        {percentageUsed > 100 && (
          <div className="text-red-500">
            Exceeded by ₱
            {Math.abs(remaining).toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}
          </div>
        )}
      </div>
    </div>
  );
}
