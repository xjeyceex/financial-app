'use client';

import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const modules = [
  {
    label: 'Money Tracker',
    description: 'Track expenses with smart tagging.',
    href: '/money-tracker',
  },
  {
    label: '🧠 Worth It? Calculator',
    description: 'Know if a purchase is worth your time.',
    href: '/worth-it',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-6 text-center">
      <div className="space-y-6 max-w-md w-full">
        <h1 className="text-5xl font-bold text-foreground">
          📊 Personal Finance Tools
        </h1>
        <p className="text-muted-foreground">
          Simple tools to help you manage money better, made for the PH context.
        </p>

        <div className="space-y-4">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href} className="block">
              <Card className="hover:bg-muted transition-colors cursor-pointer text-left">
                <CardContent className="py-4">
                  <CardTitle className="text-xl">{mod.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
