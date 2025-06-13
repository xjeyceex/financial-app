import { FiEdit, FiTrash } from 'react-icons/fi';
import { Entry } from '../page';

type Props = {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
};

export default function EntryList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return <p className="text-gray-500">No entries yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id} className="border p-3 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{entry.item}</p>
              {entry.description && (
                <p className="text-sm text-gray-500">{entry.description}</p>
              )}
              <p className="text-sm text-gray-400">{entry.date}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">
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
                  className="text-red-600 hover:text-red-800 p-1"
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
  );
}
