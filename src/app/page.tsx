'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveLastVisited } from '@/lib/indexedDB';

export default function Home() {
  const router = useRouter();

  const handleNavigate = async (path: string) => {
    await saveLastVisited(path);
    router.push(path);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Welcome to PesoWise
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Choose a budget type to begin your financial journey
          </p>
        </motion.div>

        {/* Card Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* One-Time Budget */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10"
              onClick={() => handleNavigate('/one-time')}
            >
              <CardHeader className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <PiggyBank className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle className="text-base font-semibold text-blue-600 dark:text-blue-300">
                  One-Time Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-500 dark:text-blue-300/80">
                Perfect for vacations, projects, or special purchases
              </CardContent>
            </Card>
          </motion.div>

          {/* Recurring Budget */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10"
              onClick={() => handleNavigate('/recurring')}
            >
              <CardHeader className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Repeat className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-base font-semibold text-purple-600 dark:text-purple-300">
                  Recurring Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-purple-500 dark:text-purple-300/80">
                Ideal for monthly bills, subscriptions, and regular income
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground pt-6"
        >
          <span className="inline-block px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            🔒 Your data stays private and secure on your device
          </span>
        </motion.p>
      </div>
    </div>
  );
}
