'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
} from 'recharts';
import { useTheme } from 'next-themes';

type ChartData = {
  period: string;
  label: string;
  total: number;
  savings: number;
  budget: number;
};

type Props = {
  periods: [string, { total: number }][];
  periodBudgets: Record<string, number>;
  formatBiweeklyLabel: (period: string) => string;
};

export default function BiweeklySpendingChart({
  periods,
  periodBudgets,
  formatBiweeklyLabel,
}: Props) {
  const { theme } = useTheme();

  // Create chart data with period-specific budgets
  const chartData: ChartData[] = periods.map(([period, data]) => {
    // Get the budget for this specific period, fallback to 0 if not found
    const periodBudget = periodBudgets[period] || 0;
    return {
      period,
      label: formatBiweeklyLabel(period),
      total: data.total,
      budget: periodBudget,
      savings: periodBudget - data.total,
    };
  });

  if (chartData.length === 0) return null;

  // Light/dark themed colors from Tailwind palette
  const isDark = theme === 'dark';
  const colors = {
    foreground: isDark ? '#f4f4f5' : '#0c0c0d',
    border: isDark ? '#3f3f46' : '#e4e4e7',
    primary: '#3b82f6',
    secondary: '#10b981',
    danger: '#ef4444',
    popover: isDark ? '#18181b' : '#ffffff',
  };

  return (
    <div className="space-y-2">
      <div className="h-[300px] rounded-2xl bg-card shadow-md overflow-x-auto border">
        <div className="min-w-[480px] sm:min-w-full h-full px-2 py-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: colors.foreground }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={40}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.foreground }}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                tickFormatter={(value) =>
                  `₱${(value as number).toLocaleString()}`
                }
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Add reference lines for each period's budget */}
              {chartData.map((data, index) => (
                <ReferenceLine
                  key={index}
                  y={data.budget}
                  stroke={colors.foreground}
                  strokeDasharray="3 3"
                  label={{
                    position: 'top',
                    value: 'Budget',
                    fill: colors.foreground,
                    fontSize: 11,
                  }}
                />
              ))}

              <Bar
                dataKey="total"
                name="Spent"
                radius={[4, 4, 0, 0]}
                fill={colors.primary}
                fillOpacity={1}
                activeBar={{ fill: colors.primary, fillOpacity: 0.9 }}
              />
              <Bar
                dataKey="savings"
                name="Savings"
                radius={[4, 4, 0, 0]}
                fill={colors.secondary}
                fillOpacity={1}
                activeBar={{ fill: colors.secondary, fillOpacity: 0.9 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({
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
