'use client';

import { Entry } from '../page';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Props = {
  entries: Entry[];
  budget: number;
};

type WeeklyData = {
  total: number;
  items: Record<string, number>;
};

type ChartData = {
  week: string;
  weekLabel: string;
  total: number;
};

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const formatWeekRange = (dateString: string) => {
  const date = new Date(dateString);
  const sunday = new Date(date);
  const saturday = new Date(date);
  saturday.setDate(sunday.getDate() + 6);

  const formatDate = (d: Date) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  return `${formatDate(sunday)} to ${formatDate(saturday)}`;
};

export default function Summary({ entries, budget }: Props) {
  const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;

  const remainingClass =
    remaining < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  const remainingLabel = remaining < 0 ? 'Over Budget' : 'Remaining';

  const weeklyData: Record<string, WeeklyData> = {};

  entries.forEach((entry) => {
    const weekStart = new Date(entry.date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { total: 0, items: {} };
    }

    weeklyData[weekKey].total += entry.amount;
    weeklyData[weekKey].items[entry.item] =
      (weeklyData[weekKey].items[entry.item] || 0) + entry.amount;
  });

  const weeks = Object.entries(weeklyData);

  const savingsPerWeek = weeks.map(([, data]) => budget - data.total);
  const averageWeeklyExpenses =
    weeks.reduce((sum, [, data]) => sum + data.total, 0) / weeks.length || 0;

  const mostExpensivePerWeek = weeks.map(([week, data]) => {
    const topItem = Object.entries(data.items).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ['', 0]
    )[0];
    return { week, item: topItem };
  });

  const [peakWeekKey] = weeks.reduce(
    (a, b) => (b[1].total > a[1].total ? b : a),
    ['', { total: 0, items: {} }]
  );

  const chartData: ChartData[] = weeks.map(([week, data]) => ({
    week,
    weekLabel: formatWeekRange(week),
    total: data.total,
  }));

  return (
    <div className="p-4 border rounded bg-gray-50 dark:bg-zinc-800 shadow-sm space-y-4 text-sm">
      {/* Top Budget Summary - 3 columns */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="font-semibold">{formatCurrency(budget)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Spent</p>
          <p className="font-semibold">{formatCurrency(totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{remainingLabel}</p>
          <p className={`font-semibold ${remainingClass}`}>
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
        <div className="bg-white dark:bg-zinc-700 p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Avg Weekly Spend</p>
          <p className="text-orange-600 dark:text-orange-400 font-semibold">
            {formatCurrency(averageWeeklyExpenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-700 p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Avg Weekly Savings</p>
          <p className="text-green-600 dark:text-green-400 font-semibold">
            {formatCurrency(
              savingsPerWeek.reduce((sum, s) => sum + s, 0) /
                (savingsPerWeek.length || 1)
            )}
          </p>
        </div>
        <div className="col-span-2 bg-white dark:bg-zinc-700 p-2 rounded shadow-sm">
          <p className="text-xs text-gray-500">Peak Spending Week</p>
          {peakWeekKey ? (
            <p className="text-red-600 dark:text-red-400 font-semibold">
              {formatWeekRange(peakWeekKey)}
            </p>
          ) : (
            <p className="text-gray-400 italic">No data</p>
          )}
        </div>
      </div>

      {/* Optional: Most Expensive Items (Last 2 weeks only) */}
      {mostExpensivePerWeek.length > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-zinc-700 space-y-1">
          <p className="text-xs font-medium text-gray-500">
            Top Item Per Week (last 2):
          </p>
          <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300">
            {mostExpensivePerWeek.slice(-2).map(({ week, item }) => (
              <li key={week}>
                <span className="font-mono">{formatWeekRange(week)}</span>:{' '}
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compact Bar Chart */}
      {chartData.length > 0 && (
        <div className="h-48 pt-2 border-t border-gray-200 dark:border-zinc-700">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 8 }} interval={0} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Week: ${label}`}
              />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
