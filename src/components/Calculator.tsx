import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadCalculatorState, saveCalculatorState } from '@/lib/indexedDB';
import {
  FiDelete,
  FiDivide,
  FiMinus,
  FiPercent,
  FiPlus,
  FiX,
} from 'react-icons/fi';

type CalculatorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setStoredValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setHistory([]);
  }, []);

  const backspace = useCallback(() => {
    if (
      displayValue.length <= 1 ||
      (displayValue.length === 2 && displayValue.startsWith('-'))
    ) {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  }, [displayValue]);

  const inputDigit = useCallback(
    (digit: number) => {
      if (waitingForOperand) {
        setDisplayValue(String(digit));
        setWaitingForOperand(false);
      } else {
        setDisplayValue(
          displayValue === '0' ? String(digit) : displayValue + digit
        );
      }
    },
    [displayValue, waitingForOperand]
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  }, [displayValue, waitingForOperand]);

  const performCalculation = useCallback((): number => {
    const prev = parseFloat(storedValue!);
    const current = parseFloat(displayValue);

    switch (operation) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current === 0 ? NaN : prev / current;
      default:
        return current;
    }
  }, [displayValue, storedValue, operation]);

  const handleOperation = useCallback(
    (nextOperation: string) => {
      if (storedValue === null) {
        setStoredValue(displayValue);
      } else if (operation) {
        const result = performCalculation();
        setDisplayValue(String(result));
        setStoredValue(String(result));
      }

      setWaitingForOperand(true);
      setOperation(nextOperation);
    },
    [displayValue, operation, storedValue, performCalculation]
  );

  const performOperation = useCallback(() => {
    if (!operation || storedValue === null) return;

    const result = performCalculation();
    setHistory((prev) => [
      ...prev.slice(-3),
      `${storedValue} ${operation} ${displayValue} = ${result}`,
    ]);
    setDisplayValue(String(result));
    setStoredValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [displayValue, operation, storedValue, performCalculation]);

  const toggleSign = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };

  const inputPercent = () => {
    setDisplayValue(String(parseFloat(displayValue) / 100));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (/\d/.test(key)) inputDigit(parseInt(key));
      else if (key === '.') inputDot();
      else if (key === '+') handleOperation('+');
      else if (key === '-') handleOperation('-');
      else if (key === '*') handleOperation('×');
      else if (key === '/') handleOperation('÷');
      else if (key === '=' || key === 'Enter') performOperation();
      else if (key === 'Backspace') backspace();
      else if (key === 'Escape') clearAll();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inputDigit,
    inputDot,
    handleOperation,
    performOperation,
    backspace,
    clearAll,
  ]);

  const buttons = [
    {
      label: 'C',
      action: clearAll,
      className: 'text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20',
    },
    {
      label: <FiDelete size={20} />,
      action: backspace,
      className:
        'text-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/20',
    },
    {
      label: '±',
      action: toggleSign,
      className: 'text-muted-foreground hover:bg-muted-foreground/10',
    },
    {
      label: <FiPercent size={20} />,
      action: inputPercent,
      className: 'text-muted-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '7',
      action: () => inputDigit(7),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '8',
      action: () => inputDigit(8),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '9',
      action: () => inputDigit(9),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: <FiDivide size={20} />,
      action: () => handleOperation('÷'),
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    {
      label: '4',
      action: () => inputDigit(4),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '5',
      action: () => inputDigit(5),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '6',
      action: () => inputDigit(6),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: <FiX size={20} />,
      action: () => handleOperation('×'),
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    {
      label: '1',
      action: () => inputDigit(1),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '2',
      action: () => inputDigit(2),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: '3',
      action: () => inputDigit(3),
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: <FiMinus size={20} />,
      action: () => handleOperation('-'),
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    {
      label: '0',
      action: () => inputDigit(0),
      className: 'text-foreground hover:bg-muted-foreground/10 col-span-2',
      span: true,
    },
    {
      label: '.',
      action: inputDot,
      className: 'text-foreground hover:bg-muted-foreground/10',
    },
    {
      label: <FiPlus size={20} />,
      action: () => handleOperation('+'),
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    {
      label: '=',
      action: performOperation,
      className:
        'bg-primary text-primary-foreground hover:bg-primary/90 col-span-4',
      span: true,
    },
  ] as const;

  useEffect(() => {
    loadCalculatorState().then((state) => {
      if (state) {
        setDisplayValue(state.displayValue || '0');
        setHistory(state.history || []);
      }
      setHasLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveCalculatorState({ displayValue, history });
    }
  }, [displayValue, history, hasLoaded]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <div className="flex justify-between items-center w-full">
            <DialogTitle>Calculator</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col">
          {history.length > 0 && (
            <div className="px-4 text-sm text-gray-500 text-right h-6">
              {history[history.length - 1]}
            </div>
          )}
          <Input
            className="text-right text-[56px] sm:text-[64px] font-extrabold font-mono border-0 px-6 py-6 cursor-default bg-transparent select-none leading-none tracking-tight"
            value={displayValue}
            readOnly
            tabIndex={-1}
            onFocus={(e) => e.target.blur()}
          />
          <div className="grid grid-cols-4 gap-px bg-gray-300 dark:bg-gray-700">
            {buttons.map((button, index) => (
              <Button
                key={
                  typeof button.label === 'string'
                    ? button.label
                    : `icon-${index}`
                }
                variant="ghost"
                className={`
              h-16 rounded-none text-2xl font-light
              ${'span' in button && button.span ? 'col-span-2' : ''}
              ${button.className || ''}
            `}
                onClick={button.action}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
