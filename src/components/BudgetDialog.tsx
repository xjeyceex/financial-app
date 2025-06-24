'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type BudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  name: string;
  amount: string;
  onNameChange: (value: string) => void;
  setAmount: (value: string) => void;
  onSave: () => void;
};

export default function BudgetDialog({
  open,
  onOpenChange,
  mode,
  name,
  amount,
  setAmount,
  onNameChange,
  onSave,
}: BudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Recurring Budget' : 'Edit Budget'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="budget-name">Name</Label>
            <Input
              id="budget-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Groceries, Rent"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="budget-amount">Amount</Label>
            <Input
              id="budget-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
