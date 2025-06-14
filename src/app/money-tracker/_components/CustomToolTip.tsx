import { TooltipProps } from 'recharts';

export const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  const spent = payload.find((item) => item.name === 'Spent')?.value as number;
  const savings = payload.find((item) => item.name === 'Savings')
    ?.value as number;
  const budget = payload[0].payload?.budget;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md text-foreground space-y-1.5">
      <div className="text-muted-foreground">Period: {label}</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-sm font-semibold text-blue-500">
            ₱{budget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="font-medium text-muted-foreground">Budget</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-red-500">
            ₱{spent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="font-medium text-muted-foreground">Spent</div>
        </div>
        <div>
          <div
            className={`text-sm font-semibold ${
              savings >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            ₱
            {Math.abs(savings).toLocaleString('en-PH', {
              minimumFractionDigits: 2,
            })}
          </div>
          <div className="font-medium text-muted-foreground">
            {savings >= 0 ? 'Saved' : 'Overspent'}
          </div>
        </div>
      </div>
    </div>
  );
};
