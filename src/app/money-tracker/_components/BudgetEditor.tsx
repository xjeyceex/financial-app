import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function BudgetEditor({
  tempBudget,
  setTempBudget,
  handleBudgetSave,
  handleBudgetCancel,
}: {
  tempBudget: string;
  setTempBudget: (value: string) => void;
  handleBudgetSave: () => void;
  handleBudgetCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleBudgetSave();
      }}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          ₱
        </span>
        <Input
          value={tempBudget}
          onChange={(e) => setTempBudget(e.target.value)}
          className="pl-8 text-lg"
          autoFocus
          type="number"
          min="0"
          step="100"
        />
      </div>
      <Button type="submit" size="icon" className="h-9 w-9" variant="default">
        <Check className="w-4 h-4" />
        <span className="sr-only">Save</span>
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={handleBudgetCancel}
        className="h-9 w-9"
      >
        <X className="w-4 h-4" />
        <span className="sr-only">Cancel</span>
      </Button>
    </form>
  );
}
