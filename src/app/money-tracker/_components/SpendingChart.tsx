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
import { useState } from 'react';
import { CustomTooltip } from './CustomToolTip';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';

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
  formatPeriodLabel: (period: string) => string;
  onBudgetChange: (period: string, newBudget: number) => void;
  disableEditFor?: (periodKey: string) => boolean;
};

function isPastPeriod(periodKey: string): boolean {
  const [year, month, day] = periodKey.split('-').map(Number);
  const periodStart = new Date(year, month - 1, day);
  const now = new Date();
  return (
    periodStart < new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );
}

export default function SpendingChart({
  periods,
  periodBudgets,
  formatPeriodLabel,
  onBudgetChange,
  disableEditFor,
}: Props) {
  const { theme } = useTheme();
  const [editingPeriod, setEditingPeriod] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<number>(0);

  const chartData: ChartData[] = periods
    .map(([period, data]) => {
      const budget = periodBudgets[period] ?? 0;
      const total = data.total;
      const savings = Math.max(budget - total, 0);

      return {
        period,
        label: formatPeriodLabel(period),
        total,
        budget,
        savings,
      };
    })
    .filter(
      (data) => !(data.total === 0 && data.budget === 0 && data.savings === 0)
    );

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
      {/* Chart Container */}
      <div className="h-[260px] sm:h-[480px] lg:h-[520px] rounded-2xl bg-card shadow-md overflow-x-auto border">
        <div className="w-full h-full px-2 sm:px-4 pt-2 pb-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              barSize={12}
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
              <Bar
                dataKey="budget"
                name="Budget"
                radius={[4, 4, 0, 0]}
                fill={colors.primary}
              />
              <Bar
                dataKey="total"
                name="Spent"
                radius={[4, 4, 0, 0]}
                fill={colors.danger}
              />
              <Bar
                dataKey="savings"
                name="Savings"
                radius={[4, 4, 0, 0]}
                fill={colors.secondary}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Controls */}
      <div className="flex flex-col gap-4 w-full">
        {chartData.map((data) => {
          const isEditable = disableEditFor
            ? !disableEditFor(data.period)
            : isPastPeriod(data.period);

          return (
            <div
              key={data.period}
              className="flex items-center justify-between min-w-0 text-base gap-3 bg-muted px-4 py-3 rounded-xl"
            >
              <span className="truncate font-medium text-sm sm:text-base">
                {data.label}
              </span>

              {isEditable ? (
                <Dialog
                  open={editingPeriod === data.period}
                  onOpenChange={(open) => {
                    if (!open) setEditingPeriod(null);
                  }}
                >
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
                  <DialogContent className="w-[92vw] max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl px-5 py-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editingPeriod) {
                          onBudgetChange(editingPeriod, tempBudget);
                          setEditingPeriod(null);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <DialogTitle className="text-base font-semibold">
                          Edit Budget for {data.label}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                          Set a custom amount for this period.
                        </DialogDescription>
                      </div>

                      <Input
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(Number(e.target.value))}
                        className="text-base py-2"
                        autoFocus
                        required
                        min={0}
                        step={1}
                      />

                      <Button size="sm" type="submit" className="w-full mt-3">
                        Save
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Ongoing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
