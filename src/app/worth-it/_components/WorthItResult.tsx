import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  hours: number;
  hourlyRate: number;
};

export default function WorthItResult({ hours }: Props) {
  const worthIt = hours <= 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          This costs you <strong>{hours.toFixed(2)}</strong> hours of work.
        </p>
        <p className={worthIt ? 'text-green-600' : 'text-red-600'}>
          {worthIt ? '✅ Worth it!' : '🚫 Not worth it.'}
        </p>
      </CardContent>
    </Card>
  );
}
