import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cn } from '@/utils/cn';

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
        className="flex w-full cursor-pointer flex-nowrap items-center justify-between gap-2 rounded-md bg-primary-lightest p-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls="dropdown-list"
        aria-haspopup="true"
      >
        <span className="truncate">
          {
        selectedItems.length > 0
          ? selectedItems
            .map((selectedValue) => listItems.find((listItem) => listItem.value === selectedValue)?.label)
            .filter(Boolean)
            .join(', ')
          : placeholder
}
        </span>

        <KeyboardArrowDownIcon />
      </button>

      {open && (
        <div
          id="dropdown-list"
          role="listbox"
          className="absolute z-10 mt-1 flex max-h-40 w-full flex-col gap-2 overflow-y-auto rounded-md border border-gray-300 bg-white p-2 shadow-lg"
        >
          {listItems.map((listItem) => (
            <button
              type="button"
              key={listItem.value}
              className={cn(
                'p-2 rounded-[4px] cursor-pointer hover:bg-teal-200 font-sans text-sm',
                selectedItems.includes(listItem.value)
                  ? 'bg-primary-lightest text-primary-base'
                  : 'bg-white text-basic-400'
              )}
              onClick={() => handleChange(listItem.value)}
              role="option"
              aria-selected={selectedItems.includes(listItem.value)}
            >
              {listItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
