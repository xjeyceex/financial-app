'use client';

import { useState } from 'react';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Entry } from '../../../../lib/types';
import ConfirmDialog from './DeleteBudgetDialog';

type Props = {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  recurring: boolean;
};

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

function groupEntriesBiweekly(entries: Entry[]) {
  return entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    const period = getBiweeklyPeriod(entry.date);
    if (!acc[period]) acc[period] = [];
    acc[period].push(entry);
    return acc;
  }, {});
}

export default function EntryList({
  entries,
  onEdit,
  onDelete,
  recurring,
}: Props) {
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);

  if (entries.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No entries yet.</p>;
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const grouped = recurring
    ? groupEntriesBiweekly(sortedEntries)
    : { All: sortedEntries };

  return (
    <>
      <div className="space-y-4">
        {Object.entries(grouped).map(([period, groupEntries]) => (
          <div key={period}>
            {recurring && (
              <h3 className="text-sm font-medium text-muted-foreground mb-1 dark:text-gray-400">
                {period}
              </h3>
            )}
            <ul className="space-y-1.5">
              {groupEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="border p-3 rounded-xl shadow-sm bg-white dark:bg-zinc-800 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start gap-3 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                        {entry.item?.trim() || 'Unspecified'}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {entry.description}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {formatDate(entry.date)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                      <span className="font-bold text-red-500 text-sm">
                        -₱{entry.amount.toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEdit(entry)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="text-red-500 hover:text-red-800 dark:hover:text-red-400 p-1"
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={entryToDelete !== null}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) onDelete(entryToDelete.id);
        }}
        title="Delete Entry"
        description={`Are you sure you want to delete "${entryToDelete?.item}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
      />
    </>
  );
}
