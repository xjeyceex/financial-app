'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Props = {
  hourlyRate: number;
  onResult: (hours: number) => void;
};

export default function WorthItForm({ hourlyRate, onResult }: Props) {
  const [price, setPrice] = useState('');

  const handleCalculate = () => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || hourlyRate === 0) return;
    const hours = parsedPrice / hourlyRate;
    onResult(hours);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Is It Worth It?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (e.g. 150)"
        />
        <Button onClick={handleCalculate}>Calculate</Button>
      </CardContent>
    </Card>
  );
}
