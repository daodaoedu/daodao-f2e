import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface MultiSelectDropdownProps {
  listItems: { label: string, value: string }[];
  selectedItems: string[];
  placeholder: string;
  name: string;
  onChange: (name: string, value: string[]) => void;
}

export default function MultiSelectDropdown({
  listItems = [],
  selectedItems = [],
  placeholder,
  name,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const handleChange = (selectedValue: string) => {
    let newSelectedItems;
    if (selectedItems.includes(selectedValue)) {
      newSelectedItems = selectedItems.filter((selectedItem: string) => selectedItem !== selectedValue);
      onChange(name, newSelectedItems);
    } else {
      onChange(name, [...selectedItems, selectedValue]);
    }
  };

  const handleToggleDropdown = () => setOpen((prevState) => !prevState);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Space') {
      handleToggleDropdown();
    }
  };

  return (
    <div className="relative w-full max-w-full">
      <button
        type="button"
        className={cn(
          'flex w-full cursor-pointer flex-nowrap items-center justify-between gap-3',
          'rounded-md border border-gray-300 bg-white px-4 py-3',
          'font-sans text-sm text-basic-500',
          'transition-all duration-200',
          'hover:border-primary-base',
          'focus:outline-none focus:ring-1 focus:ring-primary-base focus:border-primary-base',
          open && 'ring-1 ring-primary-base border-primary-base'
        )}
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls="dropdown-list"
        aria-haspopup="true"
      >
        <span className={cn(
          'truncate text-left flex-1',
          selectedItems.length === 0 && 'text-basic-300'
        )}>
          {
        selectedItems.length > 0
          ? selectedItems
            .map((selectedValue) => listItems.find((listItem) => listItem.value === selectedValue)?.label)
            .filter(Boolean)
            .join(', ')
          : placeholder
}
        </span>

        <ChevronDown className={cn(
          'size-4 text-basic-400 transition-transform duration-200 flex-shrink-0',
          open && 'rotate-180'
        )} />
      </button>

      {open && (
        <div
          id="dropdown-list"
          role="listbox"
          className="absolute z-10 mt-2 flex max-h-60 w-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl"
        >
          <div className="overflow-y-auto p-1">
            {listItems.map((listItem) => (
              <button
                type="button"
                key={listItem.value}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-md cursor-pointer',
                  'font-sans text-sm transition-colors duration-150',
                  'hover:bg-primary-pale',
                  selectedItems.includes(listItem.value)
                    ? 'bg-primary-lightest text-primary-darker font-medium'
                    : 'bg-white text-basic-500'
                )}
                onClick={() => handleChange(listItem.value)}
                role="option"
                aria-selected={selectedItems.includes(listItem.value)}
              >
                <div className="flex items-center gap-2">
                  {selectedItems.includes(listItem.value) && (
                    <div className="size-1.5 rounded-full bg-primary-base flex-shrink-0" />
                  )}
                  <span className={cn(
                    selectedItems.includes(listItem.value) ? '' : 'pl-3.5'
                  )}>
                    {listItem.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
