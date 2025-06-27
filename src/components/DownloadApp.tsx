'use client';

import { FiDownload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DownloadAppButtonProps {
  href: string;
}

export const DownloadAppButton: React.FC<DownloadAppButtonProps> = ({ href }) => {
  const handleClick = async () => {
    try {
      // Track the download via your custom workspace endpoint
      await fetch('https://api.counterapi.dev/v2/pesowise/pesowise-download-clicks/up', {
        method: 'GET',
      });

    } catch (err) {
      console.error('Failed to log download:', err);
    } finally {
      // Proceed with download or open link
      window.open(href, '_blank');
    }
  };

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
