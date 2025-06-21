'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FiEdit,
  FiSave,
  FiX,
  FiDollarSign,
  FiPieChart,
  FiTrash,
} from 'react-icons/fi';
import { formatCurrency } from '../lib/functions';

interface BudgetPeriodProps {
  period: {
    id: string;
    startDate: string;
    endDate: string;
    amount: number;
    entries: Array<{
      id: string;
      description?: string;
      amount: number;
      date: string;
    }>;
    carriedOver?: {
      savings: number;
      debt: number;
    };
    finalBalance?: number;
  };
  onAmountChange: (newAmount: number) => void;
  onEntryEdit: (entry: {
    id: string;
    description?: string;
    amount: number;
    date: string;
  }) => void;
  onEntryDelete: (entryId: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function BudgetPeriod({
  period,
  onAmountChange,
  onEntryEdit,
  onEntryDelete,
}: BudgetPeriodProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(period.amount.toString());
  const [chartView, setChartView] = useState<'bar' | 'pie'>('bar');

  const totalExpenses = period.entries.reduce((sum, e) => sum + e.amount, 0);
  const finalBalance = period.finalBalance ?? period.amount - totalExpenses;
  const savings = finalBalance > 0 ? finalBalance : 0;
  const debt = finalBalance < 0 ? Math.abs(finalBalance) : 0;

  const handleSaveAmount = () => {
    const parsedAmount = parseFloat(editAmount);
    if (!isNaN(parsedAmount)) {
      onAmountChange(parsedAmount);
      setIsEditing(false);
    }
  };

  // Data for charts
  const barChartData = [
    {
      name: 'Budget',
      Budget: period.amount,
      Spent: totalExpenses,
      Remaining: period.amount - totalExpenses,
    },
  ];

  const pieChartData = [
    { name: 'Spent', value: totalExpenses },
    { name: 'Remaining', value: Math.max(0, period.amount - totalExpenses) },
  ];

  const savingsDebtData = [
    { name: 'Savings', value: savings },
    { name: 'Debt', value: debt },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {new Date(period.startDate).toLocaleDateString()} -{' '}
            {new Date(period.endDate).toLocaleDateString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                finalBalance > 0
                  ? 'secondary'
                  : finalBalance < 0
                    ? 'destructive'
                    : 'outline'
              }
            >
              {finalBalance > 0
                ? `+${formatCurrency(finalBalance)} Savings`
                : finalBalance < 0
                  ? `${formatCurrency(finalBalance)} Debt`
                  : 'Balanced'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditAmount(period.amount.toString());
              }}
              className="h-8 w-8"
            >
              {isEditing ? (
                <FiX className="h-4 w-4" />
              ) : (
                <FiEdit className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Budget Amount Editor */}
        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAmount();
            }}
            className="flex items-center gap-2"
          >
            <Input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-32"
              autoFocus
            />
            <Button type="submit" size="sm">
              <FiSave className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div
            className="grid grid-cols-3 gap-4 text-center cursor-pointer"
            onClick={() => {
              setIsEditing(true);
              setEditAmount(period.amount.toString());
            }}
          >
            <div className="space-y-1 hover:bg-accent/50 p-2 rounded transition-colors">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-lg font-semibold">
                {formatCurrency(period.amount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p
                className={`text-lg font-semibold ${
                  period.amount - totalExpenses < 0
                    ? 'text-destructive'
                    : 'text-green-600'
                }`}
              >
                {formatCurrency(period.amount - totalExpenses)}
              </p>
            </div>
          </div>
        )}

        {/* Chart View Toggle */}
        <div className="flex justify-center gap-2">
          <Button
            variant={chartView === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('bar')}
          >
            <FiDollarSign className="mr-2 h-4 w-4" />
            Bar Chart
          </Button>
          <Button
            variant={chartView === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartView('pie')}
          >
            <FiPieChart className="mr-2 h-4 w-4" />
            Pie Chart
          </Button>
        </div>

        {/* Charts - Fixed Height Container */}
        <div className="w-full">
          {chartView === 'bar' ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="Budget" fill="#8884d8" />
                  <Bar dataKey="Spent" fill="#ff8042" />
                  <Bar dataKey="Remaining" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Budget Breakdown */}
              <div className="w-full h-[300px] md:flex-1">
                <h4 className="text-center text-sm font-medium mb-2">
                  Budget Breakdown
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Savings/Debt */}
              {(savings > 0 || debt > 0) && (
                <div className="w-full h-[300px] md:flex-1">
                  <h4 className="text-center text-sm font-medium mb-2">
                    Savings / Debt
                  </h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={savingsDebtData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {savingsDebtData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === 'Savings' ? '#82ca9d' : '#ff8042'
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Floating Labels Below Chart */}
                  <div className="flex justify-center gap-4 mt-2 text-sm">
                    {savingsDebtData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              entry.name === 'Savings' ? '#82ca9d' : '#ff8042',
                          }}
                        />
                        <span>
                          {entry.name}: {formatCurrency(entry.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Entries List */}
        <div>
          <h3 className="font-semibold mb-2">
            Entries ({period.entries.length})
          </h3>
          {period.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries for this period
            </p>
          ) : (
            <div className="space-y-2">
              {period.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {entry.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">
                        {formatCurrency(entry.amount)}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEntryEdit(entry)}
                      className="h-8 w-8"
                    >
                      <FiEdit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEntryDelete(entry.id)}
                      className="h-8 w-8"
                    >
                      <FiTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
