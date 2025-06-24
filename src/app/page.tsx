'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold">Welcome to Budget App</h1>
      <p className="text-muted-foreground">
        Choose a budget type to get started:
      </p>
      <div className="flex gap-4">
        <Button size="lg" onClick={() => router.push('/one-time')}>
          One-Time Budget
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push('/recurring')}
        >
          Recurring Budget
        </Button>
      </div>
    </div>
  );
}
