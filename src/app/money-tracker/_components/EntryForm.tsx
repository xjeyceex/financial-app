'use client';

import { useState, useEffect } from 'react';
import { Entry } from '../page';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  onAdd: (entry: Entry) => void;
  onUpdate: (entry: Entry) => void;
  editingEntry: Entry | null;
  cancelEdit: () => void;
};

export default function EntryForm({
  onAdd,
  onUpdate,
  editingEntry,
  cancelEdit,
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
    }
  }, [editingEntry]);

  const resetForm = () => {
    setAmount('');
    setItem('');
    setDate(getLocalDateTime());
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: Entry = {
      id: editingEntry ? editingEntry.id : uuidv4(),
      amount: parseFloat(amount),
      item: item.trim() || undefined,
      date,
      description: description.trim() || undefined,
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
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />
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
