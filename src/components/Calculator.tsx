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
      label: 'AC',
      action: clearAll,
      className: 'bg-[#D4D4D2] text-black',
    },
    {
      label: <FiDelete size={20} />,
      action: backspace,
      className: 'bg-[#D4D4D2] text-black',
    },
    {
      label: '±',
      action: toggleSign,
      className: 'bg-[#D4D4D2] text-black',
    },
    {
      label: <FiDivide size={20} />,
      action: () => handleOperation('÷'),
      className: 'bg-[#FF9500] text-white',
    },
    {
      label: '7',
      action: () => inputDigit(7),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '8',
      action: () => inputDigit(8),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '9',
      action: () => inputDigit(9),
      className: 'bg-[#505050] text-white',
    },
    {
      label: <FiX size={20} />,
      action: () => handleOperation('×'),
      className: 'bg-[#FF9500] text-white',
    },
    {
      label: '4',
      action: () => inputDigit(4),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '5',
      action: () => inputDigit(5),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '6',
      action: () => inputDigit(6),
      className: 'bg-[#505050] text-white',
    },
    {
      label: <FiMinus size={20} />,
      action: () => handleOperation('-'),
      className: 'bg-[#FF9500] text-white',
    },
    {
      label: '1',
      action: () => inputDigit(1),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '2',
      action: () => inputDigit(2),
      className: 'bg-[#505050] text-white',
    },
    {
      label: '3',
      action: () => inputDigit(3),
      className: 'bg-[#505050] text-white',
    },
    {
      label: <FiPlus size={20} />,
      action: () => handleOperation('+'),
      className: 'bg-[#FF9500] text-white',
    },
    {
      label: '0',
      action: () => inputDigit(0),
      className: 'bg-[#505050] text-white col-span-2 justify-start pl-6',
      span: true,
    },
    {
      label: '.',
      action: inputDot,
      className: 'bg-[#505050] text-white',
    },
    {
      label: '=',
      action: performOperation,
      className: 'bg-[#FF9500] text-white',
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
      <DialogContent className="w-full max-w-[360px] p-4 rounded-[40px] overflow-hidden bg-black text-white border-none shadow-none">
        <DialogHeader className="px-4 pt-4">
          <div className="flex justify-between items-center w-full">
            <DialogTitle className="text-white">Calculator</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col overflow-hidden">
          {' '}
          {/* Added overflow-hidden here */}
          {history.length > 0 && (
            <div className="px-4 text-sm text-gray-500 text-right h-6 truncate">
              {' '}
              {/* Added truncate */}
              {history[history.length - 1]}
            </div>
          )}
          {/* Display container */}
          <div className="relative px-6 py-6">
            <div className="w-full min-h-[72px] overflow-hidden">
              <div className="w-full max-w-full overflow-hidden text-right">
                <div
                  className="text-white font-thin font-mono leading-none tracking-tight text-right inline-block text-[clamp(28px,8vw,64px)] select-none pointer-events-none"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    direction: 'rtl',
                  }}
                >
                  {displayValue}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-black px-2">
            {' '}
            {/* Added px-2 for padding */}
            {buttons.map((button, index) => (
              <Button
                key={
                  typeof button.label === 'string'
                    ? button.label
                    : `icon-${index}`
                }
                variant="ghost"
                className={`
                  h-[60px] w-[60px] m-1 rounded-full text-xl font-light flex items-center justify-center
                  ${'span' in button && button.span ? 'col-span-2 w-[130px]' : ''}
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
