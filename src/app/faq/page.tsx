'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { HelpCircle, GlobeIcon } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import { DownloadAppButton } from '@/components/DownloadApp';

const faqs = [
  {
    question: 'What is PesoWise?',
    answer: 'PesoWise is a simple budgeting tool to help you manage your finances using one-time or recurring budgets.',
  },
  {
    question: "What's the difference between One-Time and Recurring Budgets?",
    answer: 'One-Time Budgets are for short-term goals like trips or events, while Recurring Budgets are perfect for monthly income and expenses.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'Your data is stored locally on your device using IndexedDB. We do not upload your data to any server.',
  },
  {
    question: 'Can I track my spending?',
    answer: 'Yes! You can add entries to each budget to track your spending over time and see how much remains.',
  },
  {
    question: 'Is PesoWise free?',
    answer: 'Yes, PesoWise is completely free to use with no hidden costs or subscriptions.',
  },
  {
    question: 'How can I install the app?',
    answer: 'You can download the app using the download button in the top right. It works as a PWA or Android APK.',
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 overflow-visible">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 leading-[1.5] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Everything you need to know
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Quick answers to your questions about PesoWise
        </motion.p>
      </motion.div>

      <motion.div
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
        className="bg-white dark:bg-gray-900/50 rounded-2xl p-1 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-gray-800"
      >
        <Accordion
          type="single"
          collapsible
          className="w-full divide-y divide-gray-100 dark:divide-gray-800"
        >
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                  },
                },
              }}
              whileHover={{ scale: 1.005 }}
            >
              <AccordionItem value={`item-${idx}`} className="border-0 px-6 py-4">
                <AccordionTrigger className="hover:no-underline group">
                  <div className="flex items-start space-x-4 w-full">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {faq.question}
                      </h3>
                      <AccordionContent className="pt-2 text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </AccordionContent>
                    </div>
                  </div>
                </AccordionTrigger>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        className="mt-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 p-0.5 rounded-full mb-8">
          <div className="bg-white dark:bg-gray-900 px-6 py-2 rounded-full">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Need more help?
            </h2>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Connect with us through these channels for additional support or inquiries
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <motion.a
            whileHover={{ y: -2 }}
            href="https://github.com/xjeyceex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#24292f] hover:bg-[#1f2429] rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <FaGithub className="w-5 h-5" />
            GitHub
          </motion.a>
          <motion.a
            whileHover={{ y: -2 }}
            href="https://www.linkedin.com/in/jc-miguel-beltran/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <FaLinkedin className="w-5 h-5" />
            LinkedIn
          </motion.a>
          <motion.a
            whileHover={{ y: -2 }}
            href="https://jcmiguel-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <GlobeIcon className="w-5 h-5" />
            Portfolio
          </motion.a>
          <motion.a
            whileHover={{ y: -2 }}
            href="mailto:jcmiguel.beltran@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <HiMail className="w-5 h-5" />
            Email
          </motion.a>
        </div>

        <div className="mt-8">
          <DownloadAppButton href="https://drive.google.com/drive/u/0/folders/1LatStDgvxedKOSuBwWUfs1b54rwsIgTg" faq />
        </div>
      </motion.div>
    </div>
  );
}
