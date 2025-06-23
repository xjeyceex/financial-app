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
  const [fontSize, setFontSize] = useState(48); // Reduced initial font size

  // Format number with commas
  const formatNumber = useCallback((numStr: string) => {
    if (numStr === '0') return '0';
    if (numStr === 'Error') return 'Error';

    const parts = numStr.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    return integerPart + decimalPart;
  }, []);

  // Parse number by removing commas
  const parseNumber = useCallback((numStr: string) => {
    return numStr.replace(/,/g, '');
  }, []);

  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setStoredValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setHistory([]);
    setFontSize(48);
  }, []);

  const backspace = useCallback(() => {
    const currentValue = parseNumber(displayValue);
    let newValue;

    if (
      currentValue.length <= 1 ||
      (currentValue.length === 2 && currentValue.startsWith('-'))
    ) {
      newValue = '0';
      setFontSize(48);
    } else {
      newValue = currentValue.slice(0, -1);
      // Adjust font size based on new length
      if (newValue.length <= 8) {
        setFontSize(48);
      } else if (newValue.length <= 12) {
        setFontSize(36);
      } else {
        setFontSize(28);
      }
    }

    setDisplayValue(formatNumber(newValue));
  }, [displayValue, formatNumber, parseNumber]);

  const inputDigit = useCallback(
    (digit: number) => {
      const currentValue = parseNumber(displayValue);
      let newValue;

      if (waitingForOperand) {
        newValue = String(digit);
        setWaitingForOperand(false);
      } else {
        newValue = currentValue === '0' ? String(digit) : currentValue + digit;
      }

      // Count digits ignoring decimal point and negative sign
      const digitCount = newValue.replace(/[^0-9]/g, '').length;

      // Adjust font size based on pure digit count (before commas are added)
      setFontSize(
        digitCount <= 6
          ? 48 // Full size for up to 6 digits (e.g., 500,000)
          : digitCount <= 8
            ? 36 // Medium size for 7-8 digits (e.g., 5,000,000)
            : 28 // Smaller size for 9+ digits (e.g., 500,000,000)
      );

      setDisplayValue(formatNumber(newValue));
    },
    [displayValue, waitingForOperand, formatNumber, parseNumber]
  );

  const inputDot = useCallback(() => {
    const currentValue = parseNumber(displayValue);

    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      setFontSize(48);
    } else if (!currentValue.includes('.')) {
      const newValue = currentValue + '.';
      setDisplayValue(formatNumber(newValue));

      // Adjust font size if needed
      if (newValue.length > 8) {
        setFontSize(36);
      }
      if (newValue.length > 12) {
        setFontSize(28);
      }
    }
  }, [displayValue, waitingForOperand, formatNumber, parseNumber]);

  const performCalculation = useCallback((): number => {
    const prev = parseFloat(parseNumber(storedValue!));
    const current = parseFloat(parseNumber(displayValue));

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
  }, [displayValue, storedValue, operation, parseNumber]);

  const handleOperation = useCallback(
    (nextOperation: string) => {
      if (waitingForOperand) {
        setOperation(nextOperation);
        return;
      }

      if (storedValue === null) {
        setStoredValue(parseNumber(displayValue));
      } else if (operation) {
        const result = performCalculation();
        const resultStr = Number.isNaN(result) ? 'Error' : String(result);
        setDisplayValue(formatNumber(resultStr));
        setStoredValue(resultStr);
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
      formatNumber,
      parseNumber,
    ]
  );

  const performOperation = useCallback(() => {
    if (!operation || storedValue === null) return;

    const result = performCalculation();
    const resultStr = Number.isNaN(result) ? 'Error' : String(result);

    setHistory((prev) => [
      ...prev.slice(-3),
      `${formatNumber(storedValue)} ${operation} ${formatNumber(parseNumber(displayValue))} = ${formatNumber(resultStr)}`,
    ]);

    setDisplayValue(formatNumber(resultStr));
    setStoredValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [
    displayValue,
    operation,
    storedValue,
    performCalculation,
    formatNumber,
    parseNumber,
  ]);

  const toggleSign = useCallback(() => {
    const currentValue = parseNumber(displayValue);
    setDisplayValue(formatNumber(String(parseFloat(currentValue) * -1)));
  }, [displayValue, formatNumber, parseNumber]);

  const getOperationButtonClass = (op: string) =>
    `h-[54px] rounded-full text-lg font-light flex items-center justify-center w-full transition-all duration-200 active:scale-95
  ${
    operation === op
      ? 'bg-[#FF9EB7] text-white shadow-[0_0_6px_2px] shadow-pink-200'
      : 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90'
  }`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (/\d/.test(key)) inputDigit(parseInt(key));
      else if (key === '.' || key === ',') inputDot();
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
      className: getOperationButtonClass('÷'),
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
      className: getOperationButtonClass('×'),
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
      className: getOperationButtonClass('-'),
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
      className: getOperationButtonClass('+'),
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
      className: 'bg-[#FF9EB7] text-white hover:bg-[#FF9EB7]/90',
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

          {/* Display area with iPhone-like disappearing effect */}
          <div className="relative px-4 py-4 w-full">
            <div className="w-full min-h-[56px] overflow-hidden">
              <div className="absolute inset-y-0 right-4 left-0 flex justify-end items-center">
                <div
                  className="text-white font-thin font-mono leading-none tracking-tight whitespace-nowrap overflow-hidden"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1,
                    transition: 'font-size 0.2s ease',
                    maxWidth: '100%',
                    direction: 'rtl',
                    textAlign: 'left',
                    maskImage:
                      'linear-gradient(90deg, transparent 0%, black 15px)',
                    WebkitMaskImage:
                      'linear-gradient(90deg, transparent 0%, black 15px)',
                    paddingLeft: '15px',
                    letterSpacing: '-0.5px', // Tighter spacing for better fit
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
