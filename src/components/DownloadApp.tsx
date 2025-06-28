'use client';

import { FiDownload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface DownloadAppButtonProps {
  href: string;
  faq?: boolean;
}

const API_KEY = 'gTVjhC2hMocWMuE6USgdzw==AhdFcUSkSZLqN0aY';
const COUNTER_ID = 'pesowise-download';

export const DownloadAppButton: React.FC<DownloadAppButtonProps> = ({ href, faq }) => {
  const handleClick = async () => {
    window.open(href, '_blank');

    // Log the download in the background (non-blocking)
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/counter?id=${COUNTER_ID}&hit=true`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': API_KEY,
          },
        }
      );
      if (!response.ok) {
        console.error('Failed to increment counter:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Failed to log download:', err);
    }
  };

  if (faq) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={clsx(
          'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white',
          'bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-all'
        )}
      >
        <FiDownload className="w-5 h-5" />
        Download PesoWise
      </motion.button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="link"
          size="icon"
          onClick={handleClick}
          className="text-primary hover:bg-primary/10"
        >
          <FiDownload className="w-5 h-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download this app</TooltipContent>
    </Tooltip>
  );
};
