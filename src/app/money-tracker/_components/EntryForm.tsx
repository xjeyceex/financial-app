'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Entry } from '../../../lib/types';

type Props = {
  onAdd: (entry: Entry) => void;
  onUpdate: (entry: Entry) => void;
  editingEntry: Entry | null;
  cancelEdit: () => void;
  budgetId: string;
};

export default function EntryForm({
  onAdd,
  onUpdate,
  editingEntry,
  cancelEdit,
  budgetId,
}: Props) {
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [date, setDate] = useState(getLocalDateTime());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setAmount(editingEntry.amount.toString());
      setItem(editingEntry.item || '');
      setDate(editingEntry.date);
      setDescription(editingEntry.description || '');
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEntry?.id]);

  const resetForm = () => {
    setAmount('');
    setItem('');
    setDate(getLocalDateTime());
    setDescription('');
  };

  const parseAmount = (input: string): number => {
    try {
      const sanitized = input.replace(/[^-()\d/*+.]/g, '');
      const result = Function(`\"use strict\"; return (${sanitized})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const evaluatedAmount = parseAmount(amount);

    const entry: Entry = {
      id: editingEntry ? editingEntry.id : uuidv4(),
      amount: evaluatedAmount,
      item: item.trim() || undefined,
      date,
      description: description.trim() || undefined,
      budgetId, // ✅ Include it
    };

    if (editingEntry) {
      onUpdate(entry);
    } else {
      onAdd(entry);
    }

    resetForm();
    cancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9+\\-*/(). ]*"
        placeholder="Amount (e.g. 10+5+3.25)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <div className="text-sm text-muted-foreground">
        Parsed amount: <strong>₱{parseAmount(amount).toFixed(2)}</strong>
      </div>

      <input
        type="text"
        placeholder="Item (optional)"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {editingEntry ? 'Save Changes' : 'Add Entry'}
        </button>
        {editingEntry && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              cancelEdit();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function getLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
