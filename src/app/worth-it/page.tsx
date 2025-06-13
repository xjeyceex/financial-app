'use client';

import HourlyRateForm from './_components/HourlyRateForm';
import WorthItForm from './_components/WorthItForm';
import WorthItResult from './_components/WorthItResult';
import { useState } from 'react';

export default function WorthItPage() {
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);

  const handleRateSave = (rate: number) => setHourlyRate(rate);
  const handleResult = (calculatedHours: number) => {
    setHours(calculatedHours);
  };

  return (
    <main className="max-w-xl mx-auto p-4 space-y-6">
      <HourlyRateForm onSave={handleRateSave} />
      {hourlyRate !== null && (
        <WorthItForm hourlyRate={hourlyRate} onResult={handleResult} />
      )}
      {hours !== null && hourlyRate !== null && (
        <WorthItResult hours={hours} hourlyRate={hourlyRate} />
      )}
    </main>
  );
}
