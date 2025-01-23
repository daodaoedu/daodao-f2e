import { useState } from 'react';
import { cn } from '@/utils/cn';

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
  const [selectedLabel, setSelectedLabel] = useState("全部計畫");
  const handleSelect = (label: string) => {
    setSelectedLabel(label);
    setIsOpen(false);
  };

  if (!options.length) {
    console.error('no option');
    return false;
  }

  return (
    <div className={cn(`relative inline-block w-full`, className)}>
      <button
        disabled={isDisabled}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          block w-full px-4 py-2 text-left
          rounded-lg shadow-sm 
          focus:outline-none focus:ring-0 focus:ring-primary-base
          ${isDisabled ?
            'text-white bg-primary-lighter'
            :
            'text-basic-400 bg-primary-lightest '}
        `}
      >
        {selectedLabel}
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <svg
            className={`
              w-5 h-5 transition-transform ease-linear 
              ${isOpen ? 'rotate-180' : ''}
              ${isDisabled ? 'text-white' : 'text-gray-400'}
            `}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <ul className={`absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden transition-all duration-300 ease-in transform p-[10px]
        ${isOpen ?
          "max-h-64 opacity-100 scale-y-100"
          :
          "max-h-0 opacity-0 scale-y-95"}`
      }
      >
        {options.map((option) => (
          <li
            key={option.value}
            onClick={() => handleSelect(option.label)}
            className="px-4 py-2 rounded-[5px]
              text-basic-400
              hover:bg-primary-lightest
              cursor-pointer"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Select;
