export default function TopExpenses({
  expenses,
  formatBiweeklyLabel,
}: {
  expenses: Array<{ period: string; item: string; amount: number }>;
  formatBiweeklyLabel: (key: string) => string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Recent Top Expenses
      </h4>
      {expenses.map(({ period, item, amount }) => (
        <div
          key={period}
          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium">{item || 'Unspecified'}</p>
            <p className="text-xs text-muted-foreground">
              {formatBiweeklyLabel(period)}
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
