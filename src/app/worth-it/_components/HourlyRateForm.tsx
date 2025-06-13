'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Props = {
  onSave: (hourlyRate: number) => void;
};

export default function IncomeRateForm({ onSave }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'monthly' | 'biweekly'>('monthly');
  const [savedRate, setSavedRate] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hourlyRate');
    if (stored) {
      setSavedRate(parseFloat(stored));
    }
  }, []);

  const calculateHourly = (amount: number, type: 'monthly' | 'biweekly') => {
    const hoursPerDay = 8;
    const workDays = type === 'monthly' ? 22 : 11;
    return amount / (workDays * hoursPerDay);
  };

  const formatAmount = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, '');
    if (!numeric) return '';
    const number = parseFloat(numeric);
    return number.toLocaleString('en-PH');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = raw.replace(/[^0-9]/g, '');
    setAmount(numeric);
  };

  const handleSave = () => {
    const income = parseFloat(amount);
    if (!isNaN(income)) {
      const hourly = calculateHourly(income, type);
      localStorage.setItem('hourlyRate', hourly.toString());
      setSavedRate(hourly);
      onSave(hourly);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Income</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          defaultValue="monthly"
          onValueChange={(val) => setType(val as 'monthly' | 'biweekly')}
          className="flex gap-4"
        >
          <div>
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div>
            <RadioGroupItem value="biweekly" id="biweekly" />
            <Label htmlFor="biweekly">Bi-weekly</Label>
          </div>
        </RadioGroup>

        <Input
          type="text"
          inputMode="numeric"
          value={formatAmount(amount)}
          onChange={handleChange}
          placeholder="Enter your income (e.g. 18,000)"
        />

        <Button onClick={handleSave}>Save</Button>

        {savedRate !== null && (
          <p className="text-sm text-muted-foreground">
            Calculated hourly rate: <strong>₱{savedRate.toFixed(2)}/hr</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
