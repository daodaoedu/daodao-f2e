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

  const handleToggleDropdown = () => {
    return setOpen((prevState) => !prevState);
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Space') {
      handleToggleDropdown();
    }
  };

  return (
    <div className="relative max-w-full w-full">
      <button
        type="button"
        className="w-full bg-primary-lightest p-2 rounded-md cursor-pointer flex justify-between items-center gap-2 flex-nowrap font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-controls="dropdown-list"
        aria-haspopup="true"
      >
        <span className="truncate">{
        selectedItems.length > 0 ?
          selectedItems
          .map((selectedValue) => {
            return listItems.find((listItem) => listItem.value === selectedValue)?.label;
          })
          .filter(Boolean)
          .join(', ')
          :
          placeholder}
        </span>

        <KeyboardArrowDownIcon />
      </button>

      {open && (
        <div
          id="dropdown-list"
          role="listbox"
          className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow-lg z-10 flex flex-col gap-2 p-2"
        >
          {listItems.map((listItem) => (
            <button
              type="button"
              key={listItem.value}
              className={cn(
                'p-2 rounded-[4px] cursor-pointer hover:bg-teal-200 font-sans text-sm',
                selectedItems.includes(listItem.value) ?
                'bg-primary-lightest text-primary-base'
                :
                'bg-white text-basic-400'
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
