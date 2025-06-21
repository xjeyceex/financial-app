export type Budget = {
  id: string;
  name: string;
  createdAt: string;
  currentPeriod: {
    id: string;
    amount: number;
    entries: Entry[];
    startDate: string;
    endDate: string;
    carriedOver?: {
      savings: number;
      debt: number;
    };
  };
  pastPeriods?: Array<{
    id: string;
    amount: number;
    entries: Entry[];
    startDate: string;
    endDate: string;
    finalBalance: number;
  }>;
};

export type Entry = {
  id: string;
  description?: string;
  amount: number;
  date: string;
  excludeFromDepletion?: boolean; // ✅ Add this line
};
