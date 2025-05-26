import { useRef } from 'react';
import LensIcon from '@/public/assets/icons/lens.svg';

interface SearchInputProps {
  onChange: (value: string) => void;
}

export default function SearchInput({ onChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="basis-1/2 relative">
      <LensIcon
        className="absolute top-[0.625rem] left-4"
        onClick={onClickFocus}
      />
      <input
        ref={inputRef}
        type="search"
        placeholder="想找什麼資源..."
        className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
