'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();

  const chartData: ChartData[] = periods.map(([period, data]) => ({
    period,
    label: formatBiweeklyLabel(period),
    total: data.total,
  }));

  if (chartData.length === 0) return null;

  // Light/dark themed colors from Tailwind palette
  const isDark = theme === 'dark';
  const colors = {
    foreground: isDark ? '#f4f4f5' : '#0c0c0d', // zinc-100 / zinc-900
    border: isDark ? '#3f3f46' : '#e4e4e7', // zinc-700 / zinc-200
    primary: '#3b82f6', // blue-500
    popover: isDark ? '#18181b' : '#ffffff', // zinc-900 / white
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
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  'Total Spent',
                ]}
                labelFormatter={(label) => `Period: ${label}`}
                contentStyle={{
                  background: colors.popover,
                  borderColor: colors.border,
                  borderRadius: '0.5rem',
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
