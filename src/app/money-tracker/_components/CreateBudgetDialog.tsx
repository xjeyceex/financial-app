import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function CreateBudgetDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, recurring: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [recurring, setRecurring] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Switch
              id="recurring-toggle"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <label htmlFor="recurring-toggle" className="text-sm">
              Recurring
            </label>
          </div>
          <Button
            onClick={() => {
              onCreate(name, recurring);
              setName('');
              setRecurring(false);
            }}
          >
            Create Budget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
