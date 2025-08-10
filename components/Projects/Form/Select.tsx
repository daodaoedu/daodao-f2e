import { useState } from 'react';
import { cn } from '@/utils/cn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * @typedef {Object} Option
 * @type {Option[]}
 * @property {string} label - Required, option text to show, e.g. "全部計畫"
 * @property {string} value - Required, option value, e.g. "all"
 */

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  className?: string;
  isDisabled: boolean;
}

const Select = ({ options, className, isDisabled = false }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('全部計畫');
  const handleSelect = (label: string) => {
    setSelectedLabel(label);
    setIsOpen(false);
  };

  if (!options.length) {
    console.error('no option');
    return false;
  }

  return (
    <div className={cn(
      'relative inline-block w-full',
      className
    )}
    >
      <button
        disabled={isDisabled}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'block w-full px-4 py-2 text-left',
          'rounded-lg shadow-sm flex flex-row items-center justify-between',
          'focus:outline-none focus:ring-0 focus:ring-primary-base',
          isDisabled
            ? 'text-white bg-primary-lighter'
            : 'text-basic-400 bg-primary-lightest'
        )}
      >
        {selectedLabel}
        <span>
          <KeyboardArrowDownIcon
            className={cn(
              'w-5 h-5',
              'transform transition-transform ease-linear',
              isOpen ? 'rotate-180' : 'rotate-0',
              isDisabled ? 'text-white' : 'text-gray-400'
            )}
          />
        </span>

      </button>
      <ul className={cn(
        'absolute left-0',
        'w-full mt-2 p-[10px] overflow-hidden bg-white',
        'border border-gray-300',
        'transition-all duration-300 ease-in transform',
        'rounded-md shadow-lg',
        isOpen
          ? 'max-h-64 opacity-100 scale-y-100'
          : 'max-h-0 opacity-0 scale-y-95'
      )}
      >
        {options.map((option) => (
          <li
            key={option.value}
            className="px-0"
          >
            <button
              type="button"
              className={cn(
                'w-full px-2 py-2 rounded-[5px] text-basic-400 text-left',
                'hover:bg-primary-lightest hover:cursor-pointer',
                'focus:bg-primary-lightest focus:ring-0 focus:outline-none'
              )}
              onClick={() => handleSelect(option.label)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Select;
