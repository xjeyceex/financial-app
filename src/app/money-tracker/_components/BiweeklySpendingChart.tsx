'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';

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
  const [colors, setColors] = useState({
    foreground: '#000000',
    border: '#e5e7eb',
    primary: '#3b82f6',
    popover: '#ffffff',
  });

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const resolvedColors = {
      foreground: root.getPropertyValue('--foreground').trim(),
      border: root.getPropertyValue('--border').trim(),
      primary: root.getPropertyValue('--primary').trim(),
      popover: root.getPropertyValue('--popover').trim(),
    };

    setColors(resolvedColors);
  }, []);

  const chartData: ChartData[] = periods.map(([period, data]) => ({
    period,
    label: formatBiweeklyLabel(period),
    total: data.total,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">
        Biweekly Spending
      </h4>

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
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  'Total Spent',
                ]}
                labelFormatter={(label) => `Period: ${label}`}
                contentStyle={{
                  background: colors.popover,
                  borderColor: colors.border,
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: colors.foreground,
                }}
              />
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                fill={colors.primary}
                fillOpacity={1}
                activeBar={{ fill: colors.primary, fillOpacity: 0.9 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
