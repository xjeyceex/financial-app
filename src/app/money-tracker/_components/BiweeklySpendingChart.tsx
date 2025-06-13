'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartData = {
  period: string;
  label: string;
  total: number;
};

type Props = {
  periods: [string, { total: number }][];
  formatBiweeklyLabel: (period: string) => string;
};

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function BiweeklySpendingChart({
  periods,
  formatBiweeklyLabel,
}: Props) {
  const chartData: ChartData[] = periods.map(([period, data]) => ({
    period,
    label: formatBiweeklyLabel(period),
    total: data.total,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Biweekly Spending
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              tickFormatter={(value) =>
                `₱${(value as number).toLocaleString()}`
              }
            />
            <Tooltip
              formatter={(value) => [
                formatCurrency(Number(value)),
                'Total Spent',
              ]}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={{
                background: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
