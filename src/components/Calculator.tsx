import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadCalculatorState, saveCalculatorState } from '@/lib/indexedDB';
import { FiDelete, FiDivide, FiMinus, FiPlus, FiX } from 'react-icons/fi';

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
  const [fontSize, setFontSize] = useState(64); // Initial font size

  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setStoredValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setHistory([]);
    setFontSize(64); // Reset font size when clearing
  }, []);

  const backspace = useCallback(() => {
    if (
      displayValue.length <= 1 ||
      (displayValue.length === 2 && displayValue.startsWith('-'))
    ) {
      setDisplayValue('0');
      setFontSize(64); // Reset font size when back to single digit
    } else {
      setDisplayValue(displayValue.slice(0, -1));
      // Adjust font size based on new length
      if (displayValue.length - 1 <= 8) {
        setFontSize(64);
      } else if (displayValue.length - 1 <= 12) {
        setFontSize(48);
      } else {
        setFontSize(36);
      }
    }
  }, [displayValue]);

  const inputDigit = useCallback(
    (digit: number) => {
      let newValue;
      if (waitingForOperand) {
        newValue = String(digit);
        setWaitingForOperand(false);
      } else {
        newValue = displayValue === '0' ? String(digit) : displayValue + digit;
      }

      setDisplayValue(newValue);

      // Adjust font size based on length
      if (newValue.length <= 6) {
        setFontSize(56); // was 64
      } else if (newValue.length <= 10) {
        setFontSize(42); // was 48
      } else {
        setFontSize(32); // was 36
      }
    },
    [displayValue, waitingForOperand]
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      setFontSize(64);
    } else if (!displayValue.includes('.')) {
      const newValue = displayValue + '.';
      setDisplayValue(newValue);

      // Adjust font size if needed (dot doesn't usually affect length much)
      if (newValue.length > 8) {
        setFontSize(48);
      }
      if (newValue.length > 12) {
        setFontSize(36);
      }
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
      if (waitingForOperand) {
        setOperation(nextOperation);
        return;
      }

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
    [
      displayValue,
      operation,
      storedValue,
      performCalculation,
      waitingForOperand,
    ]
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
      className: 'bg-[#D4D4D2] text-black hover:bg-[#D4D4D2]/90',
    },
    {
      label: <FiDelete size={20} />,
      action: backspace,
      className: 'bg-[#D4D4D2] text-black hover:bg-[#D4D4D2]/90',
    },
    {
      label: '±',
      action: toggleSign,
      className: 'bg-[#D4D4D2] text-black hover:bg-[#D4D4D2]/90',
    },
    {
      label: <FiDivide size={20} />,
      action: () => handleOperation('÷'),
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90', // Light pink
    },
    {
      label: '7',
      action: () => inputDigit(7),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '8',
      action: () => inputDigit(8),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '9',
      action: () => inputDigit(9),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: <FiX size={20} />,
      action: () => handleOperation('×'),
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90', // Light pink
    },
    {
      label: '4',
      action: () => inputDigit(4),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '5',
      action: () => inputDigit(5),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '6',
      action: () => inputDigit(6),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: <FiMinus size={20} />,
      action: () => handleOperation('-'),
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90', // Light pink
    },
    {
      label: '1',
      action: () => inputDigit(1),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '2',
      action: () => inputDigit(2),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '3',
      action: () => inputDigit(3),
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: <FiPlus size={20} />,
      action: () => handleOperation('+'),
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90', // Light pink
    },
    {
      label: '0',
      action: () => inputDigit(0),
      className:
        'bg-[#505050] text-white hover:bg-[#505050]/90 justify-start pl-6',
      span: true,
    },
    {
      label: '.',
      action: inputDot,
      className: 'bg-[#505050] text-white hover:bg-[#505050]/90',
    },
    {
      label: '=',
      action: performOperation,
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90', // Light pink
    },
  ];

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
      <DialogContent className="w-[280px] p-3 rounded-[30px] bg-black text-white border-none shadow-lg">
        <DialogHeader className="px-3 pt-3">
          <div className="flex justify-between items-center w-full">
            <DialogTitle className="text-white text-lg">Calculator</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col">
          {history.length > 0 && (
            <div className="px-4 text-xs text-gray-500 text-right h-5 truncate">
              {history[history.length - 1]}
            </div>
          )}

          {/* Display area */}
          <div className="relative px-4 py-4 w-full">
            <div className="w-full min-h-[56px] overflow-hidden">
              <div className="absolute inset-y-0 right-4 left-0 flex justify-end items-center">
                <div
                  className="text-white font-thin font-mono leading-none tracking-tight whitespace-nowrap pr-2"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1,
                    transition: 'font-size 0.2s ease',
                    maxWidth: '100%',
                    direction: 'ltr',
                  }}
                >
                  {displayValue}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-1.5 bg-black px-2 w-full">
            {buttons.map((button, index) => (
              <Button
                key={
                  typeof button.label === 'string'
                    ? button.label
                    : `icon-${index}`
                }
                variant="ghost"
                className={`
                h-[54px] rounded-full text-lg font-light flex items-center justify-center
                ${'span' in button && button.span ? 'col-span-2 w-full' : 'w-full'}
                ${button.className || ''}
                transition-colors duration-150
                min-w-0
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
