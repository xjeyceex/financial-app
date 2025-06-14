'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { CustomTooltip } from './CustomToolTip';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@radix-ui/react-dialog';

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
  onBudgetChange: (period: string, newBudget: number) => void;
};

export default function BiweeklySpendingChart({
  periods,
  periodBudgets,
  formatBiweeklyLabel,
  onBudgetChange,
}: Props) {
  const { theme } = useTheme();

  const [editingPeriod, setEditingPeriod] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<number>(0);

  const chartData: ChartData[] = periods.map(([period, data]) => {
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
    <div className="space-y-8">
      <div className="h-[260px] sm:h-[480px] lg:h-[520px] rounded-2xl bg-card shadow-md overflow-x-auto border">
        <div className="w-full h-full px-2 sm:px-4 pt-2 pb-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: colors.foreground }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
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

      {/* Edit Budget Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {chartData.map((data) => (
          <div
            key={data.period}
            className="flex items-center justify-between min-w-0 text-base gap-3 bg-muted px-4 py-3 rounded-xl"
          >
            <span className="truncate font-medium text-sm sm:text-base">
              {data.label}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm"
                  onClick={() => {
                    setEditingPeriod(data.period);
                    setTempBudget(data.budget);
                  }}
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="space-y-5 w-[92vw] max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogTitle className="text-lg font-semibold">
                  Edit Budget for {data.label}
                </DialogTitle>
                <Input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="text-lg py-3"
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (editingPeriod) {
                      onBudgetChange(editingPeriod, tempBudget);
                    }
                  }}
                >
                  Save
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}
