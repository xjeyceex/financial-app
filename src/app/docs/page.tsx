'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Repeat, PlusCircle, CalendarClock, Timer } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          PesoWise Documentation
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Learn how to create recurring and one-time budgets, track your spending, and manage your finances effectively with PesoWise.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid gap-6 sm:gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
      >
        {/* Creating Recurring Budget */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center text-blue-600 dark:text-blue-300">
                <PlusCircle className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                How to Create a Recurring Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm sm:text-base text-muted-foreground space-y-2">
              <p>1. On the home screen, click the dropdown menu beside your current budget.</p>
              <p>2. Select <strong>Create Budget</strong>.</p>
              <p>3. Choose <strong>Recurring</strong> as the budget type.</p>
              <p>4. Enter your desired budget amount, and PesoWise will automatically handle each cycle.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* How Recurring Budgets Work */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center text-purple-600 dark:text-purple-300">
                <Repeat className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                How Recurring Budgets Work
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm sm:text-base text-muted-foreground space-y-2">
              <p>Recurring budgets in PesoWise automatically reset twice a month:</p>
              <ul className="list-disc pl-6">
                <li><strong>Period 1:</strong> from the 1st to the 15th</li>
                <li><strong>Period 2:</strong> from the 16th to the end of the month</li>
              </ul>
              <p>Each period has its own tracked entries and balance. A new period is created automatically when needed.</p>
              <p><strong>Note:</strong> Any past periods with <em>zero entries</em> are automatically deleted to reduce clutter.</p>
              <p>You can view previous periods in your budget history and optionally carry over unused balances—whether debt or credit—to the next cycle.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* One-Time Budgets */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center text-orange-600 dark:text-orange-300">
                <Timer className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
                How One-Time Budgets Work
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm sm:text-base text-muted-foreground space-y-2">
              <p>One-Time Budgets are perfect for short-term goals like trips, projects, or events.</p>
              <p>They do not reset and remain active until you delete them manually.</p>
              <p>Each one-time budget shows:</p>
              <ul className="list-disc pl-6">
                <li>Total spent and remaining</li>
                <li>Spending trend and projected depletion date</li>
                <li>All associated entries with editing support</li>
              </ul>
              <p>You can create a One-Time Budget from the same <strong>Create Budget</strong> modal by selecting the <strong>One-Time</strong> option.</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tracking Expenses */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center text-green-600 dark:text-green-300">
                <CalendarClock className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
                Tracking Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm sm:text-base text-muted-foreground space-y-2">
              <p>You can add income or expense entries using the modal form on any budget.</p>
              <p>Each entry is calculated in real-time and supports:</p>
              <ul className="list-disc pl-6">
                <li>Labels and color tags</li>
                <li>Arithmetic input (e.g., <code>100 + 25 - 5</code>)</li>
                <li>Editing or deleting entries any time</li>
              </ul>
              <p>The budget card shows a live summary of total spent, remaining balance, and percentage used.</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
