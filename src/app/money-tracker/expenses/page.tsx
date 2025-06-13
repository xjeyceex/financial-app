'use client';

import { Entry } from '../page';
import EntryForm from '../_components/EntryForm';
import EntryList from '../_components/EntryList';

type Props = {
  entries: Entry[];
  onAdd: (entry: Entry) => void;
  onUpdate: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  editingEntry: Entry | null;
  cancelEdit: () => void;
};

export default function EntrySection({
  entries,
  onAdd,
  onUpdate,
  onDelete,
  onEdit,
  editingEntry,
  cancelEdit,
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Add Expense (left) */}
      <div className="lg:w-1/2 space-y-4">
        <h2 className="text-xl font-semibold">Add Expense</h2>
        <EntryForm
          onAdd={onAdd}
          onUpdate={onUpdate}
          editingEntry={editingEntry}
          cancelEdit={cancelEdit}
        />
      </div>

      {/* Expense List (right) */}
      <div className="lg:w-1/2 space-y-4">
        <h2 className="text-xl font-semibold">Your Expenses</h2>
        <EntryList entries={entries} onDelete={onDelete} onEdit={onEdit} />
      </div>
    </div>
  );
}
