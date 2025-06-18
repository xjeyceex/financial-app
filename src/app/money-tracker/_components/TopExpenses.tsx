export default function TopExpenses({
  expenses,
  formatPeriodLabel,
  activePeriodKey,
}: {
  expenses: Array<{ period: string; item: string; amount: number }>;
  formatPeriodLabel: (key: string) => string;
  activePeriodKey: string;
}) {
  // Filter expenses strictly to the active period key
  const filteredExpenses = expenses.filter(
    ({ period, amount }) => period === activePeriodKey && amount > 0
  );

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Recent Top Expenses
      </h4>
      {filteredExpenses.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No expenses for this period.
        </p>
      )}
      {filteredExpenses.map(({ period, item, amount }, index) => (
        <div
          key={`${period}-${item}-${amount}-${index}`}
          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium">{item || 'Unspecified'}</p>
            <p className="text-xs text-muted-foreground">
              {formatPeriodLabel(period)}
            </p>
          </div>
          <p className="font-semibold">
            ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  );
}
