export type Entry = {
  id: string;
  amount: number;
  item?: string;
  date: string;
  description?: string;
  budgetId: string;
};

export type BiweeklyData = {
  total: number;
  budget: number;
  savings: number;
  items: Record<string, number>;
};

export type BiweeklyRange = {
  startDay1: number;
  startDay2: number;
  label: string;
};
