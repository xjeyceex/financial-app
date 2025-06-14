'use client';

import { FiEdit, FiTrash } from 'react-icons/fi';
import { Entry } from '../page';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

type Props = {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
};

// Get biweekly period with year (e.g., Jun 1–15, 2025)
function getBiweeklyPeriod(dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const start = new Date(year, month, day <= 15 ? 1 : 16);
  const end = new Date(
    year,
    month,
    day <= 15 ? 15 : new Date(year, month + 1, 0).getDate()
  );

  return `${format(start, 'MMM d', { locale: enUS })}–${format(end, 'd', { locale: enUS })}, ${year}`;
}

// Group entries by biweekly period string
function groupEntriesBiweekly(entries: Entry[]) {
  return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const period = getBiweeklyPeriod(entry.date);
    if (!acc[period]) acc[period] = [];
    acc[period].push(entry);
    return acc;
  }, {});
}

export default function EntryList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return <p className="text-gray-500">No entries yet.</p>;
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const grouped = groupEntriesBiweekly(entries);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([period, groupEntries]) => (
        <div key={period}>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {period}
          </h3>
          <ul className="space-y-2">
            {groupEntries.map((entry) => (
              <li key={entry.id} className="border p-3 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {entry.item?.trim() || 'Unspecified'}
                    </p>
                    {entry.description && (
                      <p className="text-sm text-gray-500">
                        {entry.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-500">
                      -₱{entry.amount.toFixed(2)}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="text-red-500 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
