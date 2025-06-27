'use client';

import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface DownloadAppButtonProps {
  href: string;
}

const API_KEY = 'gTVjhC2hMocWMuE6USgdzw==AhdFcUSkSZLqN0aY';
const COUNTER_ID = 'pesowise-download';

export const DownloadAppButton: React.FC<DownloadAppButtonProps> = ({ href }) => {
  const [downloadCount, setDownloadCount] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const fetchCounter = async () => {
    try {
      const res = await fetch(`https://api.api-ninjas.com/v1/counter?id=${COUNTER_ID}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': API_KEY,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDownloadCount(data.value);
      } else {
        console.error('Failed to fetch counter:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCounter();
  }, []);

  const handleClick = async () => {
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

      if (response.ok) {
        const data = await response.json();
        setDownloadCount(data.value);
      } else {
        console.error('Failed to increment counter:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Failed to log download:', err);
    } finally {
      window.open(href, '_blank');
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Button
        variant="link"
        size="icon"
        onClick={handleClick}
        className="text-primary hover:bg-primary/10 w-10 h-10"
      >
        <FiDownload className="w-5 h-5" />
      </Button>

      {/* Hover Box */}
      {hovered && downloadCount !== null && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-popover text-xs text-muted-foreground px-2 py-1 rounded-md shadow z-50 whitespace-nowrap">
          {downloadCount.toLocaleString()} downloads
        </div>
      )}
    </div>
  );
};
